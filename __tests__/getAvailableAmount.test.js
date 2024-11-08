import { getAvailableAmount } from "../app/actions";
import { createServersideClient } from "@/utils/supabase/server";

// Mock the Supabase client
jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

describe("getAvailableAmount", () => {
  let mockSupabase;
  let consoleErrorMock;

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest
          .fn()
          .mockResolvedValue({ data: { user: { id: "user123" } } }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            lte: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }),
    };
    createServersideClient.mockReturnValue(mockSupabase);

    consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return the available amount for a valid budget and month", async () => {
    const mockTransactions = [
      { transaction_type: "inflow", amount: 1000 },
      { transaction_type: "outflow", amount: 300, category_id: 1 },
      { transaction_type: "outflow", amount: 200, category_id: null },
    ];

    const mockMonthlyBudgets = [{ id: 1 }];

    const mockMonthlyCategoryDetails = [
      { amount_assigned: 400 },
      { amount_assigned: 100 },
    ];

    // Mock the three separate database calls
    mockSupabase.from.mockImplementation((table) => {
      switch (table) {
        case "transactions":
          return {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            order: jest
              .fn()
              .mockResolvedValue({ data: mockTransactions, error: null }),
          };
        case "monthly_budgets":
          return {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            order: jest
              .fn()
              .mockResolvedValue({ data: mockMonthlyBudgets, error: null }),
          };
        case "monthly_category_details":
          return {
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            lte: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockMonthlyCategoryDetails,
              error: null,
            }),
          };
      }
    });

    const result = await getAvailableAmount(1, new Date());

    // Expected available amount: 1000 - (400 + 100) - 200 = 300
    expect(result).toEqual(300);

    expect(mockSupabase.from).toHaveBeenCalledWith("transactions");
    expect(mockSupabase.from).toHaveBeenCalledWith("monthly_budgets");
    expect(mockSupabase.from).toHaveBeenCalledWith("monthly_category_details");
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await getAvailableAmount(1, new Date());
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("User authentication failed or user not found");
  });

  it("should handle database errors", async () => {
    // Mock the database error
    const dbError = new Error("Database error");

    // Mock the three separate database calls
    mockSupabase.from.mockImplementation((table) => {
      const mockReturn = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: dbError }),
      };

      return mockReturn;
    });

    const result = await getAvailableAmount(1, new Date());

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Database error");

    // Verify that from was called for each table in the correct order
    expect(mockSupabase.from.mock.calls[0][0]).toBe("transactions");

    // Verify that console.error was called with the correct message
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching transactions: ",
      dbError,
    );
    // The function should return after the first error, so these won't be called
    // expect(consoleErrorMock).toHaveBeenCalledWith(
    //   "Error fetching monthly budgets: ",
    //   dbError
    // );
    // expect(consoleErrorMock).toHaveBeenCalledWith(
    //   "Error fetching monthly category details: ",
    //   dbError
    // );
  });
});
