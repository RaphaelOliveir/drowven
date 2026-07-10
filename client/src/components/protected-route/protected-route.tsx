import { ReactElement, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCurrentUser } from '../../store/auth-slice';
import { Spinner } from '../spinner/spinner';

export function ProtectedRoute({ children }: { children: ReactElement }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isAuthenticated && !user && !loading) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, loading, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading && !user) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-primary)' }}>
        <Spinner />
      </div>
    );
  }

  return children;
}
