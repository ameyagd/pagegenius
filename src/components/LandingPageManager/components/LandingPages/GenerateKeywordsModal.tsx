import React, { useState, useEffect } from 'react';
import { Modal, Button, Tag, message, Space, Typography } from 'antd';
import { CopyOutlined, ReloadOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { generateKeywords } from '../../api/keywordService';

const { Text } = Typography;

interface GenerateKeywordsModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (keywords: string[]) => void;
    contentToGenerateFrom: string;
}

const GenerateKeywordsModal: React.FC<GenerateKeywordsModalProps> = ({ visible, onClose, onSave, contentToGenerateFrom }) => {
    const [keywordSuggestions, setKeywordSuggestions] = useState<string[]>([]);
    const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    // Generate keywords when the modal becomes visible
    useEffect(() => {
        if (visible && contentToGenerateFrom) {
            generateKeywordSuggestions();
        }
    }, [visible, contentToGenerateFrom]);

    const generateKeywordSuggestions = async () => {
        if (!contentToGenerateFrom) {
            message.warning('Please enter some content to generate keywords from');
            return;
        }

        setIsGenerating(true);
        try {
            const suggestions = await generateKeywords(contentToGenerateFrom);
            setKeywordSuggestions(suggestions);
            // By default, select all keywords
            setSelectedKeywords(suggestions);
        } catch (error) {
            message.error('Failed to generate keywords');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleKeywordClick = (keyword: string) => {
        if (selectedKeywords.includes(keyword)) {
            setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
        } else {
            setSelectedKeywords([...selectedKeywords, keyword]);
        }
    };

    const handleCopyToClipboard = () => {
        if (selectedKeywords.length === 0) {
            message.warning('No keywords selected to copy');
            return;
        }

        navigator.clipboard.writeText(selectedKeywords.join(', '));
        message.success('Keywords copied to clipboard');
    };

    const handleSave = () => {
        if (selectedKeywords.length === 0) {
            message.warning('Please select at least one keyword');
            return;
        }

        onSave(selectedKeywords);
        onClose();
        message.success('Keywords saved successfully');
    };

    return (
        <Modal
            title='Generate Keywords'
            open={visible}
            onCancel={onClose}
            width={600}
            footer={[
                <Button key='close' onClick={onClose} icon={<CloseOutlined />}>
                    Close
                </Button>,
                <Button key='copy' onClick={handleCopyToClipboard} icon={<CopyOutlined />} disabled={selectedKeywords.length === 0}>
                    Copy
                </Button>,
                <Button key='generate' type='default' onClick={generateKeywordSuggestions} loading={isGenerating} icon={<ReloadOutlined />}>
                    Generate
                </Button>,
                <Button key='save' type='primary' onClick={handleSave} disabled={selectedKeywords.length === 0} icon={<SaveOutlined />}>
                    Save Changes
                </Button>,
            ]}
        >
            <div style={{ marginBottom: 16 }}>
                <Text>Select keywords to add to your landing page:</Text>
            </div>

            {isGenerating ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text>Generating keyword suggestions...</Text>
                </div>
            ) : keywordSuggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <Text>No keyword suggestions available. Click Generate to create suggestions.</Text>
                </div>
            ) : (
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <Space direction='vertical' style={{ width: '100%' }}>
                        {keywordSuggestions.map((keyword, index) => (
                            <Tag
                                key={index}
                                style={{
                                    margin: '0 8px 8px 0',
                                    padding: '5px 10px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    backgroundColor: selectedKeywords.includes(keyword) ? '#1890ff' : undefined,
                                    color: selectedKeywords.includes(keyword) ? 'white' : undefined,
                                }}
                                onClick={() => handleKeywordClick(keyword)}
                            >
                                {keyword}
                            </Tag>
                        ))}
                    </Space>
                </div>
            )}
        </Modal>
    );
};

export default GenerateKeywordsModal;
