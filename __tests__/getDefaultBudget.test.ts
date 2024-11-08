import { getDefaultBudget } from "../app/actions";
import { revalidatePath } from "next/cache";

type SupabaseClientMock = {
  auth: {
    getUser: jest.Mock;
  };
  from: jest.Mock;
  select: jest.Mock;
};

// Mock revalidatePath to avoid static generation store error
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
import { createClientServer } from "@/utils/supabase/server";

// Mock the Supabase client
jest.mock("@/utils/supabase/server", () => ({
  createClientServer: jest.fn(),
}));

describe("getDefaultBudget", () => {
  let mockSupabase: SupabaseClientMock;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn(),
    };
    (createClientServer as jest.Mock).mockReturnValue(mockSupabase);

    // Mock console.error to suppress error messages in test output
    consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the default budget", async () => {
    const mockUser = { id: "user123" };
    const mockBudget = { id: 1, name: "Test Budget" };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.select.mockResolvedValue({
      data: [mockBudget],
      error: null,
    });

    const result = await getDefaultBudget();

    expect(result).toEqual(mockBudget);
    expect(mockSupabase.from).toHaveBeenCalledWith("budgets");
    expect(mockSupabase.select).toHaveBeenCalledWith("*");
  });

  it("should return error if user is not authenticated", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await getDefaultBudget();
    expect(result).toBeInstanceOf(Error);
    // if (result instanceof Error) {
    //   expect(result.message).toBe("User authentication failed or user not found");
    // }
`    expect(result!.message).toBe("User authentication failed or user not found");`
  });

  it("should return error if there is an error fetching budgets", async () => {
    const mockUser = { id: "user123" };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.select.mockResolvedValue({
      data: null,
      error: new Error("Database error"),
    });

    const result = await getDefaultBudget();
    expect(result).toBeInstanceOf(Error);
    expect(consoleErrorMock).toHaveBeenCalledWith("Error fetching budgets: ", expect.any(Error));
  });
});