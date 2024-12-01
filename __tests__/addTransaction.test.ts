import { AppError } from "@/errors/errors";
import { addTransaction } from "../actions/actions";
import { createClient } from "@/utils/supabase/server";
import { AuthError, PostgrestError } from "@supabase/supabase-js";

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
  insert: jest.Mock;
};

describe("addTransaction", () => {
  let mockSupabase: SupabaseClientMock;
  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    // Initialize the mocked Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn(),
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

  it("should add a valid transaction", async () => {
    const mockUser = { id: "user123" };
    const mockTransaction = {
      id: 1,
      amount: 100,
      transaction_type: "inflow",
      date: "2023-10-01T00:00:00.000Z",
      budget_id: 1,
    };

    // Mock authentication to return a valid user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock the insert operation to return the mock transaction
    mockSupabase.insert.mockResolvedValue({
      data: mockTransaction,
      error: null,
    });

    // Call the function under test
    const result = await addTransaction(1, 100, "inflow");

    // Assert that the result is not an AppError
    expect(result).not.toBeInstanceOf(AppError);
    expect(result).toEqual(null);

    // Verify that Supabase client methods were called with correct arguments
    expect(mockSupabase.from).toHaveBeenCalledWith("transactions");
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      budget_id: 1,
      amount: 100,
      transaction_type: "inflow",
      date: "2024-11-14",
      category_id: null,
      cleared: true,
      note: "",
      payee: null,
      user_id: "user123",
    });
  });

  it("should return AppError if user is not authenticated", async () => {
    const authError = new AuthError("Authentication session missing", 401);

    // Mock authentication to simulate an unauthenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: authError,
    });

    // Call the function under test
    const result = await addTransaction(1, 100, "inflow");

    // Assert that the result is an instance of AppError
    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.name).toBe("AUTH_ERROR");
      expect(result.message).toBe(
        "User authentication failed or user not found",
      );
      expect(result.code).toBe("UNKNOWN_CODE");
      expect(result.status).toBe(500);
    }

    // Verify that console.error was called with the correct message
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error authenticating user: ",
      authError.message,
    );
  });

  it("should return AppError if there is a database error", async () => {
    const mockUser = { id: "user123" };
    const dbError: PostgrestError = {
      name: "PostgrestError",
      message: "Database error",
      code: "42501", // Example Postgres error code for insufficient privilege
      details: "",
      hint: "",
    };

    // Mock authentication to return a valid user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock the insert operation to return a database error
    mockSupabase.insert.mockResolvedValue({
      data: null,
      error: dbError,
    });

    // Call the function under test
    const result = await addTransaction(1, 100, "inflow");

    // Assert that the result is an instance of AppError
    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.name).toBe("PG_ERROR");
      expect(result.message).toBe("Database error");
      expect(result.code).toBe("42501");
    }

    // Verify that console.error was called with the correct message
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error inserting transaction: ",
      dbError,
    );
  });
});
