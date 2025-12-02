import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

// Test users credentials
export const TEST_USERS = {
  ALICE: { email: 'alice@test.com', password: 'password123' },
  BOB: { email: 'bob@test.com', password: 'password123' },
  CHARLIE: { email: 'charlie@test.com', password: 'password123' }
};

// Mock Supabase client for testing
export function createTestSupabaseClient() {
  return {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
    },
  };
}

// Helper to sign in test user (mock implementation)
export async function signInTestUser(email: string) {
  const mockUser = {
    id: 'test-user-id',
    email,
    user_metadata: { name: 'Test User' },
  };
  
  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  };

  return {
    user: mockUser,
    session: mockSession,
  };
}

// Helper to sign out (mock implementation)
export async function signOutTestUser() {
  // Mock implementation - in real tests this would clear session
  return Promise.resolve();
}

// Custom render with providers
// interface TestUser extends User {
//     // Add any additional properties if needed
//     [key: string]: any;
// }
// interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {}

export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions = {}
) {
  // const { ...renderOptions } = options;
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';