import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { getCategoryGroups } from "../actions/actions";
import { createClient } from "@/utils/supabase/server";
import { AppError } from "@/errors/errors";

// Mock the Supabase client
jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

// Define the structure of the mocked Supabase client
type SupabaseClientMock = {
  auth: {
    getUser: jest.Mock;
  };
  from: jest.Mock;
  select: jest.Mock;
  eq: jest.Mock;
};

describe("getCategoryGroups", () => {
  let mockSupabase: SupabaseClientMock;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn(),
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

  it("should return category groups when user is authenticated", async () => {
    const mockUser = { id: "test-user-id" };
    const mockCategoryGroups = [
      { id: 1, name: "Group 1", budget_id: 1 },
      { id: 2, name: "Group 2", budget_id: 1 },
    ];

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    mockSupabase.eq.mockResolvedValue({
      data: mockCategoryGroups,
      error: null,
    });

    const result = await getCategoryGroups(1);
    expect(result).toEqual(mockCategoryGroups);
    expect(mockSupabase.from).toHaveBeenCalledWith("category_groups");
  });

  it("should return error when user is not authenticated", async () => {
    const mockError = new AuthError(
      "User authentication failed or user not found",
      401,
      "error",
    );

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: mockError,
    });

    const result = await getCategoryGroups(1);
    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.name).toBe("AUTH_ERROR");
      expect(result.message).toBe(
        "User authentication failed or user not found",
      );
    }
  });

  it("should return error when database query fails", async () => {
    const mockError: PostgrestError = {
      name: "error",
      message: "Database query failed",
      details: "Details",
      hint: "Hint",
      code: "code",
    };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 1 } } });
    mockSupabase.eq.mockResolvedValue({ data: null, error: mockError });

    const result = await getCategoryGroups(1);
    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.name).toBe("PG_ERROR");
      expect(result.message).toBe("Database query failed");
    }
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching category groups: ",
      mockError,
    );
  });
});
