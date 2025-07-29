import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../src/utils/trpc';
import { clientConfig } from '@repo/config/client';
import App from "../src/App";

// Create a wrapper component with all providers
function AllTheProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: `${clientConfig.apiUrl}/api/trpc`,
      }),
    ],
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

// Mock the tRPC calls
vi.mock('../src/utils/trpc', () => {
  const createTRPCReact = vi.fn(() => {
    const mockQuery = vi.fn(() => ({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }));

    const mockMutation = vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false,
    }));

    return {
      useQuery: mockQuery,
      useMutation: mockMutation,
      users: {
        list: {
          useQuery: mockQuery,
        },
        create: {
          useMutation: mockMutation,
        },
      },
      createClient: vi.fn(() => ({})),
      Provider: ({ children }: { children: React.ReactNode }) => children,
    };
  });

  return {
    trpc: createTRPCReact(),
  };
});

describe("App", () => {
  it("renders the main heading", async () => {
    render(<App />, { wrapper: AllTheProviders });
    
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /welcome to your turborepo template/i }),
      ).toBeInTheDocument();
    });
  });

  it("renders the create user button", async () => {
    render(<App />, { wrapper: AllTheProviders });
    
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /create test user/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows users section", async () => {
    render(<App />, { wrapper: AllTheProviders });
    
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /users/i })).toBeInTheDocument();
    });
  });
});