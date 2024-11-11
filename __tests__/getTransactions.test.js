import { getTransactions } from "../app/actions";
import { createServersideClient } from "@/utils/supabase/server";
import { AppError } from "../app/errors";
import { PostgrestError } from "@supabase/supabase-js";

// Mock the Supabase client
jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

describe("getTransactions", () => {
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
      order: jest.fn(),
    };
    createServersideClient.mockReturnValue(mockSupabase);

    // Mock console.error to suppress error messages in test output
    consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch transactions successfully", async () => {
    const mockUser = { id: "user123" };
    const mockTransactions = [
      {
        id: 1,
        amount: 100,
        transaction_type: "inflow",
        date: "2023-10-01",
        budget_id: 1,
      },
      {
        id: 2,
        amount: 50,
        transaction_type: "outflow",
        date: "2023-10-02",
        budget_id: 1,
      },
    ];

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.order.mockResolvedValue({
      data: mockTransactions,
      error: null,
    });

    const result = await getTransactions(1);

    // Check that result is not an instance of AppError
    expect(result).not.toBeInstanceOf(AppError);

    // If result is AppError, fail the test
    if (result instanceof AppError) {
      fail(`Expected Transaction[], but received AppError: ${result.message}`);
    } else {
      expect(result).toEqual(mockTransactions);
      expect(mockSupabase.from).toHaveBeenCalledWith("transactions");
      expect(mockSupabase.select).toHaveBeenCalledWith("*");
      expect(mockSupabase.eq).toHaveBeenCalledWith("budget_id", 1);
      expect(mockSupabase.order).toHaveBeenCalledWith("date", {
        ascending: false,
      });
    }
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await getTransactions(1);

    expect(result).toBeInstanceOf(AppError);
    expect(result.name).toBe("AUTH_ERROR");
    expect(result.message).toBe("User authentication failed or user not found");
  });

  it("should handle database errors", async () => {
    const mockUser = { id: "user123" };
    const mockError = {
      message: "Database error",
      code: "42501", // Example Postgres error code for insufficient privilege
      details: null,
      hint: null,
    };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.order.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await getTransactions(1);

    expect(result).toBeInstanceOf(AppError);
    expect(result.name).toBe("PG_ERROR");
    expect(result.message).toBe("Database error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching transactions: ",
      mockError
    );
  });

  it("should handle empty result set", async () => {
    const mockUser = { id: "user123" };
    const mockTransactions = [];

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.order.mockResolvedValue({
      data: mockTransactions,
      error: null,
    });

    const result = await getTransactions(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });
});
