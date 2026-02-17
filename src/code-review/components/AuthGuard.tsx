import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getCurrentUser } from '@code-review/lib/firebase';
import { ensureUserProfile } from '@code-review/lib/user-store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      
      // Ensure user profile exists if authenticated
      if (currentUser) {
        try {
          await ensureUserProfile();
        } catch (error) {
          console.error('Failed to ensure user profile:', error);
        }
      }
      
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/code-review/login" replace />;
  }

  return <>{children}</>;
}
