import { updateAssigned } from "../app/actions";
import { createClient } from "@/utils/supabase/server";

jest.mock("@/utils/supabase/server", () => ({
  createServersideClient: jest.fn(),
}));

describe("updateAssigned", () => {
  let mockSupabase;
  let consoleErrorMock;

  beforeEach(() => {
    // Create chainable mock methods
    const mockUpdate = jest.fn().mockReturnThis();
    const mockEq = jest.fn();

    // Set up final return value for the chain
    mockEq
      .mockReturnValueOnce({ update: mockUpdate, eq: mockEq }) // First eq call
      .mockResolvedValueOnce({ data: null, error: null }); // Second eq call

    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
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

  it("should update assigned amount successfully", async () => {
    const mockUser = { id: "user123" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

    const result = await updateAssigned(1, 1, 100);

    expect(result).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith("monthly_category_details");
    expect(mockSupabase.from().update).toHaveBeenCalledWith({
      amount_assigned: 100,
    });
    expect(mockSupabase.from().eq).toHaveBeenNthCalledWith(
      1,
      "monthly_budget_id",
      1,
    );
    expect(mockSupabase.from().eq).toHaveBeenNthCalledWith(2, "category_id", 1);
  });

  it("should reject unauthenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const result = await updateAssigned(1, 1, 100);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("User authentication failed or user not found");
  });

  it("should reject negative amounts", async () => {
    const mockUser = { id: "user123" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

    const result = await updateAssigned(1, 1, -100);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe("Assigned amount must be non-negative");
  });

  it("should handle database errors", async () => {
    const mockUser = { id: "user123" };
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });

    // Setup error case
    const mockError = new Error("Database error");
    const mockEq = jest.fn();
    mockEq
      .mockReturnValueOnce({ update: jest.fn().mockReturnThis(), eq: mockEq })
      .mockResolvedValueOnce({ data: null, error: mockError });

    mockSupabase.from.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: mockEq,
    });

    const result = await updateAssigned(1, 1, 100);

    expect(result).toBeInstanceOf(Error);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error updating assigned amount: ",
      mockError,
    );
  });
});
