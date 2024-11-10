import { getCurrMonthlyBudget } from "../app/actions";
import { createServersideClient } from "@/utils/supabase/server";

// Mock the Supabase client and Next.js cache functions
jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe("getCurrMonthlyBudget", () => {
  let mockSupabase;
  let consoleErrorMock;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    createServersideClient.mockReturnValue(mockSupabase);

    consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch the current monthly budget successfully", async () => {
    const mockUser = { id: "user123" };
    const mockMonthlyBudget = {
      id: 1,
      budget_id: 1,
      month: new Date().toISOString(),
    };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.single.mockResolvedValue({
      data: mockMonthlyBudget,
      error: null,
    });

    const result = await getCurrMonthlyBudget(1);

    expect(result).toEqual(mockMonthlyBudget);
    expect(mockSupabase.from).toHaveBeenCalledWith("monthly_budgets");
    expect(mockSupabase.select).toHaveBeenCalledWith("*");
    expect(mockSupabase.eq).toHaveBeenCalledWith("budget_id", 1);
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await getCurrMonthlyBudget(1);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("User authentication failed or user not found");
  });

  it("should handle database errors", async () => {
    const mockUser = { id: "user123" };
    const dbError = new Error("Database error");

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: dbError,
    });

    const result = await getCurrMonthlyBudget(1);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Database error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching current monthly budgets: ",
      dbError
    );
  });
});