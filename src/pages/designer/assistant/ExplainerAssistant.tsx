import { DownloadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, Layout } from "antd";
import { useContext, useState } from "react";
import { VscChatSparkle } from "react-icons/vsc";
import Markdown from "react-markdown";
import { RDFGraph } from "src/gen";
import { PutOntologyQueryAI200Response } from "src/gen/models/PutOntologyQueryAI200Response";
import { AssistantRequestStatusEnum, MessageItem, RequestHistoryItem } from "src/model";
import { RAGApi } from "src/store/store";
import { downloadTextFile } from "src/utils/utils";
import { ToolbarContext } from "../ToolbarContext";
import AssistantContext, { AssistantContextType } from "./AssistantContext";
import AssistantForm from "./AssistantForm";

export default function ExplainerAssistant() {

  const [response, setResponse] = useState<MessageItem<PutOntologyQueryAI200Response>>()
  const [loading, setLoading] = useState(false)
  const [ontologySummary, setOntologySummary] = useState<string | undefined>(undefined)
  const [ontologySummaryLoading, setOntologySummaryLoading] = useState(false)
  const [ontologySummaryVisible, setOntologySummaryVisible] = useState(false)
  const [lastRDFGraphSummarized, setLastRDFGraphSummarized] = useState<RDFGraph | undefined>(undefined)

  const designer = useContext(ToolbarContext).grapholscape
  const assistantContext = useContext<AssistantContextType<PutOntologyQueryAI200Response>>(AssistantContext)


  const onSubmitNewMessage = async (newMessage: string) => {
    setLoading(true)
    setResponse(undefined)
    const newRequestHistoryItem: RequestHistoryItem<PutOntologyQueryAI200Response> = {
      messageSent: {
        author: 'user', // just a placeholder
        datetime: Date.now(),
        content: newMessage,
      },
      status: {
        code: AssistantRequestStatusEnum.PENDING,
        progress: 0,
      },
    }
    assistantContext.setRequestHistory([...assistantContext.requestHistory, newRequestHistoryItem])
    RAGApi.putOntologyQueryAI({
      putOntologyQueryAIRequest: {
        text: newMessage,
        currentRdfGraph: designer.exportToRdfGraph(),
      }
    }).then(response => {
      const responseMessage: MessageItem<PutOntologyQueryAI200Response> = {
        author: 'assistant',
        datetime: Date.now(),
        content: '',
        extraData: {
          queryAnswer: response.queryAnswer || '',
          ontologyEntities: response.ontologyEntities || {},
        }
      }

      newRequestHistoryItem.response = responseMessage

      setResponse(responseMessage)
      // setLoading(false)
    }).finally(() => setLoading(false))
  }

  const onNewRequest = () => {
    const lastResponse = assistantContext.requestHistory.find(r => r.response === response)
    lastResponse.response.accepted = true

    assistantContext.setRequestHistory([...assistantContext.requestHistory])
    setResponse(undefined)
  }

  const onOntologySummary = () => {
    setOntologySummaryVisible(true)
    const rdfGraph = designer.exportToRdfGraph()

    if (!ontologySummaryLoading && (!lastRDFGraphSummarized || JSON.stringify(rdfGraph) !== JSON.stringify(lastRDFGraphSummarized))) {
      setOntologySummaryLoading(true)
      setLastRDFGraphSummarized(rdfGraph)
      RAGApi.postOntologySummary({
        postOntologySummaryRequest: {
          currentRdfGraph: rdfGraph
        }
      }).then((result) => {
        setOntologySummary(result)
      })
        .finally(() => setOntologySummaryLoading(false))
    }
  }

  return (
    <Layout style={{ height: "100%", overflow: 'auto' }}>
      <Layout.Content>
        <AssistantForm
          onSubmit={onSubmitNewMessage}
          response={response}
          loading={loading}
          acceptFiles={false}
          headerInfo={{
            title: <Flex gap={8} align="center">{VscChatSparkle({})}<span>AI Explain</span></Flex>,
            subTitle: "Ask for something about the current designed ontology.",
            extra: <Button icon={<QuestionCircleOutlined />} size="small" onClick={onOntologySummary}>
              Summarize Ontology
            </Button>
          }}
          renderExtraData={(extraData: PutOntologyQueryAI200Response) => {
            let md = extraData.queryAnswer
            let keys = Object.keys(extraData.ontologyEntities)
              .sort((a, b) => b.length - a.length)
            keys.forEach(w => {
              md = md.replaceAll(new RegExp(`([^[])(${w})(?!\\])`, 'g'), `$1[${w}]`)
            })
            keys.forEach(w => {
              md = md.replaceAll(new RegExp(`(\\[${w}\\])`, 'g'), `$1(${extraData.ontologyEntities[w]})`)
            })

            return <Markdown components={{
              a(props) {
                return <a
                  onClick={() => designer.selectEntity(props.href, undefined, 1.5)}>
                  {props.children}
                </a>
              }
            }}>
              {md}
            </Markdown>
          }}
          customResponseBtns={<Button type="primary" onClick={onNewRequest}>Ok</Button>}
        ></AssistantForm>
      </Layout.Content>
      <Drawer
        loading={ontologySummaryLoading}
        open={ontologySummaryVisible}
        width={"80vw"}
        title={"Ontology Summary"}
        onClose={() => setOntologySummaryVisible(false)}
        extra={<Button
          size="small"
          icon={<DownloadOutlined />}
          onClick={() => downloadTextFile(ontologySummary, 'ontology-summary.md')}>
          Download
        </Button>}
      >
        <Markdown>{ontologySummary}</Markdown>
      </Drawer>
    </Layout>
  )
}