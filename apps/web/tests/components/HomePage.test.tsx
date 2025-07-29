import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { useState } from 'react';
import { HomePage } from '../../src/pages/HomePage';
import type { AppRouter } from '../../../api/src/routes/trpc';

// Create a mock tRPC client
const trpc = createTRPCReact<AppRouter>();

// Mock the trpc utils import
vi.mock('@/utils/trpc', () => ({
  trpc: {
    battles: {
      create: {
        useMutation: vi.fn(),
      },
      get: {
        useQuery: vi.fn(),
      },
    },
  },
}));

// Test wrapper component that provides tRPC context
function TestWrapper({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3001/api/trpc',
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

describe('HomePage', () => {
  const mockCreateMutation = {
    mutate: vi.fn(),
    isPending: false,
    error: null,
    data: null,
    isError: false,
    isIdle: true,
    isSuccess: false,
    variables: undefined,
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    context: undefined,
    failureCount: 0,
    failureReason: null,
    status: 'idle' as const,
    trpc: {} as any,
  };

  const mockGetQuery = {
    data: null,
    error: null,
    isFetching: false,
    refetch: vi.fn(),
    isError: false,
    isPending: false,
    isLoading: false,
    isLoadingError: false,
    isRefetchError: false,
    isSuccess: false,
    isInitialLoading: false,
    isRefetching: false,
    isStale: false,
    status: 'pending' as const,
    fetchStatus: 'idle' as const,
    dataUpdatedAt: 0,
    errorUpdatedAt: 0,
    failureCount: 0,
    failureReason: null,
    errorUpdateCount: 0,
    isFetched: false,
    isFetchedAfterMount: false,
    isPlaceholderData: false,
    isPreviousData: false,
    trpc: {} as any,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock the tRPC hooks
    const { trpc: mockTrpc } = await import('@/utils/trpc');
    
    vi.mocked(mockTrpc.battles.create.useMutation).mockReturnValue(mockCreateMutation as any);
    vi.mocked(mockTrpc.battles.get.useQuery).mockReturnValue(mockGetQuery as any);
  });

  it('renders correctly with default values', () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('AI Rap Battle')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CodeRapper')).toBeInTheDocument();
    expect(screen.getByDisplayValue('AlgoMC')).toBeInTheDocument();
    expect(screen.getByText('Create Battle')).toBeInTheDocument();
  });

  it('shows validation error when creating battle with empty inputs', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    // Clear the default values
    const aiOneInput = screen.getByDisplayValue('CodeRapper');
    const aiTwoInput = screen.getByDisplayValue('AlgoMC');
    
    fireEvent.change(aiOneInput, { target: { value: '' } });
    fireEvent.change(aiTwoInput, { target: { value: '' } });

    const createButton = screen.getByText('Create Battle');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter both AI rapper names')).toBeInTheDocument();
    });

    expect(mockCreateMutation.mutate).not.toHaveBeenCalled();
  });

  it('shows validation error when one input is empty', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const aiTwoInput = screen.getByDisplayValue('AlgoMC');
    fireEvent.change(aiTwoInput, { target: { value: '' } });

    const createButton = screen.getByText('Create Battle');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter both AI rapper names')).toBeInTheDocument();
    });

    expect(mockCreateMutation.mutate).not.toHaveBeenCalled();
  });

  it('calls create mutation with correct input format', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create Battle');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateMutation.mutate).toHaveBeenCalledWith(
        {
          ai_one: 'CodeRapper',
          ai_two: 'AlgoMC',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });
  });

  it('handles successful battle creation', async () => {
    const mockSuccessData = { battle_id: 'test-battle-123' };
    
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create Battle');
    fireEvent.click(createButton);

    // Simulate successful response
    await waitFor(() => {
      const calls = mockCreateMutation.mutate.mock.calls[0];
      if (calls && calls[1] && typeof calls[1] === 'object' && 'onSuccess' in calls[1]) {
        calls[1].onSuccess(mockSuccessData);
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Battle created! ID: test-battle-123')).toBeInTheDocument();
    });
  });

  it('handles battle creation error', async () => {
    const mockError = { message: 'Network error' };
    
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const createButton = screen.getByText('Create Battle');
    fireEvent.click(createButton);

    // Simulate error response
    await waitFor(() => {
      const calls = mockCreateMutation.mutate.mock.calls[0];
      if (calls && calls[1] && typeof calls[1] === 'object' && 'onError' in calls[1]) {
        calls[1].onError(mockError);
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Error: Network error')).toBeInTheDocument();
    });
  });

  it('trims whitespace from inputs before sending', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const aiOneInput = screen.getByDisplayValue('CodeRapper');
    const aiTwoInput = screen.getByDisplayValue('AlgoMC');
    
    fireEvent.change(aiOneInput, { target: { value: '  SpacedRapper  ' } });
    fireEvent.change(aiTwoInput, { target: { value: '  PaddedMC  ' } });

    const createButton = screen.getByText('Create Battle');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockCreateMutation.mutate).toHaveBeenCalledWith(
        {
          ai_one: 'SpacedRapper',
          ai_two: 'PaddedMC',
        },
        expect.any(Object)
      );
    });
  });

  it('shows loading state during battle creation', () => {
    mockCreateMutation.isPending = true;
    
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled();
  });

  it('handles battle retrieval', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const battleIdInput = screen.getByPlaceholderText('Enter battle ID');
    fireEvent.change(battleIdInput, { target: { value: 'test-battle-id' } });

    const getInfoButton = screen.getByText('Get Info (Check Console)');
    fireEvent.click(getInfoButton);

    await waitFor(() => {
      expect(mockGetQuery.refetch).toHaveBeenCalled();
    });
  });

  it('validates battle ID input before fetching', async () => {
    render(
      <TestWrapper>
        <HomePage />
      </TestWrapper>
    );

    const getInfoButton = screen.getByText('Get Info (Check Console)');
    fireEvent.click(getInfoButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a battle ID or create a battle first')).toBeInTheDocument();
    });

    expect(mockGetQuery.refetch).not.toHaveBeenCalled();
  });
});

// Integration test that tests the actual tRPC request format
describe('HomePage Integration - Request Format', () => {
  it('should format tRPC request correctly', async () => {
    // Mock fetch to capture the actual request
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ result: { data: { battle_id: 'test-123' } } }]),
    });
    
    global.fetch = mockFetch;

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const trpcClient = trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3001/api/trpc',
        }),
      ],
    });

    render(
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <HomePage />
        </QueryClientProvider>
      </trpc.Provider>
    );

    const createButton = screen.getByText('Create Battle');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    // Verify the request was made with correct format
    const fetchCall = mockFetch.mock.calls[0];
    if (!fetchCall) throw new Error('Expected fetch to be called');
    const [url, options] = fetchCall;
    
    expect(url).toBe('http://localhost:3001/api/trpc/battles.create');
    expect(options.method).toBe('POST');
    expect(options.headers['content-type']).toBe('application/json');
    
    const requestBody = JSON.parse(options.body);
    expect(requestBody).toEqual({
      ai_one: 'CodeRapper',
      ai_two: 'AlgoMC',
    });
  });
});
