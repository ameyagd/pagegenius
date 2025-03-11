import React from 'react';
import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LandingPageManagerContent from './LandingPageManagerContent';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const { Title } = Typography;

// Create a client
const queryClient = new QueryClient();

interface LoginFormProps {
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        onLoginSuccess();
      } else {
        message.error('Invalid credentials');
      }
    } catch (error) {
      message.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2}>LanderVerse</Title>
          <Title level={4}>Partner Login</Title>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

const LandingPageManagerWithAuth: React.FC = () => {
  const { partner, logout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already authenticated
  useEffect(() => {
    if (partner) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [partner]);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    // Call the logout function from AuthContext to clear authentication state
    logout();
    // Update local authentication state to trigger re-render and show login form
    setIsAuthenticated(false);
  };

  // Default partner info for the content component
  const partnerInfo = partner ? {
    id: partner.id,
    name: partner.name,
    email: partner.email,
  } : {
    id: '',
    name: '',
    email: '',
  };

  return (
    <>
      {!isAuthenticated ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <LandingPageManagerContent 
          partnerInfo={partnerInfo} 
          onLogout={handleLogout}
        />
      )}
    </>
  );
};

const LandingPageManager: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LandingPageManagerWithAuth />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default LandingPageManager;