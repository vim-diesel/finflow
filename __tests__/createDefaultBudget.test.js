import { createDefaultBudget } from "../app/actions";
import { createServersideClient } from "@/utils/supabase/server";

jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(), 
}));

describe("createDefaultBudget", () => {
  let mockSupabase;
  let consoleErrorMock;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
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

  it("should create a default budget successfully", async () => {
    const mockUser = { id: "user123" };
    const mockBudget = {
      id: 1,
      name: "My Budget",
      user_id: mockUser.id
    };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.single.mockResolvedValue({
      data: mockBudget,
      error: null,
    });

    const result = await createDefaultBudget("My Budget");

    expect(result).toEqual(mockBudget);
    expect(mockSupabase.from).toHaveBeenCalledWith("budgets");
    expect(mockSupabase.insert).toHaveBeenCalledWith({ 
      name: "My Budget",
      user_id: mockUser.id 
    });
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await createDefaultBudget();

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("User authentication failed or user not found");
  });

  it("should handle database errors", async () => {
    const mockUser = { id: "user123" };
    const mockError = new Error("Database error");

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await createDefaultBudget();

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Database error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error creating budget: ",
      mockError
    );
  });

  it("should use default budget name if none provided", async () => {
    const mockUser = { id: "user123" };
    const mockBudget = {
      id: 1,
      name: "My Budget",
      user_id: mockUser.id
    };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.single.mockResolvedValue({
      data: mockBudget,
      error: null,
    });

    await createDefaultBudget();

    expect(mockSupabase.insert).toHaveBeenCalledWith({
      name: "My Budget",
      user_id: mockUser.id
    });
  });
});