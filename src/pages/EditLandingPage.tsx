import { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Space, Alert } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../components/Layout/MainLayout';
import { fetchLandingPage, updateLandingPage, fetchCustomers, fetchDomains } from '../api/services';

const { TextArea } = Input;
const { Option } = Select;

const EditLandingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  // Fetch landing page
  const { data: page, isLoading: isPageLoading } = useQuery({
    queryKey: ['landingPage', id],
    queryFn: () => fetchLandingPage(id || ''),
    enabled: !!id,
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => fetchCustomers(),
  });

  // Fetch domains for selected customer
  const { data: domains = [] } = useQuery({
    queryKey: ['domains', selectedCustomerId],
    queryFn: () => fetchDomains(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  // Update landing page mutation
  const updateMutation = useMutation({
    mutationFn: (values: any) => updateLandingPage(id || '', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landingPages'] });
      queryClient.invalidateQueries({ queryKey: ['landingPage', id] });
      message.success('Landing page updated successfully');
      navigate('/');
    },
    onError: () => {
      message.error('Failed to update landing page');
    }
  });

  useEffect(() => {
    if (page) {
      form.setFieldsValue({
        title: page.title,
        content: page.content,
        keywords: page.keywords.join(', '),
        imageUrl: page.imageUrl,
        customerId: page.customerId,
        domainId: page.domainId,
      });
      setSelectedCustomerId(page.customerId);
    }
  }, [page, form]);

  const handleCustomerChange = (value: string) => {
    setSelectedCustomerId(value);
    form.setFieldValue('domainId', undefined);
  };

  const handleSubmit = (values: any) => {
    const keywords = values.keywords.split(',').map((k: string) => k.trim());
    
    updateMutation.mutate({
      title: values.title,
      content: values.content,
      keywords,
      imageUrl: values.imageUrl,
      customerId: values.customerId,
      domainId: values.domainId,
      // Any edit triggers compliance review
      status: 'under_review',
    });
  };

  if (isPageLoading) {
    return (
      <MainLayout title="Edit Landing Page">
        <div>Loading...</div>
      </MainLayout>
    );
  }

  if (!page) {
    return (
      <MainLayout title="Edit Landing Page">
        <Alert
          message="Error"
          description="Landing page not found"
          type="error"
          showIcon
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Edit Landing Page">
      {page.status === 'rejected' && (
        <Alert
          message="Rejection Reason"
          description={page.rejectionReason}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
              Update Landing Page
            </Button>
            <Button onClick={() => navigate('/')}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </MainLayout>
  );
};

export default EditLandingPage; 