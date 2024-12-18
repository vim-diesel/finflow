import { AppError } from "@/errors/errors";
import { getDefaultBudget } from "../actions/actions";
import { createServersideClient } from "@/utils/supabase/server";
import { AuthError } from "@supabase/supabase-js";

type SupabaseClientMock = {
  auth: {
    getUser: jest.Mock;
  };
  from: jest.Mock;
  select: jest.Mock;
  limit: jest.Mock;
  single: jest.Mock;
};

// Mock revalidatePath to avoid static generation store error
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Mock the Supabase client
jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
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
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    (createServersideClient as jest.Mock).mockReturnValue(mockSupabase);

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
    mockSupabase.single.mockResolvedValue({
      data: mockBudget,
      error: null,
    });

    const result = await getDefaultBudget();

    expect(result).toEqual(mockBudget);
    expect(mockSupabase.from).toHaveBeenCalledWith("budgets");
    expect(mockSupabase.select).toHaveBeenCalledWith("*");
  });

  it("should return error if user is not authenticated", async () => {
    // Mock the response to simulate an unauthenticated user
    const mockAuthError = new AuthError("Authentication session missing", 401);

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: mockAuthError,
    });

    const result = await getDefaultBudget();
    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.name).toBe("AUTH_ERROR");
    }
  });

  it("should return error if there is an error fetching budgets", async () => {
    const mockUser = { id: "user123" };
    const mockPGError = new AppError(
      "PG_ERROR",
      "Database error",
      "PG500",
      500,
    );

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.single.mockResolvedValue({
      data: null,
      error: mockPGError,
    });

    const result = await getDefaultBudget();
    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.name).toBe("PG_ERROR");
      expect(result.message).toBe("Database error");
    }
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching budgets: ",
      mockPGError,
    );
  });
});
