
import { handleActiveCompany } from './useUser';
import { supabase } from './supabase-client';

// Mock React and Next Router
jest.mock('react', () => ({
  useEffect: jest.fn(),
  useState: jest.fn(),
  createContext: jest.fn(),
  useContext: jest.fn(),
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock Supabase
jest.mock('./supabase-client', () => {
  const mockEq = jest.fn();
  const mockSelect = jest.fn();
  const mockUpdate = jest.fn();
  const mockFrom = jest.fn();
  const mockMatch = jest.fn();

  // Create a single chain object to be returned by all calls
  // This allows us to access the spies from the test via supabase.from()
  const mockChain = {
    select: mockSelect,
    update: mockUpdate,
    eq: mockEq,
    match: mockMatch
  };

  mockFrom.mockReturnValue(mockChain);
  mockSelect.mockReturnValue(mockChain);
  mockUpdate.mockReturnValue(mockChain);
  // Default return for eq, can be overridden in test
  mockEq.mockReturnValue(Promise.resolve({ data: [], error: null }));
  mockMatch.mockReturnValue(Promise.resolve({ data: [], error: null }));

  return {
    supabase: {
      from: mockFrom
    }
  };
});

describe('handleActiveCompany Performance', () => {
  let mockEq;
  let mockUpdate;

  beforeEach(() => {
    jest.clearAllMocks();

    // Retrieve the inner mocks
    // Since mockFrom returns the chain object, we can get it.
    // Note: We need to call it once to get the return value if we want to access the properties,
    // or we can rely on the fact that the factory created them.
    // But wait, accessing supabase.from() will invoke the mock and return the chain.
    // The chain has the update/eq methods which are also mocks.

    const chain = supabase.from();
    mockEq = chain.eq;
    mockUpdate = chain.update;

    // Reset the implementation of eq to default
    mockEq.mockResolvedValue({ data: [], error: null });
  });

  it('should use optimized batch update', async () => {
    // Setup initial data: 3 active companies
    const activeCompanies = [
      { company_id: '1', active_company: true },
      { company_id: '2', active_company: true },
      { company_id: '3', active_company: true },
    ];

    // mockEq implementation doesn't need to return data for select anymore,
    // because we are not selecting. But keeping it robust is fine.
    mockEq.mockImplementation((field, value) => {
        if (field === 'active_company' && value === true) {
             // In optimized code, this is used for update filtering too.
            return Promise.resolve({ data: activeCompanies });
        }
        return Promise.resolve({ data: [], error: null });
    });

    await handleActiveCompany('new-id');

    // Optimized code:
    // 1. update companies set active=false where active_company=true
    // 2. update companies set active=true where id = new-company-id
    // Total updates: 2

    console.log(`Update calls detected: ${mockUpdate.mock.calls.length}`);

    expect(mockUpdate).toHaveBeenCalledTimes(2);
  });
});
