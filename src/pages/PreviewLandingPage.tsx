import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button, Space, Alert, Typography, Tag, Divider, Image, Card, Row, Col, Drawer } from 'antd';
import { ArrowLeftOutlined, MobileOutlined, DesktopOutlined, EditOutlined } from '@ant-design/icons';
import MainLayout from '../components/Layout/MainLayout';
import { fetchLandingPage } from '../api/services';
import EditLandingPageDrawer from '../components/LandingPages/EditLandingPageDrawer';

const { Title, Paragraph, Text } = Typography;

const PreviewLandingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);

  // Fetch landing page
  const { data: page, isLoading } = useQuery({
    queryKey: ['landingPage', id],
    queryFn: () => fetchLandingPage(id || ''),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MainLayout title="Preview Landing Page">
        <div>Loading...</div>
      </MainLayout>
    );
  }

  if (!page) {
    return (
      <MainLayout title="Preview Landing Page">
        <Alert
          message="Error"
          description="Landing page not found"
          type="error"
          showIcon
        />
      </MainLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'under_review': return 'orange';
      default: return 'default';
    }
  };

  return (
    <MainLayout title="Preview Landing Page">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>
                  Back to Landing Pages
                </Button>
                <Button 
                  icon={<DesktopOutlined />} 
                  type={previewMode === 'desktop' ? 'primary' : 'default'}
                  onClick={() => setPreviewMode('desktop')}
                >
                  Desktop
                </Button>
                <Button 
                  icon={<MobileOutlined />} 
                  type={previewMode === 'mobile' ? 'primary' : 'default'}
                  onClick={() => setPreviewMode('mobile')}
                >
                  Mobile
                </Button>
              </Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setIsEditDrawerVisible(true)}
              >
                Edit Page
              </Button>
            </Space>

            <div style={{ 
              border: '1px solid #d9d9d9', 
              borderRadius: '4px',
              padding: '20px',
              maxWidth: previewMode === 'mobile' ? '375px' : '100%',
              margin: previewMode === 'mobile' ? '0 auto' : '0',
            }}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text>Status:</Text>
                  <Tag color={getStatusColor(page.status)}>
                    {page.status.replace('_', ' ')}
                  </Tag>
                </Space>
                <Space>
                  <Text>Source:</Text>
                  <Tag color={page.isAiGenerated ? 'blue' : 'default'}>
                    {page.isAiGenerated ? 'AI Generated' : 'Manual'}
                  </Tag>
                </Space>
              </div>

              {page.status === 'rejected' && (
                <Alert
                  message="Rejection Reason"
                  description={page.rejectionReason}
                  type="error"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Title level={2}>{page.title}</Title>
              
              {page.imageUrl && (
                <div style={{ marginBottom: 16 }}>
                  <Image
                    src={page.imageUrl}
                    alt={page.title}
                    style={{ maxWidth: '100%' }}
                  />
                </div>
              )}
              
              <Paragraph style={{ whiteSpace: 'pre-line' }}>
                {page.content}
              </Paragraph>
              
              <Divider />
              
              <div>
                <Text strong>Keywords: </Text>
                <Space>
                  {page.keywords.map((keyword, index) => (
                    <Tag key={index}>{keyword}</Tag>
                  ))}
                </Space>
              </div>
              
              <div style={{ marginTop: 16 }}>
                <Text strong>URL: </Text>
                <Text>{`https://${page.domainId}/${page.slug}`}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Edit Landing Page Drawer */}
      {id && (
        <EditLandingPageDrawer 
          visible={isEditDrawerVisible}
          onClose={() => setIsEditDrawerVisible(false)}
          pageId={id}
        />
      )}
    </MainLayout>
  );
};

export default PreviewLandingPage; 