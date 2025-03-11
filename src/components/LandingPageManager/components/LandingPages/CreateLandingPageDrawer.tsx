import { useState } from 'react';
import { Drawer, Form, Input, Button, Select, message, Space, Tabs, Typography } from 'antd';
import { SendOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
import { createLandingPage, generateAiContent, fetchCustomers, fetchDomains } from '../../api/services';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface CreateLandingPageDrawerProps {
    visible: boolean;
    onClose: () => void;
    partnerInfo: {
        id: string;
        name: string;
        email: string;
    };
    onPageCreated?: (pageId: string) => void;
}

const CreateLandingPageDrawer: React.FC<CreateLandingPageDrawerProps> = ({ visible, onClose, partnerInfo, onPageCreated }) => {
    const [form] = Form.useForm();
    // const navigate = useNavigate();
    const queryClient = useQueryClient();
    // const [isAiGeneration, setIsAiGeneration] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [activeTab, setActiveTab] = useState('manual');

    // Fetch customers
    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => fetchCustomers(partnerInfo?.id),
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
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['landingPages'] });
            message.success('Landing page created successfully');
            form.resetFields();
            onClose();
            if (onPageCreated) {
                onPageCreated(data.id);
            }
        },
        onError: () => {
            message.error('Failed to create landing page');
        },
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
        },
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
            authorId: partnerInfo?.id || '',
            customerId: values.customerId,
            domainId: values.domainId,
            isAiGenerated: activeTab === 'ai',
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
        <Drawer
            title='Create Landing Page'
            placement='right'
            width={720}
            onClose={onClose}
            open={visible}
            bodyStyle={{ paddingBottom: 80 }}
            extra={
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type='primary' onClick={() => form.submit()} loading={createMutation.isPending}>
                        Create
                    </Button>
                </Space>
            }
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab='Manual Creation' key='manual'>
                    <Form form={form} layout='vertical' onFinish={handleSubmit}>
                        <Form.Item name='customerId' label='Customer' rules={[{ required: true, message: 'Please select a customer' }]}>
                            <Select placeholder='Select Customer' onChange={handleCustomerChange}>
                                {customers.map((customer) => (
                                    <Option key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name='domainId' label='Domain' rules={[{ required: true, message: 'Please select a domain' }]}>
                            <Select placeholder='Select Domain' disabled={!selectedCustomerId}>
                                {domains.map((domain) => (
                                    <Option key={domain.id} value={domain.id}>
                                        {domain.name}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name='title' label='Title' rules={[{ required: true, message: 'Please enter a title' }]}>
                            <Input placeholder='Enter page title' />
                        </Form.Item>

                        <Form.Item
                            name='content'
                            label='Content'
                            rules={[
                                { required: true, message: 'Please enter content' },
                                { min: 100, message: 'Content must be at least 100 characters' },
                            ]}
                        >
                            <TextArea rows={10} placeholder='Enter page content' />
                        </Form.Item>

                        <Form.Item name='keywords' label='Keywords (comma separated)' rules={[{ required: true, message: 'Please enter keywords' }]}>
                            <Input placeholder='keyword1, keyword2, keyword3' />
                        </Form.Item>

                        <Form.Item name='imageUrl' label='Image URL'>
                            <Input placeholder='Enter image URL' />
                        </Form.Item>
                    </Form>
                </TabPane>
                <TabPane tab='AI Generation' key='ai'>
                    <div style={{ marginBottom: 24 }}>
                        <Title level={5}>Generate Content with AI</Title>
                        <Text>Provide a brief description of the landing page you want to create, and our AI will generate content for you.</Text>
                    </div>

                    <Form.Item label='AI Prompt' required>
                        <TextArea
                            rows={4}
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder='Describe the landing page you want to create...'
                        />
                    </Form.Item>

                    <Button
                        type='primary'
                        icon={<SendOutlined />}
                        onClick={handleGenerateAiContent}
                        loading={generateAiMutation.isPending}
                        style={{ marginBottom: 24 }}
                    >
                        Generate Content
                    </Button>

                    {generateAiMutation.isSuccess && (
                        <Form form={form} layout='vertical' onFinish={handleSubmit}>
                            <Form.Item name='customerId' label='Customer' rules={[{ required: true, message: 'Please select a customer' }]}>
                                <Select placeholder='Select Customer' onChange={handleCustomerChange}>
                                    {customers.map((customer) => (
                                        <Option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name='domainId' label='Domain' rules={[{ required: true, message: 'Please select a domain' }]}>
                                <Select placeholder='Select Domain' disabled={!selectedCustomerId}>
                                    {domains.map((domain) => (
                                        <Option key={domain.id} value={domain.id}>
                                            {domain.name}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name='title' label='Title' rules={[{ required: true, message: 'Please enter a title' }]}>
                                <Input placeholder='Enter page title' />
                            </Form.Item>

                            <Form.Item name='content' label='Content' rules={[{ required: true, message: 'Please enter content' }]}>
                                <TextArea rows={10} placeholder='Enter page content' />
                            </Form.Item>

                            <Form.Item name='keywords' label='Keywords (comma separated)' rules={[{ required: true, message: 'Please enter keywords' }]}>
                                <Input placeholder='keyword1, keyword2, keyword3' />
                            </Form.Item>

                            <Form.Item name='imageUrl' label='Image URL'>
                                <Input placeholder='Enter image URL' />
                            </Form.Item>

                            <Button icon={<ReloadOutlined />} onClick={handleGenerateAiContent} style={{ marginBottom: 16 }}>
                                Regenerate
                            </Button>
                        </Form>
                    )}
                </TabPane>
            </Tabs>
        </Drawer>
    );
};

export default CreateLandingPageDrawer;
