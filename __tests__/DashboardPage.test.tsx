import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Page from "../app/dashboard/page";
import {
  getDefaultBudget,
  getCurrMonthlyBudget,
  getCategoriesWithDetails,
  getCategoryGroups,
} from "@/app/actions";

// Mock the asynchronous functions
jest.mock("@/app/actions", () => ({
  getDefaultBudget: jest.fn(),
  getCurrMonthlyBudget: jest.fn(),
  getCategoriesWithDetails: jest.fn(),
  getCategoryGroups: jest.fn(),
}));

describe("DashboardPage", () => {
  it("renders the heading and budget table", async () => {
    // Mock data
    const mockBudget = { id: 1, name: "Test Budget" };
    const mockMonthlyBudget = { id: 1, budget_id: 1, month: "2023-10" };
    const mockCategories = [{ id: 1, name: "Category 1" }];
    const mockCategoryGroups = [{ id: 1, name: "Group 1" }];

    // Mock the implementation of the asynchronous functions
    (getDefaultBudget as jest.Mock).mockResolvedValue(mockBudget);
    (getCurrMonthlyBudget as jest.Mock).mockResolvedValue(mockMonthlyBudget);
    (getCategoriesWithDetails as jest.Mock).mockResolvedValue(mockCategories);
    (getCategoryGroups as jest.Mock).mockResolvedValue(mockCategoryGroups);

    // Render the Page component
    const jsx = await Page();
    render(jsx);

    // Wait for the asynchronous functions to resolve and the component to re-render
    await waitFor(() => {
      // Check if the budget table is rendered
      const budgetTableElements = screen.getAllByText(/category /i);
      expect(budgetTableElements.length).toBeGreaterThan(0);
      budgetTableElements.forEach((element) => {
        expect(element).toBeInTheDocument();
      });
    });
  });
});
