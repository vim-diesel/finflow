import { getTransactions } from "../app/actions";
import { createServersideClient } from "@/utils/supabase/server";

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
      eq: jest.fn(),
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
      { id: 1, amount: 100, transaction_type: "inflow" },
      { id: 2, amount: 50, transaction_type: "outflow" }
    ];

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.eq.mockResolvedValue({
      data: mockTransactions,
      error: null
    });

    const result = await getTransactions(1);

    expect(result).toEqual(mockTransactions);
    expect(mockSupabase.from).toHaveBeenCalledWith("transactions");
    expect(mockSupabase.select).toHaveBeenCalledWith("*");
    expect(mockSupabase.eq).toHaveBeenCalledWith("budget_id", 1);
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await getTransactions(1);
    
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("User authentication failed or user not found");
  });

  it("should handle database errors", async () => {
    const mockUser = { id: "user123" };
    const mockError = new Error("Database error");

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.eq.mockResolvedValue({
      data: null,
      error: mockError
    });

    const result = await getTransactions(1);

    expect(result).toBeInstanceOf(Error);
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
    mockSupabase.eq.mockResolvedValue({
      data: mockTransactions,
      error: null
    });

    const result = await getTransactions(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });
});