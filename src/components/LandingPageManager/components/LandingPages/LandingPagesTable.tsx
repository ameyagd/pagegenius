import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { Button, Space, Tag, Tooltip } from 'antd';
import { EditOutlined, CopyOutlined, BarChartOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { LandingPage } from '../../types';
import AnalyticsDrawer from './AnalyticsDrawer';
import { useQuery } from '@tanstack/react-query';
import { fetchPageAnalytics } from '../../api/services';

interface LandingPagesTableProps {
    data: LandingPage[];
    isLoading: boolean;
    onDuplicate: (page: LandingPage) => void;
    onPageUpdated?: (pageId: string) => void;
    onEditPage: (pageId: string) => void;
}

export const LandingPagesTable: React.FC<LandingPagesTableProps> = ({ data, isLoading, onDuplicate, onEditPage }) => {
    const [analyticsDrawerPage, setAnalyticsDrawerPage] = useState<string | null>(null);

    // Fetch analytics data for all pages
    const { data: analyticsData = {} } = useQuery({
        queryKey: ['pagesAnalytics', data.map((page) => page.id)],
        queryFn: () =>
            Promise.all(data.map((page) => fetchPageAnalytics(page.id))).then((results) => {
                const analyticsMap: Record<string, any> = {};
                results.forEach((analytics) => {
                    if (analytics) {
                        analyticsMap[analytics.pageId] = analytics;
                    }
                });
                return analyticsMap;
            }),
        enabled: data.length > 0,
    });

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

    const columns: MRT_ColumnDef<LandingPage>[] = [
        {
            id: 'actions',
            header: 'Actions',
            mantineTableHeadCellProps: {
                align: 'center',
                style: {
                    // Ensure consistent header styling with sorting icon on right
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                },
            },
            enableSorting: false, // Actions column doesn't need sorting
            mantineTableBodyCellProps: { align: 'center' },
            size: 90, // Explicit width for actions column
            minSize: 90,
            maxSize: 90,
            Cell: ({ row }) => (
                <Space>
                    <Tooltip title='Edit'>
                        <Button icon={<EditOutlined />} onClick={() => onEditPage(row.original.id)} />
                    </Tooltip>
                    <Tooltip title='Duplicate'>
                        <Button icon={<CopyOutlined />} onClick={() => onDuplicate(row.original)} />
                    </Tooltip>
                    <Tooltip title='Analytics'>
                        <Button icon={<BarChartOutlined />} onClick={() => setAnalyticsDrawerPage(row.original.id)} />
                    </Tooltip>
                </Space>
            ),
        },
        {
            accessorKey: 'title',
            header: 'Title',
            // Explicitly set left alignment for textual data
            mantineTableHeadCellProps: {
                align: 'left',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                },
            },
            mantineTableBodyCellProps: { align: 'left' },
            size: 200, // Default size for title column
            minSize: 150,
        },
        {
            accessorKey: 'slug',
            header: 'Slug',
            mantineTableHeadCellProps: {
                align: 'left',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                },
            },
            mantineTableBodyCellProps: { align: 'left' },
            size: 180, // Default size for slug column
            minSize: 150,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            mantineTableHeadCellProps: {
                align: 'left',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                },
            },
            mantineTableBodyCellProps: { align: 'left' },
            // Explicit sizing for compact columns
            size: 60,
            minSize: 60,
            maxSize: 60,
            Cell: ({ row }) => <Tag color={getStatusColor(row.original.status)}>{row.original.status.replace('_', ' ')}</Tag>,
        },
        {
            accessorKey: 'isAiGenerated',
            header: 'Source',
            mantineTableHeadCellProps: {
                align: 'left',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                },
            },
            mantineTableBodyCellProps: { align: 'left' },
            // Explicit sizing for compact columns
            size: 80,
            minSize: 80,
            maxSize: 80,
            Cell: ({ row }) => (row.original.isAiGenerated ? 'AI Generated' : 'Manual'),
        },
        // Analytics columns - right-aligned for numeric data
        {
            accessorFn: (row) => analyticsData[row.id]?.pageViews || 0,
            id: 'pageViews',
            header: 'Page Views',
            mantineTableHeadCellProps: {
                align: 'right',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    '& .mantine-TableHeadCell-Content': {
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    },
                    '& .mantine-TableHeadCell-Content-Labels': {
                        flexDirection: 'row',
                    },
                },
            },
            mantineTableBodyCellProps: { align: 'right' },
            // Explicit sizing for numeric columns
            size: 80,
            minSize: 80,
            maxSize: 80,
            Cell: ({ row }) => analyticsData[row.original.id]?.pageViews || 0,
        },
        {
            accessorFn: (row) => analyticsData[row.id]?.clicks || 0,
            id: 'clicks',
            header: 'Clicks',
            mantineTableHeadCellProps: {
                align: 'right',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    '& .mantine-TableHeadCell-Content': {
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    },
                    '& .mantine-TableHeadCell-Content-Labels': {
                        flexDirection: 'row',
                    },
                },
            },
            mantineTableBodyCellProps: { align: 'right' },
            // Explicit sizing for numeric columns
            size: 80,
            minSize: 80,
            maxSize: 80,
            Cell: ({ row }) => analyticsData[row.original.id]?.clicks || 0,
        },
        {
            accessorFn: (row) => analyticsData[row.id]?.adViews || 0,
            id: 'adViews',
            header: 'Ad Views',
            mantineTableHeadCellProps: {
                align: 'right',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    '& .mantine-TableHeadCell-Content': {
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    },
                    '& .mantine-TableHeadCell-Content-Labels': {
                        flexDirection: 'row',
                    },
                },
            },
            mantineTableBodyCellProps: { align: 'right' },
            // Explicit sizing for numeric columns
            size: 80,
            minSize: 80,
            maxSize: 80,
            Cell: ({ row }) => analyticsData[row.original.id]?.adViews || 0,
        },
        {
            accessorFn: (row) => analyticsData[row.id]?.conversions || 0,
            id: 'conversions',
            header: 'Conversions',
            mantineTableHeadCellProps: {
                align: 'right',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    '& .mantine-TableHeadCell-Content': {
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    },
                    '& .mantine-TableHeadCell-Content-Labels': {
                        flexDirection: 'row',
                    },
                },
            },
            mantineTableBodyCellProps: { align: 'right' },
            // Explicit sizing for numeric columns
            size: 80,
            minSize: 80,
            maxSize: 80,
            Cell: ({ row }) => analyticsData[row.original.id]?.conversions || 0,
        },
        {
            accessorFn: (row) => analyticsData[row.id]?.ctr || 0,
            id: 'ctr',
            header: 'CTR',
            mantineTableHeadCellProps: {
                align: 'right',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    '& .mantine-TableHeadCell-Content': {
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    },
                    '& .mantine-TableHeadCell-Content-Labels': {
                        flexDirection: 'row',
                    },
                },
            },
            mantineTableBodyCellProps: { align: 'right' },
            // Explicit sizing for numeric columns
            size: 80,
            minSize: 80,
            maxSize: 80,
            Cell: ({ row }) => {
                const ctr = analyticsData[row.original.id]?.ctr || 0;
                return `${ctr.toFixed(2)}%`;
            },
        },
        {
            accessorFn: (row) => analyticsData[row.id]?.conversionValue || 0,
            id: 'conversionValue',
            header: 'Conv. Value',
            mantineTableHeadCellProps: {
                align: 'right',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    '& .mantine-TableHeadCell-Content': {
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                    },
                    '& .mantine-TableHeadCell-Content-Labels': {
                        flexDirection: 'row',
                    },
                },
            },
            mantineTableBodyCellProps: { align: 'right' },
            // Explicit sizing for numeric columns
            size: 80,
            minSize: 80,
            maxSize: 80,
            Cell: ({ row }) => {
                const value = analyticsData[row.original.id]?.conversionValue || 0;
                return `$${value.toFixed(2)}`;
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Created On',
            mantineTableHeadCellProps: {
                align: 'left',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                },
            },
            mantineTableBodyCellProps: { align: 'left' },
            // Explicit sizing for date columns
            size: 60,
            minSize: 60,
            maxSize: 60,
            Cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated On',
            mantineTableHeadCellProps: {
                align: 'left',
                sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                },
            },
            mantineTableBodyCellProps: { align: 'left' },
            // Explicit sizing for date columns
            size: 60,
            minSize: 60,
            maxSize: 60,
            Cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
        },
    ];

    // Add a handler for page updates
    // const handlePageUpdated = (pageId: string) => {
    //     if (onPageUpdated) {
    //         onPageUpdated(pageId);
    //     }
    // };

    return (
        <>
            <MantineReactTable
                columns={columns}
                data={data}
                state={{ isLoading }}
                enableColumnFilters={false}
                enableGlobalFilter={false}
                enableFullScreenToggle={false}
                enableDensityToggle={false}
                enableColumnActions={false}
                initialState={{
                    density: 'xs', // Use extra small density for compact rows
                    sorting: [{ id: 'updatedAt', desc: true }],
                }}
                enableHiding={false}
                enablePagination
                positionPagination='bottom'
                enableRowVirtualization
                enableTopToolbar={false}
                // Configure table layout and styling using MRT props
                mantineTableContainerProps={{
                    style: { maxHeight: '800px' },
                }}
                // Configure sorting icon placement - this applies to all sorted headers
                // mantineSortedHeaderCellProps={{
                //     style: {
                //         display: 'flex',
                //         alignItems: 'center',
                //         justifyContent: 'flex-end', // Always place sort icon on the right
                //         width: '100%',
                //     },
                // }}
                // Configure table props for consistent spacing and layout
                mantineTableProps={{
                    withColumnBorders: true,
                    highlightOnHover: true,
                    striped: false,
                    sx: {
                        // tableLayout: 'fixed', // Use fixed layout for consistent column widths
                        width: '100%', // Ensure table takes full width
                    },
                }}
                // Configure cell padding to reduce vertical spacing
                mantineTableBodyCellProps={{
                    sx: {
                        padding: '8px', // Consistent padding for all cells
                    },
                }}
                // Configure header cell padding and styling
                mantineTableHeadCellProps={{
                    sx: {
                        padding: '8px', // Consistent padding for header cells
                        fontWeight: 600,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    },
                }}
            />

            {/* Analytics Drawer */}
            {analyticsDrawerPage && (
                <AnalyticsDrawer
                    visible={!!analyticsDrawerPage}
                    onClose={() => setAnalyticsDrawerPage(null)}
                    pageId={analyticsDrawerPage}
                    onEdit={() => {
                        onEditPage(analyticsDrawerPage);
                        setAnalyticsDrawerPage(null);
                    }}
                />
            )}
        </>
    );
};

export default LandingPagesTable;
