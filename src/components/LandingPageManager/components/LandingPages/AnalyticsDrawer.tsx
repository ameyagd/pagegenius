import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Drawer, Card, Row, Col, Statistic, Button, Space, Select, Table, Alert, Typography, Form, DatePicker, Radio, Divider } from 'antd';
import { LineChartOutlined, BarChartOutlined, PieChartOutlined, EditOutlined } from '@ant-design/icons';
import { fetchLandingPage, fetchPageAnalytics } from '../../api/services';

const { Option } = Select;
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface AnalyticsDrawerProps {
    visible: boolean;
    onClose: () => void;
    pageId: string;
    onEdit: () => void;
}

const AnalyticsDrawer: React.FC<AnalyticsDrawerProps> = ({ visible, onClose, pageId, onEdit }) => {
    const [dimension, setDimension] = useState<'device' | 'browser' | 'country'>('device');
    const [isFilterDrawerVisible, setIsFilterDrawerVisible] = useState(false);
    const [filterForm] = Form.useForm();

    // Fetch landing page
    const { data: page, isLoading: isPageLoading } = useQuery({
        queryKey: ['landingPage', pageId],
        queryFn: () => fetchLandingPage(pageId),
        enabled: !!pageId && visible,
    });

    // Fetch analytics
    const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ['analytics', pageId],
        queryFn: () => fetchPageAnalytics(pageId),
        enabled: !!pageId && visible,
    });

    // Convert dimension data to table format
    const dimensionData = analytics
        ? Object.entries(analytics.dimensions[dimension] || {}).map(([key, value]) => ({
              key,
              name: key,
              value,
              percentage: analytics.pageViews > 0 ? Math.round((value / analytics.pageViews) * 100) : 0,
          }))
        : [];

    const handleFilterSubmit = (values: any) => {
        console.log('Filter values:', values);
        // In a real app, we would use these values to filter the analytics data
        setIsFilterDrawerVisible(false);
    };

    return (
        <Drawer
            title='Page Analytics'
            placement='right'
            width={720}
            onClose={onClose}
            open={visible}
            extra={
                <Space>
                    <Button icon={<EditOutlined />} onClick={onEdit}>
                        Edit Page
                    </Button>
                </Space>
            }
        >
            {isPageLoading || isAnalyticsLoading ? (
                <div>Loading...</div>
            ) : !page ? (
                <Alert message='Error' description='Landing page not found' type='error' showIcon />
            ) : (
                <>
                    {/* Overview Cards - Bento Layout */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card>
                                <Statistic
                                    title='Page Views'
                                    value={analytics?.pageViews || 0}
                                    prefix={<LineChartOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card>
                                <Statistic title='Clicks' value={analytics?.clicks || 0} prefix={<BarChartOutlined />} valueStyle={{ color: '#52c41a' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card>
                                <Statistic title='CTR' value={analytics?.ctr || 0} suffix='%' precision={2} valueStyle={{ color: '#faad14' }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={6}>
                            <Card>
                                <Statistic
                                    title='Conversions'
                                    value={analytics?.conversions || 0}
                                    prefix={<PieChartOutlined />}
                                    valueStyle={{ color: '#722ed1' }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Secondary Metrics */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} md={12}>
                            <Card title='Performance Metrics'>
                                <Row gutter={[16, 16]}>
                                    <Col span={12}>
                                        <Statistic title='Ad Views' value={analytics?.adViews || 0} />
                                    </Col>
                                    <Col span={12}>
                                        <Statistic title='Conversion Value' value={analytics?.conversionValue || 0} prefix='$' precision={2} />
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title='Page Information'>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>Status: </Text>
                                    <Text>{page.status.replace('_', ' ')}</Text>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <Text strong>URL: </Text>
                                    <Text>{`https://${page.domainId}/${page.slug}`}</Text>
                                </div>
                                <div>
                                    <Text strong>Created: </Text>
                                    <Text>{new Date(page.createdAt).toLocaleDateString()}</Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Dimension Analysis */}
                    <Card title='Dimension Analysis'>
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Space>
                                <span>Dimension:</span>
                                <Select value={dimension} onChange={setDimension} style={{ width: 150 }}>
                                    <Option value='device'>Device</Option>
                                    <Option value='browser'>Browser</Option>
                                    <Option value='country'>Country</Option>
                                </Select>
                            </Space>
                        </div>

                        <Table
                            dataSource={dimensionData}
                            columns={[
                                {
                                    title: dimension.charAt(0).toUpperCase() + dimension.slice(1),
                                    dataIndex: 'name',
                                    key: 'name',
                                },
                                {
                                    title: 'Views',
                                    dataIndex: 'value',
                                    key: 'value',
                                    sorter: (a, b) => a.value - b.value,
                                },
                                {
                                    title: 'Percentage',
                                    dataIndex: 'percentage',
                                    key: 'percentage',
                                    render: (text) => `${text}%`,
                                    sorter: (a, b) => a.percentage - b.percentage,
                                },
                            ]}
                            pagination={false}
                            size='small'
                        />
                    </Card>

                    {/* Filter Drawer */}
                    <Drawer
                        title='Analytics Filters'
                        placement='right'
                        width={400}
                        onClose={() => setIsFilterDrawerVisible(false)}
                        open={isFilterDrawerVisible}
                        extra={
                            <Space>
                                <Button onClick={() => filterForm.resetFields()}>Reset</Button>
                                <Button type='primary' onClick={() => filterForm.submit()}>
                                    Apply
                                </Button>
                            </Space>
                        }
                    >
                        <Form form={filterForm} layout='vertical' onFinish={handleFilterSubmit}>
                            <Form.Item name='dateRange' label='Date Range'>
                                <RangePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item name='device' label='Device'>
                                <Select mode='multiple' placeholder='Select devices' allowClear>
                                    <Option value='desktop'>Desktop</Option>
                                    <Option value='mobile'>Mobile</Option>
                                    <Option value='tablet'>Tablet</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name='browser' label='Browser'>
                                <Select mode='multiple' placeholder='Select browsers' allowClear>
                                    <Option value='chrome'>Chrome</Option>
                                    <Option value='firefox'>Firefox</Option>
                                    <Option value='safari'>Safari</Option>
                                    <Option value='edge'>Edge</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name='country' label='Country'>
                                <Select mode='multiple' placeholder='Select countries' allowClear>
                                    <Option value='us'>United States</Option>
                                    <Option value='ca'>Canada</Option>
                                    <Option value='uk'>United Kingdom</Option>
                                    <Option value='au'>Australia</Option>
                                </Select>
                            </Form.Item>

                            <Divider />

                            <Form.Item name='comparisonType' label='Comparison'>
                                <Radio.Group>
                                    <Radio value='none'>None</Radio>
                                    <Radio value='previousPeriod'>Previous Period</Radio>
                                    <Radio value='previousYear'>Previous Year</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Form>
                    </Drawer>
                </>
            )}
        </Drawer>
    );
};

export default AnalyticsDrawer;
