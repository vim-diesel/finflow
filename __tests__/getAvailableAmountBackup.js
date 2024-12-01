// This is just a backup, in case the Typescript version gets too
// complex. This is the original Javascript version of the test.

// import { getAvailableAmount } from "../app/actions";
// import { createClient } from "@/utils/supabase/server";

// It seems we need seperate tests to test the error being returned from each
// database query. This is because the function returns after the first error
// and the other queries are not executed.

// Mock the Supabase client
/* jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

describe("getAvailableAmount", () => {
  let mockSupabase;
  let consoleErrorMock;

  // Common mock data
  const mockData = {
    transactions: [
      { transaction_type: "inflow", amount: 1000 },
      { transaction_type: "outflow", amount: 300, category_id: 1 },
      { transaction_type: "outflow", amount: 200, category_id: null },
    ],
    monthlyBudgets: [{ id: 1 }],
    monthlyCategoryDetails: [
      { amount_assigned: 400 },
      { amount_assigned: 100 },
    ],
  };

  // Helper function to create mock database responses
  const createMockTableResponse = (data, error = null) => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data, error }),
  });

  // Helper function to mock database calls
  const mockDatabaseCalls = (tableResponses) => {
    return (table) => {
      const response = tableResponses[table];
      return createMockTableResponse(response.data, response.error);
    };
  };

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "user123" } },
        }),
      },
      from: jest.fn(),
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
    mockSupabase.from.mockImplementation(
      mockDatabaseCalls({
        transactions: { data: mockData.transactions },
        monthly_budgets: { data: mockData.monthlyBudgets },
        monthly_category_details: { data: mockData.monthlyCategoryDetails },
      }),
    );

    const result = await getAvailableAmount(1, new Date());
    expect(result).toEqual(300);
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await getAvailableAmount(1, new Date());
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("User authentication failed or user not found");
  });

  const testDatabaseError = (tableName) => {
    it(`should handle database errors on ${tableName} table`, async () => {
      const dbError = new Error("Database error");
      const tableResponses = {
        transactions: { data: mockData.transactions },
        monthly_budgets: { data: mockData.monthlyBudgets },
        monthly_category_details: { data: mockData.monthlyCategoryDetails },
      };

      // Override the specific table with error
      tableResponses[tableName] = { data: null, error: dbError };

      mockSupabase.from.mockImplementation(mockDatabaseCalls(tableResponses));

      const result = await getAvailableAmount(1, new Date());
      expect(result).toBeInstanceOf(Error);
      expect(result.message).toBe("Database error");
      expect(consoleErrorMock).toHaveBeenCalledWith(
        `Error fetching ${tableName.replace(/_/g, " ")}: `,
        dbError,
      );
    });
  };

  ["transactions", "monthly_budgets", "monthly_category_details"].forEach(
    testDatabaseError,
  );
});
 */
