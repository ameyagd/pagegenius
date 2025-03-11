import { Layout, Space, Typography, Avatar, Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { fetchCustomers, fetchDomains } from '../../api/services';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
    children: React.ReactNode;
    title: string;
    partnerInfo: {
        id: string;
        name: string;
        email: string;
    };
    onLogout?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, partnerInfo, onLogout }) => {
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

    // Fetch customers for the current partner
    const { data: customers = [] } = useQuery({
        queryKey: ['customers', partnerInfo.id],
        queryFn: () => fetchCustomers(partnerInfo.id),
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

    return (
        <Layout style={{ minHeight: '100vh', width: '100%' }}>
            <Header
                style={{
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <Title level={3} style={{ margin: 0 }}>
                    LanderVerse
                </Title>
                <Space>
                    <Space>
                        <Avatar icon={<UserOutlined />} />
                        <span>{partnerInfo.name}</span>
                        {onLogout && (
                            <Button icon={<LogoutOutlined />} onClick={onLogout}>Logout</Button>
                        )}
                    </Space>
                </Space>
            </Header>
            <Content style={{ background: '#f0f2f5', width: 'auto', margin: '5px 15px' }}>
                <div style={{ background: '#fff', padding: '24px', minHeight: 280, width: '100%', marginTop: '10px' }}>
                    {/* <Title level={4}>{title}</Title> */}
                    {children}
                </div>
            </Content>
            <Footer style={{ textAlign: 'center', width: '100%' }}>LanderVerse ©{new Date().getFullYear()}</Footer>
        </Layout>
    );
};

export default MainLayout;
