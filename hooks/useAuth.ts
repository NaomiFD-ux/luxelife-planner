import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, getCurrentUser } from '../services/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

/**
 * Custom hook to manage authentication state
 * Usage:
 *
 * const { user, loading, isAuthenticated } = useAuth();
 *
 * if (loading) return <LoadingSpinner />;
 * if (!isAuthenticated) return <LoginPage />;
 *
 * return <Dashboard user={user} />;
 */
export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    // Initial load check
    setLoading(false);

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: user !== null
  };
};
