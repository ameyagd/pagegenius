import { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, Select, message, Space, Alert } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLandingPage, updateLandingPage, fetchCustomers, fetchDomains } from '../../api/services';

const { TextArea } = Input;
const { Option } = Select;

interface EditLandingPageDrawerProps {
    visible: boolean;
    onClose: () => void;
    pageId: string;
    onPageUpdated?: (pageId: string) => void;
}

const EditLandingPageDrawer: React.FC<EditLandingPageDrawerProps> = ({ visible, onClose, pageId, onPageUpdated }) => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

    // Fetch landing page
    const { data: page, isLoading: isPageLoading } = useQuery({
        queryKey: ['landingPage', pageId],
        queryFn: () => fetchLandingPage(pageId),
        enabled: !!pageId && visible,
    });

    // Fetch customers
    const { data: customers = [] } = useQuery({
        queryKey: ['customers'],
        queryFn: () => fetchCustomers(),
        enabled: visible,
    });

    // Fetch domains for selected customer
    const { data: domains = [] } = useQuery({
        queryKey: ['domains', selectedCustomerId],
        queryFn: () => fetchDomains(selectedCustomerId),
        enabled: !!selectedCustomerId && visible,
    });

    // Update landing page mutation
    const updateMutation = useMutation({
        mutationFn: (values: any) => updateLandingPage(pageId, values),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['landingPages'] });
            queryClient.invalidateQueries({ queryKey: ['landingPage', pageId] });
            message.success('Landing page updated successfully');
            onClose();
            if (onPageUpdated) {
                onPageUpdated(pageId);
            }
        },
        onError: () => {
            message.error('Failed to update landing page');
        },
    });

    useEffect(() => {
        if (page && visible) {
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
    }, [page, form, visible]);

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

    return (
        <Drawer
            title='Edit Landing Page'
            placement='right'
            width={720}
            onClose={onClose}
            open={visible}
            bodyStyle={{ paddingBottom: 80 }}
            extra={
                <Space>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type='primary' onClick={() => form.submit()} loading={updateMutation.isPending}>
                        Update
                    </Button>
                </Space>
            }
        >
            {isPageLoading ? (
                <div>Loading...</div>
            ) : !page ? (
                <Alert message='Error' description='Landing page not found' type='error' showIcon />
            ) : (
                <>
                    {page.status === 'rejected' && (
                        <Alert message='Rejection Reason' description={page.rejectionReason} type='error' showIcon style={{ marginBottom: 16 }} />
                    )}

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
                </>
            )}
        </Drawer>
    );
};

export default EditLandingPageDrawer;
