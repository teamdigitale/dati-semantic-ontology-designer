import { Button, Empty, Input, List, Tooltip, Flex, Space, Typography } from "antd"
import { useEffect, useState } from "react"
import { EyeOutlined, ReloadOutlined, SendOutlined, CheckCircleOutlined } from '@ant-design/icons'
import React from "react";
import { MessageItem } from "src/model";

const { TextArea } = Input
const { Text } = Typography

export interface AssistantChatProps {
  messages: MessageItem[],
  loading: boolean,
  onSubmit: (value: string) => void
  onPreview: (message: MessageItem) => void
  onReset: () => void
  assistantName: string
}

interface EditorProps {
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onReset: () => void;
  loading: boolean;
  value: string;
}

export const ChatMessage = ({ message, alignment, onPreview }: { message: MessageItem, alignment: 'left' | 'right', onPreview: (message: MessageItem) => void }) => (
  <div style={{ display: "flex", justifyContent: alignment, marginBottom: "16px" }}>
    <div style={{ width: '90%' }}>
      <Text type="secondary" style={{ textAlign: alignment, display: "inline-block", width: "100%" }}>
        <span style={{ marginRight: "8px" }}>{message.author}</span>
        <span>{new Intl.DateTimeFormat(navigator.language, {
          timeStyle: "short",
          dateStyle: "short",
        }).format(message.datetime)}</span>
      </Text>

      <div style={{
        display: 'flex',
        justifyContent: alignment,
        gap: "8px",
        alignItems: "center"
      }}>
        <div
          style={{
            background: alignment === 'right' ? 'rgb(0, 0, 0, 0.1)' : 'rgb(0, 0, 0, 0.2)',
            borderRadius: "2px",
            padding: "8px",
            display: 'flex',
            gap: 4,
            justifyContent: 'space-between',
            flexDirection: 'column',
          }}
        >
          <p style={{
            display: "inline-block",
            maxWidth: "100%",
            overflowWrap: "anywhere",
            textAlign: "left",
            margin: 0,
          }}>{message.content}</p>
          {/* checkmark for accepted results */}
          {message.extraData && message.accepted &&
            <Tooltip title="Result has been accepted">
              <CheckCircleOutlined style={{ alignSelf: "end", color: "var(--highlight) " }} />
            </Tooltip>
          }
        </div>
        {message.extraData &&
          <Tooltip title="Preview">
            <Button type="dashed" shape="circle" size="small" icon={<EyeOutlined />} onClick={() => onPreview(message)} />
          </Tooltip>
        }
      </div>
    </div>
  </div >
)

const MessageList = ({ messages, assistantName, onPreview }: { messages: MessageItem[], loading: boolean, assistantName: string, onPreview: (message: MessageItem) => void }) => (
  <List
    dataSource={messages}
    itemLayout="horizontal"
    renderItem={(messageItem) => ChatMessage({ message: messageItem, alignment: messageItem.author === assistantName ? 'left' : 'right', onPreview})}
  />
);

const Editor = ({ onChange, onSubmit, onReset, loading, value }: EditorProps) => (
  <Flex wrap={false} style={{ margin: 16 }} justify={"space-between"} gap={20}>
    <Space.Compact style={{ flexGrow: '2' }} >
      <TextArea
        placeholder="Enter text..."
        rows={1}
        onChange={onChange}
        value={value}
        allowClear
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey) {
            e.preventDefault()
          }
        }}
        onKeyUp={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (value.length > 0 && e.key === "Enter" && !e.ctrlKey && !e.shiftKey) {
            onSubmit()
          }
        }}
      />
      <Button htmlType="submit" loading={loading} onClick={onSubmit} type="primary" icon={<SendOutlined />} />
    </Space.Compact>
    <Tooltip title="Reset Chat">
      <Button shape="circle" icon={<ReloadOutlined />} onClick={onReset} />
    </Tooltip>
  </Flex>
);

export default function AssistantChat({ messages, loading, onSubmit, onPreview, onReset, assistantName }: AssistantChatProps) {
  const [value, setValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const handleSubmit = () => {
    if (!value) return;
    onSubmit(value)
    setValue('')
  };

  useEffect(() => {
    let scrollableDiv = document.getElementById("scrollable-wrapper")
    if (scrollableDiv) {
      scrollableDiv.scrollTop = scrollableDiv.scrollHeight
    }
  }, [messages])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flexGrow: 1 }}>
        <div id="scrollable-wrapper" style={{ flexGrow: 2, minHeight: 0, overflow: 'auto', padding: '16px 24px' }}>
          {messages.length > 0
            ? <MessageList messages={messages} loading={loading} assistantName={assistantName} onPreview={onPreview} />
            : <Empty description="No messages"></Empty>
          }
        </div>
        <Editor
          onChange={handleChange}
          onSubmit={handleSubmit}
          onReset={onReset}
          loading={loading}
          value={value}
        />
      </div>
    </div>
  );
}