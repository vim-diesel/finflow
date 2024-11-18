import { getCategoriesWithDetails } from "../actions/actions";
import { createServersideClient } from "@/utils/supabase/server";
import { AppError } from "@/errors/errors";
import { AuthError, PostgrestError } from "@supabase/supabase-js";
import { CategoryWithDetails } from "@/types/types";

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
  select: jest.Mock;
  eq: jest.Mock;
};

describe("getCategoriesWithDetails", () => {
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
    const mockAuthError = new AuthError("Authentication session missing", 401);
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: mockAuthError,
    });

    const result = await getCategoriesWithDetails(1);

    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.name).toBe("AUTH_ERROR");
      expect(result.message).toBe(
        "User authentication failed or user not found",
      );
    }
  });

  it("should handle database errors", async () => {
    const mockUser = { id: "user123" };
    const mockError: PostgrestError = {
      name: "PostgrestError",
      message: "Database error",
      code: "42501",
      details: "",
      hint: "",
    };

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.eq.mockResolvedValue({
      data: null,
      error: mockError,
    });

    const result = await getCategoriesWithDetails(1);

    expect(result).toBeInstanceOf(AppError);
    if (result instanceof AppError) {
      expect(result.name).toBe("PG_ERROR");
      expect(result.message).toBe("Database error");
    }
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching catories with details:",
      mockError,
    );
  });

  it("should handle empty result set", async () => {
    const mockUser = { id: "user123" };
    const mockCategories: CategoryWithDetails[] = [];

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
