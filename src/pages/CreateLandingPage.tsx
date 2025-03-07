import { useState } from 'react';
import { Form, Input, Button, Upload, Select, Switch, message, Space, Card, Tabs } from 'antd';
import { UploadOutlined, SendOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import { createLandingPage, generateAiContent, fetchCustomers, fetchDomains } from '../api/services';
import { useAuth } from '../contexts/AuthContext';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const CreateLandingPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { partner } = useAuth();
  const [isAiGeneration, setIsAiGeneration] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetchCustomers(partner?.id),
  });

  // Fetch domains for selected customer
  const { data: domains = [] } = useQuery({
    queryKey: ['domains', selectedCustomerId],
    queryFn: () => fetchDomains(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  // Create landing page mutation
  const createMutation = useMutation({
    mutationFn: createLandingPage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
      message.success('Landing page created successfully');
      navigate('/');
    },
    onError: () => {
      message.error('Failed to create landing page');
    }
  });

  // Generate AI content mutation
  const generateAiMutation = useMutation({
    mutationFn: generateAiContent,
    onSuccess: (data) => {
      form.setFieldsValue({
        title: data.title,
        content: data.content,
        keywords: data.keywords.join(', '),
        imageUrl: data.imageUrl,
      });
      message.success('AI content generated successfully');
    },
    onError: () => {
      message.error('Failed to generate AI content');
    }
  });

  const handleCustomerChange = (value: string) => {
    setSelectedCustomerId(value);
    form.setFieldValue('domainId', undefined);
  };

  const handleSubmit = (values: any) => {
    const keywords = values.keywords.split(',').map((k: string) => k.trim());
    
    createMutation.mutate({
      title: values.title,
      slug: values.title.toLowerCase().replace(/\s+/g, '-'),
      content: values.content,
      keywords,
      imageUrl: values.imageUrl,
      status: 'under_review', // All manually created content goes to review
      authorId: partner?.id || '',
      customerId: values.customerId,
      domainId: values.domainId,
      isAiGenerated: isAiGeneration,
      isDuplicated: false,
    });
  };

  const handleGenerateAiContent = () => {
    if (!aiPrompt) {
      message.warning('Please enter a prompt for AI generation');
      return;
    }
    generateAiMutation.mutate(aiPrompt);
  };

  return (
    <MainLayout title="Create Landing Page">
      <Tabs defaultActiveKey="manual">
        <TabPane tab="Manual Creation" key="manual">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ isAiGenerated: false }}
          >
            <Form.Item
              name="customerId"
              label="Customer"
              rules={[{ required: true, message: 'Please select a customer' }]}
            >
              <Select 
                placeholder="Select Customer" 
                onChange={handleCustomerChange}
              >
                {customers.map(customer => (
                  <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="domainId"
              label="Domain"
              rules={[{ required: true, message: 'Please select a domain' }]}
            >
              <Select 
                placeholder="Select Domain" 
                disabled={!selectedCustomerId}
              >
                {domains.map(domain => (
                  <Option key={domain.id} value={domain.id}>{domain.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="Title"
              rules={[{ required: true, message: 'Please enter a title' }]}
            >
              <Input placeholder="Enter page title" />
            </Form.Item>

            <Form.Item
              name="content"
              label="Content"
              rules={[
                { required: true, message: 'Please enter content' },
                { min: 100, message: 'Content must be at least 100 characters' }
              ]}
            >
              <TextArea rows={10} placeholder="Enter page content" />
            </Form.Item>

            <Form.Item
              name="keywords"
              label="Keywords (comma separated)"
              rules={[{ required: true, message: 'Please enter keywords' }]}
            >
              <Input placeholder="keyword1, keyword2, keyword3" />
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label="Image URL"
            >
              <Input placeholder="Enter image URL" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
                  Create Landing Page
                </Button>
                <Button onClick={() => navigate('/')}>
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="AI Generation" key="ai">
          <Card title="Generate Content with AI">
            <Form layout="vertical">
              <Form.Item
                label="Describe what you want to generate"
                required
              >
                <TextArea 
                  rows={4} 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Enter a detailed description of the content you want to generate"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={handleGenerateAiContent}
                  loading={generateAiMutation.isPending}
                >
                  Generate Content
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {generateAiMutation.isSuccess && (
            <Card title="Generated Content" style={{ marginTop: 16 }}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ isAiGenerated: true }}
              >
                <Form.Item
                  name="customerId"
                  label="Customer"
                  rules={[{ required: true, message: 'Please select a customer' }]}
                >
                  <Select 
                    placeholder="Select Customer" 
                    onChange={handleCustomerChange}
                  >
                    {customers.map(customer => (
                      <Option key={customer.id} value={customer.id}>{customer.name}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="domainId"
                  label="Domain"
                  rules={[{ required: true, message: 'Please select a domain' }]}
                >
                  <Select 
                    placeholder="Select Domain" 
                    disabled={!selectedCustomerId}
                  >
                    {domains.map(domain => (
                      <Option key={domain.id} value={domain.id}>{domain.name}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="title"
                  label="Title"
                  rules={[{ required: true, message: 'Please enter a title' }]}
                >
                  <Input placeholder="Enter page title" />
                </Form.Item>

                <Form.Item
                  name="content"
                  label="Content"
                  rules={[{ required: true, message: 'Please enter content' }]}
                >
                  <TextArea rows={10} placeholder="Enter page content" />
                </Form.Item>

                <Form.Item
                  name="keywords"
                  label="Keywords (comma separated)"
                  rules={[{ required: true, message: 'Please enter keywords' }]}
                >
                  <Input placeholder="keyword1, keyword2, keyword3" />
                </Form.Item>

                <Form.Item
                  name="imageUrl"
                  label="Image URL"
                >
                  <Input placeholder="Enter image URL" />
                </Form.Item>

                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={createMutation.isPending}
                      onClick={() => setIsAiGeneration(true)}
                    >
                      Create Landing Page
                    </Button>
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={handleGenerateAiContent}
                    >
                      Regenerate
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}
        </TabPane>
      </Tabs>
    </MainLayout>
  );
};

export default CreateLandingPage; 