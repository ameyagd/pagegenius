import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { Button, Space, Tag, Tooltip, Drawer } from 'antd';
import { EyeOutlined, EditOutlined, CopyOutlined, LinkOutlined, BarChartOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { LandingPage } from '../../types';
import EditLandingPageDrawer from './EditLandingPageDrawer';
import PreviewLandingPageDrawer from './PreviewLandingPageDrawer';
import AnalyticsDrawer from './AnalyticsDrawer';

interface LandingPagesTableProps {
  data: LandingPage[];
  isLoading: boolean;
  onDuplicate: (page: LandingPage) => void;
}

export const LandingPagesTable: React.FC<LandingPagesTableProps> = ({
  data,
  isLoading,
  onDuplicate,
}) => {
  const [editDrawerPage, setEditDrawerPage] = useState<string | null>(null);
  const [previewDrawerPage, setPreviewDrawerPage] = useState<string | null>(null);
  const [analyticsDrawerPage, setAnalyticsDrawerPage] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'under_review': return 'orange';
      default: return 'default';
    }
  };

  const columns: MRT_ColumnDef<LandingPage>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'slug',
      header: 'Slug',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      Cell: ({ row }) => (
        <Tag color={getStatusColor(row.original.status)}>
          {row.original.status.replace('_', ' ')}
        </Tag>
      ),
    },
    {
      accessorKey: 'isAiGenerated',
      header: 'Source',
      Cell: ({ row }) => (
        row.original.isAiGenerated ? 'AI Generated' : 'Manual'
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created On',
      Cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Updated On',
      Cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      Cell: ({ row }) => (
        <Space>
          <Tooltip title="Edit">
            <Button 
              icon={<EditOutlined />}
              onClick={() => setEditDrawerPage(row.original.id)}
            />
          </Tooltip>
          <Tooltip title="Preview">
            <Button 
              icon={<EyeOutlined />}
              onClick={() => setPreviewDrawerPage(row.original.id)}
            />
          </Tooltip>
          <Tooltip title="Duplicate">
            <Button 
              icon={<CopyOutlined />}
              onClick={() => onDuplicate(row.original)}
            />
          </Tooltip>
          <Tooltip title="View Live Page">
            <Button 
              icon={<LinkOutlined />}
              disabled={row.original.status !== 'approved'}
              onClick={() => window.open(`https://${row.original.domainId}/${row.original.slug}`, '_blank')}
            />
          </Tooltip>
          <Tooltip title="Analytics">
            <Button 
              icon={<BarChartOutlined />}
              onClick={() => setAnalyticsDrawerPage(row.original.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <MantineReactTable
        columns={columns}
        data={data}
        state={{ isLoading }}
        enableColumnFiltering
        enableGlobalFilter
        enableFullScreenToggle={false}
        enableDensityToggle={false}
        enableColumnActions={false}
        initialState={{
          sorting: [{ id: 'updatedAt', desc: true }],
        }}
      />

      {/* Edit Drawer */}
      {editDrawerPage && (
        <EditLandingPageDrawer
          visible={!!editDrawerPage}
          onClose={() => setEditDrawerPage(null)}
          pageId={editDrawerPage}
        />
      )}

      {/* Preview Drawer */}
      {previewDrawerPage && (
        <PreviewLandingPageDrawer
          visible={!!previewDrawerPage}
          onClose={() => setPreviewDrawerPage(null)}
          pageId={previewDrawerPage}
          onEdit={() => {
            setEditDrawerPage(previewDrawerPage);
            setPreviewDrawerPage(null);
          }}
          onAnalytics={() => {
            setAnalyticsDrawerPage(previewDrawerPage);
            setPreviewDrawerPage(null);
          }}
        />
      )}

      {/* Analytics Drawer */}
      {analyticsDrawerPage && (
        <AnalyticsDrawer
          visible={!!analyticsDrawerPage}
          onClose={() => setAnalyticsDrawerPage(null)}
          pageId={analyticsDrawerPage}
          onEdit={() => {
            setEditDrawerPage(analyticsDrawerPage);
            setAnalyticsDrawerPage(null);
          }}
          onPreview={() => {
            setPreviewDrawerPage(analyticsDrawerPage);
            setAnalyticsDrawerPage(null);
          }}
        />
      )}
    </>
  );
};

export default LandingPagesTable; 