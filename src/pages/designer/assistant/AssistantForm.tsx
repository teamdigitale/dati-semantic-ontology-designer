import { ClearOutlined, CloseOutlined, HistoryOutlined, PlusOutlined, SendOutlined } from "@ant-design/icons"
import { Button, Drawer, Flex, Input, Popconfirm, Typography, Upload } from "antd"
import React, { useContext, useState } from "react"
import { MessageItem } from "src/model"
import AssistantContext from "./AssistantContext"
import AssistantHistory from "./AssistantHistory"

export interface AssistantFormProps<T = any> {
  response?: MessageItem<T>
  loading: boolean
  onSubmit: (value: string) => void
  /** shows the file loader if true */
  acceptFiles?: boolean
  onAccept?: () => void
  onReject?: () => void
  headerInfo: { title: React.ReactNode, subTitle: React.ReactNode, extra?: React.ReactNode }
  /** callback for custom rendering the extra data that might be attached to a message. */
  renderExtraData: (extraData: T, inHistory: boolean) => React.ReactNode
  /** for extra settings or buttons to be displayed before the send button */
  extraSendBtns?: React.ReactNode
  /** 
   * custom buttons/components to handle how the user should react with the response.
   * If not defined, accept/reject default buttons will be shown
   */
  customResponseBtns?: React.ReactNode
  historyPlacement?: 'bottom' | 'right' | 'left'
  historyWidth?: number | string
  historyHeight?: number | string
  textAreaRows?: number,
  textAreaLengthLimit?: number,
}

/**
 * Generic component for handling requests to an assistant in a
 * NON-CHAT way. keep it generic (see the generic type T on messageItem?)
 * cause we reuse it for different services. Each service might have a
 * different type of structured response.
 * @param props 
 * @returns 
 */
export default function AssistantForm(props: AssistantFormProps) {
  const {
    response,
    loading,
    acceptFiles = true,
    onSubmit,
    onAccept,
    onReject,
    headerInfo,
    renderExtraData,
  } = props
  const [value, setValue] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const { requestHistory, setRequestHistory, onClose, isAssistantRequestPending } = useContext(AssistantContext)

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const upload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setValue(content);
      return false; // Prevent default upload behavior
    };
    reader.readAsText(file);
    return false; // Prevent default upload behavior   
  }

  const historyTitle = <Flex justify="space-between">
    <Flex gap={8} align="center">
      <HistoryOutlined />
      <Typography.Title level={5} style={{ margin: 0 }}>Request History</Typography.Title>
    </Flex>
    <Popconfirm
      title="Are you sure you want to clear the history? This action cannot be undone."
      onConfirm={() => setRequestHistory(requestHistory.filter(h => h.response && h.response.accepted === undefined))}
    >
      <Button
        size="small"
        style={{ alignSelf: "center" }}
        icon={<ClearOutlined />}
        disabled={requestHistory.length === 0}
      >
        Clear History
      </Button>
    </Popconfirm>
  </Flex>

  return <>
    <Flex vertical gap={8} style={{ padding: 8, maxHeight: "100%", overflow: "hidden" }} align="center">
      <div style={{ flexShrink: 0, width: "100%" }}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={16}>
            <Button icon={<CloseOutlined />} type="text" disabled={isAssistantRequestPending} onClick={onClose} />
            <Typography.Title level={3} style={{ margin: 0 }}>
              {headerInfo.title}
            </Typography.Title>
          </Flex>
          <Flex align="center" gap={8}>
            {headerInfo.extra}
            <Button size="small" icon={<HistoryOutlined />} onClick={() => setShowHistory(true)}>History</Button>
          </Flex>
        </Flex>
        <Typography.Paragraph type="secondary" style={{ marginTop: 16 }}>
          {headerInfo.subTitle}
        </Typography.Paragraph>
      </div>
      <div style={{ flexShrink: 1, overflowY: "auto", width: "100%" }}>
        <Flex vertical gap={8}>
          <Flex vertical gap={8} style={{ maxWidth: 800, alignSelf: 'center', width: "100%" }}>
            {acceptFiles && <Upload.Dragger
              accept=".txt"
              beforeUpload={upload}
              fileList={[]}
              disabled={loading || !!response}
            >
              <PlusOutlined />
              <p>Drop a .txt file here or click to upload</p>
            </Upload.Dragger>}
            <Input.TextArea
              style={{ marginBottom: 22 }}
              placeholder="Enter text..."
              rows={props.textAreaRows || 4}
              maxLength={props.textAreaLengthLimit || 10000}
              showCount
              disabled={loading || !!response}
              // style={{ maxHeight: 200 }}
              onChange={handleChange}
              value={value}
              allowClear
            />
          </Flex>
          {response && <Typography.Text>{response.content}</Typography.Text>}
          {response?.extraData && renderExtraData(response.extraData, false)}
        </Flex>
      </div>

      <div style={{ flexShrink: 0 }}>
        {response
          ? <Flex gap={8} justify="center">
            {props.customResponseBtns || <>
              <Button onClick={onReject}>Reject</Button>
              <Button type="primary" onClick={() => {
                setValue('')
                onAccept()
              }}>Accept</Button>
            </>}
          </Flex>
          : <Flex vertical gap={16} align="center">
            {props.extraSendBtns}
            <Button
              htmlType="submit"
              loading={loading}
              onClick={() => value && onSubmit(value)}
              type="primary"
              disabled={value.trim().length === 0}
              icon={<SendOutlined />}
            >Send</Button>
          </Flex>}
      </div>
    </Flex>
    <Drawer
      title={historyTitle}
      open={showHistory}
      onClose={() => setShowHistory(false)}
      width={props.historyPlacement !== 'bottom' && props.historyWidth ? props.historyWidth : '45vw'}
      height={props.historyPlacement === 'bottom' && props.historyHeight ? props.historyHeight : '100vh'}
      placement={props.historyPlacement}
      style={{ minWidth: 400 }}>
      <AssistantHistory renderExtraData={(resultData: any) => renderExtraData(resultData, true)} />
    </Drawer>
  </>
}