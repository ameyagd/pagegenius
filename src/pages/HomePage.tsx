import { useState } from 'react';
import { Button, Input, Space, Modal, Select, message, Card, Row, Col, Statistic, Drawer, Tag, Typography } from 'antd';
import { PlusOutlined, SearchOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, LineChartOutlined, EyeOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import LandingPagesTable from '../components/LandingPages/LandingPagesTable';
import { fetchLandingPages, duplicateLandingPage, fetchCustomers, fetchDomains } from '../api/services';
import { LandingPage } from '../types';
import CreateLandingPageDrawer from '../components/LandingPages/CreateLandingPageDrawer';
import PreviewLandingPageDrawer from '../components/LandingPages/PreviewLandingPageDrawer';
import AnalyticsDrawer from '../components/LandingPages/AnalyticsDrawer';

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDuplicateModalVisible, setIsDuplicateModalVisible] = useState(false);
  const [pageToDuplicate, setPageToDuplicate] = useState<LandingPage | null>(null);
  const [targetCustomerId, setTargetCustomerId] = useState<string>('');
  const [targetDomainId, setTargetDomainId] = useState<string>('');
  const [isCreateDrawerVisible, setIsCreateDrawerVisible] = useState(false);
  const [quickViewPage, setQuickViewPage] = useState<string | null>(null);
  const [quickAnalyticsPage, setQuickAnalyticsPage] = useState<string | null>(null);

  // Fetch landing pages
  const { data: landingPages = [], isLoading } = useQuery({
    queryKey: ['landingPages', searchTerm],
    queryFn: () => fetchLandingPages(searchTerm),
  });

  // Fetch customers for duplicate modal
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetchCustomers(),
  });

  // Fetch domains for selected customer in duplicate modal
  const { data: domains = [] } = useQuery({
    queryKey: ['domains', targetCustomerId],
    queryFn: () => fetchDomains(targetCustomerId),
    enabled: !!targetCustomerId,
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: (variables: { pageId: string; customerId: string; domainId: string }) => 
      duplicateLandingPage(variables.pageId, variables.customerId, variables.domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
      message.success('Landing page duplicated successfully');
      setIsDuplicateModalVisible(false);
    },
    onError: () => {
      message.error('Failed to duplicate landing page');
    }
  });

  // Calculate statistics
  const totalPages = landingPages.length;
  const approvedPages = landingPages.filter(page => page.status === 'approved').length;
  const underReviewPages = landingPages.filter(page => page.status === 'under_review').length;
  const rejectedPages = landingPages.filter(page => page.status === 'rejected').length;

  // Find the most recent page for quick view
  const mostRecentPage = landingPages.length > 0 ? landingPages[0].id : null;
  
  // Find the most viewed page for quick analytics
  const mostViewedPage = landingPages.length > 0 ? landingPages[0].id : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'under_review': return 'orange';
      default: return 'default';
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCreatePage = () => {
    setIsCreateDrawerVisible(true);
  };

  const handleDuplicate = (page: LandingPage) => {
    setPageToDuplicate(page);
    setTargetCustomerId(page.customerId);
    setTargetDomainId(page.domainId);
    setIsDuplicateModalVisible(true);
  };

  const handleDuplicateConfirm = () => {
    if (pageToDuplicate && targetCustomerId && targetDomainId) {
      duplicateMutation.mutate({
        pageId: pageToDuplicate.id,
        customerId: targetCustomerId,
        domainId: targetDomainId,
      });
    }
  };

  const handleQuickView = () => {
    if (mostRecentPage) {
      setQuickViewPage(mostRecentPage);
    } else {
      message.info('No pages available for preview');
    }
  };

  const handleQuickAnalytics = () => {
    if (mostViewedPage) {
      setQuickAnalyticsPage(mostViewedPage);
    } else {
      message.info('No pages available for analytics');
    }
  };

  return (
    <MainLayout title="Dashboard">
      {/* Bento Layout for Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Landing Pages" 
              value={totalPages} 
              prefix={<FileTextOutlined />} 
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Approved Pages" 
              value={approvedPages} 
              prefix={<CheckCircleOutlined />} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Under Review" 
              value={underReviewPages} 
              prefix={<ClockCircleOutlined />} 
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Rejected Pages" 
              value={rejectedPages} 
              prefix={<CloseCircleOutlined />} 
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity and Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={16}>
          <Card title="Recent Activity">
            {landingPages.slice(0, 5).map(page => (
              <div key={page.id} style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>{page.title}</Text>
                  <br />
                  <Text type="secondary">
                    {new Date(page.updatedAt).toLocaleDateString()} - 
                    <Tag color={getStatusColor(page.status)}>
                      {page.status.replace('_', ' ')}
                    </Tag>
                  </Text>
                </div>
                <Space>
                  <Button 
                    size="small" 
                    icon={<EyeOutlined />} 
                    onClick={() => setQuickViewPage(page.id)}
                  >
                    Preview
                  </Button>
                  <Button 
                    size="small" 
                    icon={<LineChartOutlined />} 
                    onClick={() => setQuickAnalyticsPage(page.id)}
                  >
                    Analytics
                  </Button>
                </Space>
              </div>
            ))}
            {landingPages.length === 0 && (
              <Text type="secondary">No landing pages yet. Create your first one!</Text>
            )}
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="Quick Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                block
                onClick={handleCreatePage}
              >
                Create New Landing Page
              </Button>
              <Button 
                icon={<EyeOutlined />} 
                block
                onClick={handleQuickView}
                disabled={!mostRecentPage}
              >
                View Latest Page
              </Button>
              <Button 
                icon={<LineChartOutlined />} 
                block
                onClick={handleQuickAnalytics}
                disabled={!mostViewedPage}
              >
                View Top Performing Page
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Search and Table */}
      <Card>
        <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Search
            id="search-input"
            placeholder="Search by title, content or keywords"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ width: 400 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            size="large"
            onClick={handleCreatePage}
          >
            Create Landing Page
          </Button>
        </Space>

        <LandingPagesTable 
          data={landingPages} 
          isLoading={isLoading} 
          onDuplicate={handleDuplicate} 
        />
      </Card>

      {/* Duplicate Modal */}
      <Modal
        title="Duplicate Landing Page"
        open={isDuplicateModalVisible}
        onOk={handleDuplicateConfirm}
        onCancel={() => setIsDuplicateModalVisible(false)}
        confirmLoading={duplicateMutation.isPending}
      >
        <p>Select target customer and domain for the duplicated page:</p>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Customer"
            value={targetCustomerId}
            onChange={setTargetCustomerId}
          >
            {customers.map(customer => (
              <Option key={customer.id} value={customer.id}>{customer.name}</Option>
            ))}
          </Select>
          <Select
            style={{ width: '100%' }}
            placeholder="Select Domain"
            value={targetDomainId}
            onChange={setTargetDomainId}
            disabled={!targetCustomerId}
          >
            {domains.map(domain => (
              <Option key={domain.id} value={domain.id}>{domain.name}</Option>
            ))}
          </Select>
        </Space>
      </Modal>

      {/* Create Landing Page Drawer */}
      <CreateLandingPageDrawer 
        visible={isCreateDrawerVisible}
        onClose={() => setIsCreateDrawerVisible(false)}
      />

      {/* Quick Preview Drawer */}
      {quickViewPage && (
        <PreviewLandingPageDrawer
          visible={!!quickViewPage}
          onClose={() => setQuickViewPage(null)}
          pageId={quickViewPage}
          onEdit={() => {
            // Open edit drawer and close preview
            setQuickViewPage(null);
            // This would open the edit drawer, but we'd need to pass the ID
          }}
          onAnalytics={() => {
            setQuickAnalyticsPage(quickViewPage);
            setQuickViewPage(null);
          }}
        />
      )}

      {/* Quick Analytics Drawer */}
      {quickAnalyticsPage && (
        <AnalyticsDrawer
          visible={!!quickAnalyticsPage}
          onClose={() => setQuickAnalyticsPage(null)}
          pageId={quickAnalyticsPage}
          onEdit={() => {
            // Open edit drawer and close analytics
            setQuickAnalyticsPage(null);
            // This would open the edit drawer, but we'd need to pass the ID
          }}
          onPreview={() => {
            setQuickViewPage(quickAnalyticsPage);
            setQuickAnalyticsPage(null);
          }}
        />
      )}
    </MainLayout>
  );
};

export default HomePage; 