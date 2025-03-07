import { Layout, Select, Space, Button, Typography, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCustomers, fetchDomains } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { partner, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  // Fetch customers for the current partner
  const { data: customers = [] } = useQuery({
    queryKey: ['customers', partner?.id],
    queryFn: () => fetchCustomers(partner?.id || ''),
    enabled: !!partner?.id,
  });

  // Fetch domains for the selected customer
  const { data: domains = [] } = useQuery({
    queryKey: ['domains', selectedCustomerId],
    queryFn: () => fetchDomains(selectedCustomerId || ''),
    enabled: !!selectedCustomerId,
  });

  // Set first customer and domain as default if none selected
  useEffect(() => {
    if (customers.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (domains.length > 0 && !selectedDomainId) {
      setSelectedDomainId(domains[0].id);
    }
  }, [domains, selectedDomainId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      <Header style={{ 
        background: '#fff', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        width: '100%'
      }}>
        <Title level={3} style={{ margin: 0 }}>Page Genius</Title>
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="Select Customer"
            value={selectedCustomerId}
            onChange={setSelectedCustomerId}
            options={customers.map(c => ({ label: c.name, value: c.id }))}
          />
          <Select
            style={{ width: 200 }}
            placeholder="Select Domain"
            value={selectedDomainId}
            onChange={setSelectedDomainId}
            options={domains.map(d => ({ label: d.name, value: d.id }))}
            disabled={!selectedCustomerId}
          />
          <Space>
            <Avatar icon={<UserOutlined />} />
            <span>{partner?.name}</span>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>Logout</Button>
          </Space>
        </Space>
      </Header>
      <Content style={{ padding: '24px', background: '#f0f2f5', width: '100%' }}>
        <div style={{ background: '#fff', padding: '24px', minHeight: 280, width: '100%' }}>
          <Title level={4}>{title}</Title>
          {children}
        </div>
      </Content>
      <Footer style={{ textAlign: 'center', width: '100%' }}>Page Genius ©{new Date().getFullYear()}</Footer>
    </Layout>
  );
};

export default MainLayout; 