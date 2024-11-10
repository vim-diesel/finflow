import { getCategoriesWithDetails } from "../app/actions";
import { createServersideClient } from "@/utils/supabase/server";

jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("getCategoriesWithDetails", () => {
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

    consoleErrorMock = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch categories with details successfully", async () => {
    const mockUser = { id: "user123" };
    const mockCategoriesWithDetails = [
      {
        id: 1,
        name: "Food",
        monthly_category_details: [
          {
            amount_assigned: 500,
            amount_spent: 300,
          },
        ],
      },
      {
        id: 2,
        name: "Transport",
        monthly_category_details: [
          {
            amount_assigned: 200,
            amount_spent: 150,
          },
        ],
      },
    ];

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.eq.mockResolvedValue({
      data: mockCategoriesWithDetails,
      error: null,
    });

    const result = await getCategoriesWithDetails(1);

    expect(result).toEqual(
      mockCategoriesWithDetails.map((category) => ({
        ...category,
        monthly_category_details: category.monthly_category_details[0],
      })),
    );
    expect(mockSupabase.from).toHaveBeenCalledWith("categories");
    expect(mockSupabase.select).toHaveBeenCalledWith(`
    *,
    monthly_category_details!inner (*)
  `);
    expect(mockSupabase.eq).toHaveBeenCalledWith(
      "monthly_category_details.monthly_budget_id",
      1,
    );
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await getCategoriesWithDetails(1);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("User authentication failed or user not found");
  });

  it("should handle database errors", async () => {
    const mockUser = { id: "user123" };
    const mockError = new Error("Database error");

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.eq.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await getCategoriesWithDetails(1);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Database error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching catories with details:",
      mockError,
    );
  });

  it("should handle empty result set", async () => {
    const mockUser = { id: "user123" };
    const mockCategories = [];

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.eq.mockResolvedValue({
      data: mockCategories,
      error: null,
    });

    const result = await getCategoriesWithDetails(1);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
  });
});
