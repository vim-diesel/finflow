import { addTransaction } from "../app/actions";
import { createClientServer } from "@/utils/supabase/server";

// Mock the Supabase client
jest.mock("@/utils/supabase/server", () => ({
  createClientServer: jest.fn(),
}));

describe("addTransaction", () => {
  let mockSupabase;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn(),
    };
    createClientServer.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should add a valid transaction", async () => {
    const mockUser = { id: "user123" };
    const mockTransaction = {
      id: 1,
      amount: 100,
      transaction_type: "income",
    };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.insert.mockResolvedValue({
      data: mockTransaction,
      error: null,
    });

    const result = await addTransaction(1, 100, "inflow");

    expect(result).toEqual(mockTransaction);
    expect(mockSupabase.from).toHaveBeenCalledWith("transactions");
    expect(mockSupabase.insert).toHaveBeenCalledWith({
      budget_id: 1,
      user_id: "user123",
      amount: 100,
      transaction_type: "inflow",
      category_id: undefined,
      date: expect.any(String),
      memo: "",
      cleared: true,
      payee: null,
    });
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await addTransaction(1, 100, "inflow");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Cannot find user");
  });

  it("should reject negative amounts", async () => {
    const mockUser = { id: "user123" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

    const result = await addTransaction(1, -100, "inflow");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Transaction amount must be non-negative");
  });

  it("should reject invalid transaction types", async () => {
    const mockUser = { id: "user123" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

    const result = await addTransaction(1, 100, "INVALID_TYPE");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Invalid transaction type");
  });

  it("should handle database errors", async () => {
    const mockUser = { id: "user123" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.insert.mockResolvedValue({
      data: null,
      error: new Error("Database error"),
    });

    const result = await addTransaction(1, 100, "inflow");
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Database error");
  });
});
