'use client';

import * as React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { QueryProvider } from './query-provider';
import { useAppDispatch } from '../store/hooks';
import { setCredentials, logout, setInitialized } from '../store/slices/auth.slice';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    async function restoreSession() {
      try {
        // Attempt silent refresh via httpOnly cookie
        const { data: refreshData } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshData.accessToken;

        // Fetch user profile with the new access token
        const { data: userData } = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${newAccessToken}` },
          withCredentials: true,
        });

        dispatch(
          setCredentials({
            user: userData,
            accessToken: newAccessToken,
          })
        );
      } catch {
        dispatch(logout());
      } finally {
        dispatch(setInitialized(true));
      }
    }

    restoreSession();
  }, [dispatch]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryProvider>
        <AuthInitializer>{children}</AuthInitializer>
      </QueryProvider>
    </Provider>
  );
}

