import { createDefaultBudget } from "../app/actions";
import { createServersideClient } from "@/utils/supabase/server";
import { AppError } from "@/app/errors";

jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Define the structure of the mocked Supabase client
type SupabaseClientMock = {
  auth: {
    getUser: jest.Mock;
  };
  from: jest.Mock;
  insert: jest.Mock;
  select: jest.Mock;
  single: jest.Mock;
};

describe("createDefaultBudget", () => {
  let mockSupabase: SupabaseClientMock;
  let consoleErrorMock: jest.SpyInstance;

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
    (createServersideClient as jest.Mock).mockReturnValue(mockSupabase);

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
      user_id: mockUser.id,
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
      user_id: mockUser.id,
    });
    expect(mockSupabase.select).toHaveBeenCalled();
    expect(mockSupabase.single).toHaveBeenCalled();
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await createDefaultBudget();

    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.message).toBe(
        "User authentication failed or user not found",
      );
    }
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

    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.message).toBe("Database error");
    }
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error creating budget: ",
      mockError,
    );
  });

  it("should use default budget name if none provided", async () => {
    const mockUser = { id: "user123" };
    const mockBudget = {
      id: 1,
      name: "My Budget",
      user_id: mockUser.id,
    };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.single.mockResolvedValue({
      data: mockBudget,
      error: null,
    });

    const result = await createDefaultBudget();

    expect(result).toEqual(mockBudget);
    expect(mockSupabase.from).toHaveBeenCalledWith("budgets");
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      name: "My Budget",
      user_id: mockUser.id,
    });
    expect(mockSupabase.select).toHaveBeenCalled();
    expect(mockSupabase.single).toHaveBeenCalled();
  });
});
