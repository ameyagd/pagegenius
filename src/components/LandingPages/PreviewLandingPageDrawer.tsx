import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Drawer, Button, Space, Alert, Typography, Tag, Divider, Image, Tabs } from 'antd';
import { MobileOutlined, DesktopOutlined, EditOutlined, BarChartOutlined } from '@ant-design/icons';
import { fetchLandingPage } from '../../api/services';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

interface PreviewLandingPageDrawerProps {
  visible: boolean;
  onClose: () => void;
  pageId: string;
  onEdit: () => void;
  onAnalytics: () => void;
}

const PreviewLandingPageDrawer: React.FC<PreviewLandingPageDrawerProps> = ({
  visible,
  onClose,
  pageId,
  onEdit,
  onAnalytics
}) => {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Fetch landing page
  const { data: page, isLoading } = useQuery({
    queryKey: ['landingPage', pageId],
    queryFn: () => fetchLandingPage(pageId),
    enabled: !!pageId && visible,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'under_review': return 'orange';
      default: return 'default';
    }
  };

  return (
    <Drawer
      title="Preview Landing Page"
      placement="right"
      width={previewMode === 'mobile' ? 480 : 800}
      onClose={onClose}
      open={visible}
      extra={
        <Space>
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
      }
    >
      {isLoading ? (
        <div>Loading...</div>
      ) : !page ? (
        <Alert
          message="Error"
          description="Landing page not found"
          type="error"
          showIcon
        />
      ) : (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Space>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={onEdit}
              >
                Edit Page
              </Button>
              <Button 
                icon={<BarChartOutlined />}
                onClick={onAnalytics}
              >
                View Analytics
              </Button>
            </Space>
          </div>

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
        </>
      )}
    </Drawer>
  );
};

export default PreviewLandingPageDrawer; 