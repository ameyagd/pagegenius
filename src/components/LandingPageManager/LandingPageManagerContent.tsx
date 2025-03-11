import React, { useState, useEffect } from 'react';
import { Button, Input, Space, Modal, Select, message, Card, Row, Col, Statistic, Tag, Typography } from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    LineChartOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import LandingPagesTable from './components/LandingPages/LandingPagesTable';
import { fetchLandingPages, fetchCustomers, fetchDomains, fetchLandingPage, findTopPerformingPage } from './api/services';
import { LandingPage } from './types';
import LandingPageEditor from './components/LandingPages/LandingPageEditor';
import AnalyticsDrawer from './components/LandingPages/AnalyticsDrawer';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface LandingPageManagerContentProps {
    onPageCreated?: (pageId: string) => void;
    onPageUpdated?: (pageId: string) => void;
    partnerInfo?: {
        id: string;
        name: string;
        email: string;
    };
}

const LandingPageManagerContent: React.FC<LandingPageManagerContentProps> = ({
    onPageCreated,
    onPageUpdated,
    partnerInfo = {
        id: '1',
        name: 'Default Partner',
        email: 'partner@example.com',
    },
}) => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [pageToDuplicate, setPageToDuplicate] = useState<LandingPage | null>(null);
    const [isCreateMode, setIsCreateMode] = useState(false);
    const [editPageId, setEditPageId] = useState<string | null>(null);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [quickAnalyticsPage, setQuickAnalyticsPage] = useState<string | null>(null);
    const [isLoadingTopPage, setIsLoadingTopPage] = useState(false);
    const [topPerformingPageId, setTopPerformingPageId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Filter states for the landing pages
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [selectedDomainId, setSelectedDomainId] = useState<string>('');

    // Determine if we're in edit mode
    const isEditMode = !!editPageId;

    // Determine if we should show the landing pages list or the editor
    const showEditor = isCreateMode || isEditMode || isDuplicating;

    // Fetch customers
    const { data: customers = [] } = useQuery({
        queryKey: ['customers', partnerInfo.id],
        queryFn: () => fetchCustomers(partnerInfo.id),
    });

    // Fetch domains for selected customer in filter
    const { data: domains = [] } = useQuery({
        queryKey: ['domains', selectedCustomerId],
        queryFn: () => fetchDomains(selectedCustomerId),
        enabled: !!selectedCustomerId,
    });

    // Fetch landing pages with filters and add mock rejected campaigns
    const { data: fetchedLandingPages = [], isLoading } = useQuery({
        queryKey: ['landingPages', searchTerm, partnerInfo.id, selectedCustomerId, selectedDomainId],
        queryFn: () => fetchLandingPages(searchTerm, partnerInfo.id, selectedCustomerId, selectedDomainId),
    });

    // All landing pages (including rejected ones) are now fetched from the services.ts file
    const landingPages = fetchedLandingPages;

    // Calculate statistics
    const totalPages = landingPages.length;
    const approvedPages = landingPages.filter((page) => page.status === 'approved').length;
    const underReviewPages = landingPages.filter((page) => page.status === 'under_review').length;
    const rejectedPages = landingPages.filter((page) => page.status === 'rejected').length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'green';
            case 'rejected':
                return 'red';
            case 'under_review':
                return 'orange';
            default:
                return 'default';
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const handleCreatePage = () => {
        setIsCreateMode(true);
    };

    const handleEditPage = (pageId: string) => {
        setEditPageId(pageId);
        setIsDuplicating(false);
    };

    const handleCloseEditor = () => {
        setIsCreateMode(false);
        setEditPageId(null);
        setIsDuplicating(false);
        setPageToDuplicate(null);
        setTopPerformingPageId(null);
    };

    const handleDuplicate = (page: LandingPage) => {
        setPageToDuplicate(page);
        setIsDuplicating(true);
    };

    const handleCustomerFilterChange = (value: string) => {
        setSelectedCustomerId(value);
        setSelectedDomainId(''); // Reset domain when customer changes
    };

    const handleDomainFilterChange = (value: string) => {
        setSelectedDomainId(value);
    };

    const handleViewTopPerformingPage = async () => {
        try {
            setIsLoadingTopPage(true);
            const topPageId = await findTopPerformingPage();

            if (topPageId) {
                // Set the top performing page ID
                setTopPerformingPageId(topPageId);

                // Open the page in edit mode to view its content
                handleEditPage(topPageId);
                message.success('Showing top performing landing page based on conversion value');
            } else {
                message.info('No approved landing pages found to analyze');
            }
        } catch (error) {
            message.error('Failed to find top performing page');
            console.error(error);
        } finally {
            setIsLoadingTopPage(false);
        }
    };

    const handlePageCreated = (pageId: string) => {
        setIsCreateMode(false);
        setIsDuplicating(false);
        setPageToDuplicate(null);
        if (onPageCreated) {
            onPageCreated(pageId);
        }
    };

    const handlePageUpdated = (pageId: string) => {
        setEditPageId(null);
        if (onPageUpdated) {
            onPageUpdated(pageId);
        }
    };

    // Render the landing pages list view
    const renderLandingPagesList = () => {
        return (
            <>
                {/* Bento Layout for Statistics
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title='Total Landing Pages' value={totalPages} prefix={<FileTextOutlined />} valueStyle={{ color: '#1890ff' }} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title='Approved Pages' value={approvedPages} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title='Under Review' value={underReviewPages} prefix={<ClockCircleOutlined />} valueStyle={{ color: '#faad14' }} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card>
                            <Statistic title='Rejected Pages' value={rejectedPages} prefix={<CloseCircleOutlined />} valueStyle={{ color: '#f5222d' }} />
                        </Card>
                    </Col>
                </Row>
                 */}

                {/* Recent Activity and Quick Actions 
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} md={16}>
                        <Card title='Recent Activity'>
                            {landingPages.slice(0, 5).map((page) => (
                                <div key={page.id} style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <Text strong>{page.title}</Text>
                                        <br />
                                        <Text type='secondary'>
                                            {new Date(page.updatedAt).toLocaleDateString()} -
                                            <Tag color={getStatusColor(page.status)} style={{ marginLeft: 8 }}>
                                                {page.status.replace('_', ' ')}
                                            </Tag>
                                        </Text>
                                    </div>
                                    <Space>
                                        <Button size='small' icon={<LineChartOutlined />} onClick={() => setQuickAnalyticsPage(page.id)} />
                                    </Space>
                                </div>
                            ))}
                            {landingPages.length === 0 && !isLoading && <Text type='secondary'>No landing pages found</Text>}
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card title='Quick Actions'>
                            <Space direction='vertical' style={{ width: '100%' }}>
                                <Button type='primary' icon={<PlusOutlined />} block onClick={handleCreatePage}>
                                    Create New Landing Page
                                </Button>
                                {!isCreateMode && (
                                    <Button 
                                        icon={<LineChartOutlined />} 
                                        block 
                                        onClick={handleViewTopPerformingPage}
                                        loading={isLoadingTopPage}
                                        disabled={landingPages.length === 0}
                                    >
                                        View Top Performing Page
                                    </Button>
                                )}
                            </Space>
                        </Card>
                    </Col>
                </Row>
                */}

                {/* Customer and Domain Filters */}
                <Card style={{ marginBottom: 16 }}>
                    <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Space size='large'>
                            <div>
                                <Text strong>Customer:</Text>
                                <Select
                                    style={{ width: 200, marginLeft: 8 }}
                                    placeholder='All Customers'
                                    allowClear
                                    value={selectedCustomerId || undefined}
                                    onChange={handleCustomerFilterChange}
                                >
                                    {customers.map((customer) => (
                                        <Option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Text strong>Domain:</Text>
                                <Select
                                    style={{ width: 200, marginLeft: 8 }}
                                    placeholder='All Domains'
                                    allowClear
                                    disabled={!selectedCustomerId}
                                    value={selectedDomainId || undefined}
                                    onChange={handleDomainFilterChange}
                                >
                                    {domains.map((domain) => (
                                        <Option key={domain.id} value={domain.id}>
                                            {domain.name}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </Space>
                        <Space>
                            <Search
                                id='search-input'
                                placeholder='Search by title, content or keywords'
                                allowClear
                                enterButton={<SearchOutlined />}
                                size='middle'
                                onSearch={handleSearch}
                                style={{ width: 300 }}
                            />
                            <Button type='primary' icon={<PlusOutlined />} onClick={handleCreatePage}>
                                Create Landing Page
                            </Button>
                        </Space>
                    </Space>
                </Card>

                {/* Landing Pages Table */}
                <Card>
                    <LandingPagesTable
                        data={landingPages}
                        isLoading={isLoading}
                        onDuplicate={handleDuplicate}
                        onPageUpdated={handlePageUpdated}
                        onEditPage={handleEditPage}
                    />
                </Card>
            </>
        );
    };

    // Render the editor view
    const renderEditor = () => {
        return (
            <LandingPageEditor
                mode={isCreateMode ? 'create' : isEditMode ? 'edit' : 'duplicate'}
                pageId={editPageId || undefined}
                pageToDuplicate={pageToDuplicate}
                isTopPerforming={topPerformingPageId === editPageId}
                onClose={handleCloseEditor}
                partnerInfo={partnerInfo}
                onPageCreated={handlePageCreated}
                onPageUpdated={handlePageUpdated}
            />
        );
    };

    const handleLogout = () => {
        // Call the logout function to clear authentication state
        logout();
        // The parent component (LandingPageManagerLoginPage) will detect the authentication
        // state change and show the login form automatically
        console.log('User logged out successfully');
        // We don't need to navigate here as the authentication state change will
        // trigger the conditional rendering in the parent component
    };

    return (
        <MainLayout title="" partnerInfo={partnerInfo} onLogout={handleLogout}>
            {showEditor ? renderEditor() : renderLandingPagesList()}

            {/* Quick Analytics Drawer */}
            {quickAnalyticsPage && (
                <AnalyticsDrawer
                    visible={!!quickAnalyticsPage}
                    onClose={() => setQuickAnalyticsPage(null)}
                    pageId={quickAnalyticsPage}
                    onEdit={() => {
                        handleEditPage(quickAnalyticsPage);
                        setQuickAnalyticsPage(null);
                    }}
                />
            )}
        </MainLayout>
    );
};

export default LandingPageManagerContent;
