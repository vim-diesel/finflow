import { getCategoryGroups } from '../app/actions';
import { createServersideClient } from '@/utils/supabase/server';

// Mock the Supabase client
jest.mock('@/utils/supabase/server', () => ({
  createServersideClient: jest.fn()
}));

describe('getCategoryGroups', () => {
  const mockBudgetId = 1;
  const mockUser = { id: 'test-user-id' };
  const mockCategoryGroups = [
    { id: 1, name: 'Group 1', budget_id: 1 },
    { id: 2, name: 'Group 2', budget_id: 1 }
  ];

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it('should return category groups when user is authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: mockCategoryGroups, error: null })
    };

    createServersideClient.mockReturnValue(mockSupabase);

    const result = await getCategoryGroups(mockBudgetId);
    expect(result).toEqual(mockCategoryGroups);
    expect(mockSupabase.from).toHaveBeenCalledWith('category_groups');
  });

  it('should return error when user is not authenticated', async () => {
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } })
      }
    };

    createServersideClient.mockReturnValue(mockSupabase);

    const result = await getCategoryGroups(mockBudgetId);
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe('User authentication failed or user not found');
  });

  it('should return error when database query fails', async () => {
    const mockError = new Error('Database error');
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } })
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: mockError })
    };

    createServersideClient.mockReturnValue(mockSupabase);

    const result = await getCategoryGroups(mockBudgetId);
    expect(result).toEqual(mockError);
  });
});