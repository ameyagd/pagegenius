import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
// import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPageManager from './components/LandingPageManager';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LandingPageManager />} />
            <Route path="/" element={<ProtectedRoute><LandingPageManager /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
