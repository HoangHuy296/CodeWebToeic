import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './app/query-client';
import { AuthProvider } from './app/providers/auth-provider';
import { LanguageProvider } from './app/providers/language-provider';
import { NotificationProvider } from './app/providers/notification-provider';
import { ThemeProvider } from './app/providers/theme-provider';
import { router } from './routes/router';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <NotificationProvider>
              <RouterProvider router={router} />
            </NotificationProvider>
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
