import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Select, message, Space, Alert, Row, Col, Card, Typography, Tabs, Divider, Tag } from 'antd';
import {
    SendOutlined,
    ReloadOutlined,
    SaveOutlined,
    DesktopOutlined,
    InboxOutlined,
    CloseOutlined,
    PlusOutlined,
    KeyOutlined,
} from '@ant-design/icons';
import GenerateKeywordsModal from './GenerateKeywordsModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchLandingPage, updateLandingPage, createLandingPage, generateAiContent, fetchCustomers, fetchDomains } from '../../api/services';
import { LandingPage } from '../../types';
import './LandingPageEditor.css';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface LandingPageEditorProps {
    mode: 'create' | 'edit' | 'duplicate';
    pageId?: string;
    pageToDuplicate?: LandingPage | null;
    isTopPerforming?: boolean;
    onClose: () => void;
    onPageCreated?: (pageId: string) => void;
    onPageUpdated?: (pageId: string) => void;
    partnerInfo?: {
        id: string;
        name: string;
        email: string;
    };
}

const LandingPageEditor: React.FC<LandingPageEditorProps> = ({
    mode,
    pageId,
    pageToDuplicate,
    // isTopPerforming = false,
    onClose,
    onPageCreated,
    onPageUpdated,
    partnerInfo = {
        id: '1',
        name: 'Default Partner',
        email: 'partner@example.com',
    },
}) => {
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [activeTab, setActiveTab] = useState('ai');
    const [aiPrompt, setAiPrompt] = useState('');
    const [isKeywordsModalVisible, setIsKeywordsModalVisible] = useState(false);
    const [previewContent, setPreviewContent] = useState({
        title: '',
        content: '',
        imageUrl: '',
    });

    // Fetch landing page if in edit mode
    const { data: page, isLoading: isPageLoading } = useQuery({
        queryKey: ['landingPage', pageId],
        queryFn: () => fetchLandingPage(pageId || ''),
        enabled: mode === 'edit' && !!pageId,
    });

    // Fetch customers
    const { data: customers = [] } = useQuery({
        queryKey: ['customers', partnerInfo?.id],
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
            message.success(mode === 'duplicate' ? 'Landing page duplicated successfully' : 'Landing page created successfully');
            form.resetFields();
            if (onPageCreated) {
                onPageCreated(data.id);
            }
            onClose();
        },
        onError: () => {
            message.error(mode === 'duplicate' ? 'Failed to duplicate landing page' : 'Failed to create landing page');
        },
    });

    // Update landing page mutation
    const updateMutation = useMutation({
        mutationFn: (values: any) => updateLandingPage(pageId || '', values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['landingPages'] });
            queryClient.invalidateQueries({ queryKey: ['landingPage', pageId] });
            message.success('Landing page updated successfully');
            if (onPageUpdated && pageId) {
                onPageUpdated(pageId);
            }
            onClose();
        },
        onError: () => {
            message.error('Failed to update landing page');
        },
    });

    // Generate AI content mutation
    const generateAiMutation = useMutation({
        mutationFn: generateAiContent,
        onSuccess: (data) => {
            const formValues = {
                title: data.title,
                content: data.content,
                keywords: data.keywords.join(', '),
                imageUrl: data.imageUrl,
            };

            form.setFieldsValue(formValues);
            setPreviewContent({
                title: data.title,
                content: data.content,
                imageUrl: data.imageUrl || '',
            });

            message.success('AI content generated successfully');
        },
        onError: () => {
            message.error('Failed to generate AI content');
        },
    });

    // Initialize form with page data when in edit mode
    useEffect(() => {
        if (page && mode === 'edit') {
            const formValues = {
                title: page.title,
                content: page.content,
                keywords: page.keywords.join(', '),
                imageUrl: page.imageUrl,
                customerId: page.customerId,
                domainId: page.domainId,
            };

            form.setFieldsValue(formValues);
            setSelectedCustomerId(page.customerId);
            setPreviewContent({
                title: page.title,
                content: page.content,
                imageUrl: page.imageUrl || '',
            });
        }
    }, [page, form, mode]);

    // Initialize form with duplicate page data when in duplicate mode
    useEffect(() => {
        if (pageToDuplicate && mode === 'duplicate') {
            const formValues = {
                title: `${pageToDuplicate.title} (Copy)`,
                content: pageToDuplicate.content,
                keywords: pageToDuplicate.keywords.join(', '),
                imageUrl: pageToDuplicate.imageUrl,
                customerId: pageToDuplicate.customerId,
                domainId: pageToDuplicate.domainId,
            };

            form.setFieldsValue(formValues);
            setSelectedCustomerId(pageToDuplicate.customerId);
            setPreviewContent({
                title: formValues.title,
                content: pageToDuplicate.content,
                imageUrl: pageToDuplicate.imageUrl || '',
            });
        }
    }, [pageToDuplicate, form, mode]);

    // Update preview content when form values change
    const handleFormValuesChange = (allValues: any) => {
        setPreviewContent({
            title: allValues.title || '',
            content: allValues.content || '',
            imageUrl: allValues.imageUrl || '',
        });
    };

    const handleCustomerChange = (value: string) => {
        setSelectedCustomerId(value);
        form.setFieldValue('domainId', undefined);
    };

    const handleSubmit = (values: any) => {
        const keywords = values.keywords.split(',').map((k: string) => k.trim());

        if (mode === 'create' || mode === 'duplicate') {
            createMutation.mutate({
                title: values.title,
                slug: values.title.toLowerCase().replace(/\s+/g, '-'),
                content: values.content,
                keywords,
                imageUrl: values.imageUrl,
                status: 'under_review', // All created content goes to review
                authorId: partnerInfo?.id || '',
                customerId: values.customerId,
                domainId: values.domainId,
                isAiGenerated: mode === 'create' && activeTab === 'ai',
                isDuplicated: mode === 'duplicate',
                originalPageId: mode === 'duplicate' && pageToDuplicate ? pageToDuplicate.id : undefined,
            });
        } else {
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
        }
    };

    const handleGenerateAiContent = () => {
        if (!aiPrompt) {
            message.warning('Please enter a prompt for AI generation');
            return;
        }
        generateAiMutation.mutate(aiPrompt);
    };

    const renderPreview = () => {
        return (
            <div className='landing-page-preview'>
                <Tabs defaultActiveKey='mobile'>
                    <TabPane tab='Mobile Preview' key='mobile'>
                        <div className='preview-container mobile'>
                            <div className='mobile-frame'>
                                {previewContent.imageUrl && (
                                    <div className='preview-image'>
                                        <img src={previewContent.imageUrl} alt={previewContent.title} />
                                    </div>
                                )}
                                <div className='preview-title'>
                                    <h2>{previewContent.title}</h2>
                                </div>
                                <div className='preview-content'>
                                    {previewContent.content.split('\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab='Desktop Preview' key='desktop'>
                        <div className='preview-container desktop'>
                            {previewContent.imageUrl && (
                                <div className='preview-image'>
                                    <img src={previewContent.imageUrl} alt={previewContent.title} />
                                </div>
                            )}
                            <div className='preview-title'>
                                <h1>{previewContent.title}</h1>
                            </div>
                            <div className='preview-content'>
                                {previewContent.content.split('\n').map((paragraph, index) => (
                                    <p key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        );
    };

    const renderAiTab = () => {
        return (
            <>
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

                {generateAiMutation.isSuccess && renderFormFields()}
            </>
        );
    };

    const renderFormFields = () => {
        return (
            <Form form={form} layout='vertical' onFinish={handleSubmit} onValuesChange={handleFormValuesChange}>
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

                <Form.Item name='keywords' label='Keywords (comma separated)' rules={[{ required: true, message: 'Please enter keywords' }]} hidden>
                    <Input placeholder='keyword1, keyword2, keyword3' />
                </Form.Item>

                <Form.Item name='imageUrl' label='Image URL'>
                    <Input placeholder='Enter image URL' />
                </Form.Item>
            </Form>
        );
    };

    const getEditorTitle = () => {
        switch (mode) {
            case 'create':
                return 'Create Landing Page';
            case 'edit':
                return 'Edit Landing Page';
            case 'duplicate':
                return 'Duplicate Landing Page';
            default:
                return 'Landing Page Editor';
        }
    };

    return (
        <div className='landing-page-editor-container' style={{padding:'20px', borderRadius: '10px'}}>
            <div className='editor-header'>
                <Title level={4}>{getEditorTitle()}</Title>
            </div>

            {mode === 'duplicate' && (
                <Alert
                    message='You are creating a duplicate of an existing landing page'
                    description='You can modify the content and select a different customer or domain before saving.'
                    type='info'
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            {/* {isTopPerforming && (
                <Alert
                    message='Top Performing Landing Page'
                    description='This is your highest performing landing page based on conversion value. Review its content and structure to understand what makes it successful.'
                    type='success'
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )} */}

            {mode === 'edit' && isPageLoading ? (
                <div>Loading...</div>
            ) : mode === 'edit' && !page ? (
                <Alert message='Error' description='Landing page not found' type='error' showIcon />
            ) : (
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={10}>
                        <Card title='Content'>
                            {mode === 'edit' && page?.status === 'rejected' && (
                                <Alert message='Rejection Reason' description={page.rejectionReason} type='error' showIcon style={{ marginBottom: 16 }} />
                            )}

                            {mode === 'create' ? (
                                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                                    <TabPane tab='AI Generation' key='ai'>
                                        {renderAiTab()}
                                    </TabPane>
                                    <TabPane tab='Manual Creation' key='manual'>
                                        {renderFormFields()}
                                    </TabPane>
                                    
                                </Tabs>
                            ) : (
                                renderFormFields()
                            )}
                        </Card>
                    </Col>
                    <Col xs={24} lg={10}>
                        <Card title='Live Preview'>
                            {renderPreview()}
                        </Card>
                    </Col>
                    <Col xs={24} lg={4}>
                        <Card title='Actions'>
                            <Space direction='vertical' style={{ width: '100%' }}>
                                <Button
                                    type='primary'
                                    icon={<SaveOutlined />}
                                    block
                                    onClick={() => form.submit()}
                                    loading={mode === 'edit' ? updateMutation.isPending : createMutation.isPending}
                                >
                                    Publish
                                </Button>

                                <Button icon={<SaveOutlined />} block>
                                    Save as Draft
                                </Button>

                                <Button icon={<DesktopOutlined />} block onClick={handlePreview}>
                                    Preview
                                </Button>

                                {mode === 'create' && activeTab === 'ai' && (
                                    <Button icon={<ReloadOutlined />} onClick={handleGenerateAiContent} block>
                                        Regenerate
                                    </Button>
                                )}

                                <Button icon={<InboxOutlined />} block onClick={handleArchive}>
                                    Archive
                                </Button>

                                <Button danger icon={<CloseOutlined />} onClick={onClose} block>
                                    Cancel
                                </Button>
                            </Space>

                            <Divider />

                            <div>
                                <Title level={5}>Keywords Management</Title>
                                <Space direction='vertical' style={{ width: '100%' }}>
                                    <Button type='primary' icon={<KeyOutlined />} onClick={() => setIsKeywordsModalVisible(true)} style={{ width: '100%' }}>
                                        Generate Keywords
                                    </Button>

                                    <Input.Group compact>
                                        <Input style={{ width: 'calc(100% - 80px)', padding: '5px 10px' }} placeholder='Add keyword' id='new-keyword-input' />
                                        <Button
                                            type='primary'
                                            icon={<PlusOutlined />}
                                            onClick={() => {
                                                const input = document.getElementById('new-keyword-input') as HTMLInputElement;
                                                if (input && input.value) {
                                                    const currentKeywords = form.getFieldValue('keywords') || '';
                                                    const keywordsArray = currentKeywords
                                                        .split(',')
                                                        .map((k: string) => k.trim())
                                                        .filter(Boolean);
                                                    if (!keywordsArray.includes(input.value)) {
                                                        keywordsArray.push(input.value);
                                                        form.setFieldsValue({ keywords: keywordsArray.join(', ') });
                                                        input.value = '';
                                                        // Force re-render of tags
                                                        setPreviewContent({
                                                            ...previewContent,
                                                            title: previewContent.title,
                                                        });
                                                    }
                                                }
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </Input.Group>

                                    <div style={{ marginTop: '10px' }}>
                                        {form
                                            .getFieldValue('keywords')
                                            ?.split(',')
                                            .map((keyword: string, index: number) => {
                                                const trimmedKeyword = keyword.trim();
                                                if (!trimmedKeyword) return null;
                                                return (
                                                    <Tag
                                                        key={index}
                                                        closable
                                                        style={{ margin: '0 8px 8px 0' }}
                                                        onClose={() => {
                                                            const currentKeywords = form.getFieldValue('keywords') || '';
                                                            const keywordsArray = currentKeywords
                                                                .split(',')
                                                                .map((k: string) => k.trim())
                                                                .filter(Boolean);
                                                            const updatedKeywords = keywordsArray.filter((k: string) => k !== trimmedKeyword);
                                                            form.setFieldsValue({ keywords: updatedKeywords.join(', ') });
                                                            // Force re-render of tags
                                                            setPreviewContent({
                                                                ...previewContent,
                                                                title: previewContent.title,
                                                            });
                                                        }}
                                                    >
                                                        {trimmedKeyword}
                                                    </Tag>
                                                );
                                            })}
                                    </div>
                                </Space>
                            </div>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Generate Keywords Modal */}
            <GenerateKeywordsModal
                visible={isKeywordsModalVisible}
                onClose={() => setIsKeywordsModalVisible(false)}
                contentToGenerateFrom={form.getFieldValue('title') || form.getFieldValue('content') || ''}
                onSave={(keywords) => {
                    // Update the form with the selected keywords
                    form.setFieldsValue({ keywords: keywords.join(', ') });
                    // Force re-render of tags
                    setPreviewContent({
                        ...previewContent,
                        title: previewContent.title,
                    });
                }}
            />
        </div>
    );
};

export default LandingPageEditor;

// Add a function to handle preview
const handlePreview = () => {
    // In a real implementation, this would open a preview in a new tab or modal
    message.info('Preview functionality would open in a new window');
};

// Add a function to handle saving as draft
// const handleSaveAsDraft = () => {
//     const values = form.getFieldsValue();
//     const keywords = values.keywords.split(',').map((k: string) => k.trim());

//     if (mode === 'create' || mode === 'duplicate') {
//         createMutation.mutate({
//             ...values,
//             slug: values.title.toLowerCase().replace(/\s+/g, '-'),
//             keywords,
//             status: 'draft', // Save as draft instead of under_review
//             authorId: partnerInfo?.id || '',
//             isAiGenerated: mode === 'create' && activeTab === 'ai',
//             isDuplicated: mode === 'duplicate',
//             originalPageId: mode === 'duplicate' && pageToDuplicate ? pageToDuplicate.id : undefined,
//         });
//     } else {
//         updateMutation.mutate({
//             ...values,
//             keywords,
//             status: 'draft', // Save as draft instead of under_review
//         });
//     }
// };

// Add a function to handle archiving
const handleArchive = () => {
    // In a real implementation, this would archive the page
    message.info('Archive functionality would be implemented here');
};
