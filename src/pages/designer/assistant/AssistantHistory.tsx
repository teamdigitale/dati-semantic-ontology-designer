import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Button, Collapse, Divider, Empty, Flex, Popover, Typography } from "antd";
import { useContext } from "react";
import AssistantContext, { AssistantContextType } from "./AssistantContext";

interface AssistantHistoryProps<T = any> {
  numberOfItemsToShow: number,
  style: any,
  renderExtraData: (resultData: T) => React.ReactNode
}

export default function AssistantHistory<T>(props: Partial<AssistantHistoryProps<T>>) {
  const requestHistory = useContext<AssistantContextType<T>>(AssistantContext).requestHistory
  let { numberOfItemsToShow } = props
  if (numberOfItemsToShow === undefined) {
    numberOfItemsToShow = requestHistory.length
  }

  return requestHistory && requestHistory.length > 0
    ? <Collapse
      size="small"
      accordion
      defaultActiveKey={[requestHistory.length - 1]}
      items={requestHistory.filter((_, i) => numberOfItemsToShow + i >= requestHistory.length).map((historyItem, i) => {
        return {
          key: i,
          label: <Flex gap={8} align="center">
            {/* {historyItem.status.code === AssistantRequestStatusEnum.PENDING &&
              <Progress percent={historyItem.status.progress} type="circle" size={25} />
            } */}
            {historyItem.response?.accepted !== undefined && (
              historyItem.response.accepted
                ? <Popover content="Accepted"><CheckCircleOutlined style={{ color: 'green' }} /></Popover>
                : <Popover content="Rejected"><CloseCircleOutlined style={{ color: 'red' }} /></Popover>
            )}
            <Typography.Text>
              {historyItem.messageSent.content.substring(0, 60) + '...'}
            </Typography.Text>

          </Flex>,
          extra: <Typography.Text type="secondary" style={{ textWrap: "nowrap" }}>
            {new Intl.DateTimeFormat(navigator.language, {
              timeStyle: "short",
              dateStyle: "short",
            }).format(historyItem.messageSent.datetime)}
          </Typography.Text>,
          children: <div>
            <Typography.Text>{historyItem.messageSent.content}</Typography.Text>
            <Divider style={{ margin: "16px 0" }} />
            {!historyItem.response && <Empty description="No Response Yet" />}
            {historyItem.response && historyItem.response.content.length > 0 && <Typography.Text>{historyItem.response.content}</Typography.Text>}
            {historyItem.response?.extraData && props.renderExtraData && props.renderExtraData(historyItem.response.extraData)}
          </div>
        }
      })}
    />
    : <Empty description="No issued requests" />
}