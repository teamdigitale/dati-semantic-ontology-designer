import { Flex, Layout } from "antd";
import { DiagramRepresentation, GrapholElement, GrapholEntity, TypesEnum } from "grapholscape";
import { useContext, useState } from "react";
import { VscEditSparkle } from "react-icons/vsc";
import mergeRDFGraph from "src/builder/merge-rdf-graph";
import { setDesignerStyle } from "src/builder/ui/style";
import { AssistantRequestStatusEnum, MessageItem, NewClassItem, NewItem, RequestHistoryItem } from "src/model";
import { RAGApi } from "src/store/store";
import OntologyBuilder from "../../../builder/ontology-builder";
import { ToolbarContext } from "../ToolbarContext";
import AssistantContext, { AssistantContextType } from "./AssistantContext";
import AssistantForm from "./AssistantForm";
import EntitiesTree from "./EntitiesTree";

export default function DesignerAssistant() {
  const assistantName = "AI Design"

  const mainContext = useContext(ToolbarContext)
  const designer = mainContext.grapholscape
  const designerAssistantSettings = mainContext.designerAssistantSettings
  const [messages, setMessages] = useState<MessageItem<NewClassItem[]>[]>([]);
  const [loading, setLoading] = useState(false)

  const assistantContext = useContext<AssistantContextType<NewClassItem[]>>(AssistantContext)
  const unCheckedEntities: Map<string, NewClassItem> = new Map()

  const onSubmitNewMessage = async (newMessage: string) => {

    setLoading(true)
    setMessages([])
    const newRequestHistoryItem: RequestHistoryItem = {
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
    assistantContext.setIsAssistantRequestPending(true)
    RAGApi.putOntologyDraftAI({
      name: designer.ontology.name || 'Ontology',
      putOntologyDraftAIRequest: {
        text: newMessage,
        currentRdfGraph: designer.exportToRdfGraph(),
        iriStyle: designerAssistantSettings.iriStyle,
        simpleNameLanguage: designerAssistantSettings.simpleNameLanguage,
        annotationLanguage: designer.language,
      }
    }).then(response => {
      mergeRDFGraph(designer, response);
      (designer.container.querySelector('gscape-designer-toolbox') as any)?.requestUpdate()
      // clearInterval(interval)
      const newlyAddedList: NewClassItem[] = []
      let cy: cytoscape.Core | undefined
      let grapholElement: GrapholElement | undefined, propElement: GrapholElement | undefined
      let grapholEntity: GrapholEntity | undefined
      for (let diagram of designer.ontology.diagrams) {
        cy = diagram.representations.get(designer.renderState!)?.cy

        for (let elem of cy?.$(`[type = "${TypesEnum.CLASS}"]`) || []) {
          grapholElement = diagram.representations.get(designer.renderState!)?.grapholElements.get(elem.id())
          grapholEntity = designer.ontology.getEntity(elem.data().iri || '')
          if (grapholElement && grapholEntity) {
            const newClassItem: NewClassItem = {
              grapholElement,
              grapholEntity,
            }
            for (let property of elem.neighborhood(`[?aiGenerated.isNew][type != "${TypesEnum.CLASS}"]`)) {
              propElement = diagram.representations.get(designer.renderState!)?.grapholElements.get(property.id())
              const propEntity: GrapholEntity | undefined = designer.ontology.getEntity(property.data().iri || '')
              if (propElement && propEntity) {
                if (elem.data().aiGenerated?.isNew) {
                  if (!newClassItem.properties) {
                    newClassItem.properties = []
                  }
                  newClassItem.properties.push({ grapholElement: propElement, grapholEntity: propEntity })
                } else if (property.connectedNodes().every(n => !n.data().aiGenerated?.isNew)) {
                  newlyAddedList.push({
                    grapholElement: propElement,
                    grapholEntity: propEntity,
                  })
                }
              }
            }

            if (elem.data().aiGenerated?.isNew) {
              newlyAddedList.push(newClassItem)
            }
          }
        }
      }

      const responseMessage: MessageItem<NewClassItem[]> = {
        author: assistantName,
        datetime: Date.now(),
        extraData: newlyAddedList,
        content: 'Generated entities:'
      }

      if (newlyAddedList.length === 0) {
        // nothing to accept, default rejected and already in history
        const lastRequest = assistantContext.requestHistory.pop()
        responseMessage.accepted = false
        lastRequest.response = responseMessage

        assistantContext.setRequestHistory([...assistantContext.requestHistory, lastRequest])
      }

      setMessages([responseMessage])
    })
      .catch(() => (designer.container.querySelector('gscape-designer-toolbox') as any)?.requestUpdate())
      .finally(() => setLoading(false))

  }

  const onAcceptMessage = () => {
    const ontologyBuilder = new OntologyBuilder(designer)
    let diagramRepr: DiagramRepresentation | undefined
    let entity: GrapholEntity | undefined
    designer.ontology.diagrams.forEach(diagram => {
      diagramRepr = diagram.representations.get(designer.renderState!)
      if (diagramRepr) {
        diagramRepr.cy.$('[?aiGenerated.isNew]')?.forEach(elem => {
          elem.data('aiGenerated', { ...elem.data('aiGenerated'), isNew: false })
          let grapholElement = diagramRepr?.grapholElements.get(elem.id())
          if (grapholElement?.aiGenerated) {
            grapholElement.aiGenerated.isNew = false
          }

          if (elem.data().iri && unCheckedEntities.has(`${elem.data().iri}####${diagram.id}####${elem.id()}`)) {
            entity = designer.ontology.getEntity(elem.data().iri)
            if (entity) {
              if (elem.data().type === TypesEnum.CLASS) {
                // Remove all data properties connected to the class first
                elem.neighborhood(`[?iri][type = "${TypesEnum.DATA_PROPERTY}"]`).forEach(dpElem => {
                  const dpEntity = designer.ontology.getEntity(dpElem.data().iri)
                  if (dpEntity) {
                    ontologyBuilder.removeEntity(dpElem, dpEntity, diagram)
                  }
                })
              }
              ontologyBuilder.removeEntity(elem, entity, diagram)
            }
          }
        })
        /**
         * If we don't reset style, the highlight on elems with isNew=false is not turned off.
         * (it works with removeData() btw)
         * Why? ask cytoscape.js :-)
         */
        setDesignerStyle(diagramRepr.cy, designer.theme)
      }
    })

    const lastRequest = assistantContext.requestHistory.pop()
    lastRequest.response = messages[0]
    lastRequest.response.accepted = true
    assistantContext.setRequestHistory([
      ...assistantContext.requestHistory,
      lastRequest
    ])
    designer.renderer.cy?.style().update();
    (designer.container.querySelector('gscape-designer-toolbox') as any)?.requestUpdate()
    setMessages([])
    assistantContext.setIsAssistantRequestPending(false)
    ontologyBuilder.postEdit()
  }

  const onRejectMessage = () => {
    const ontologyBuilder = new OntologyBuilder(designer)

    let diagramRepr: DiagramRepresentation | undefined
    let entity: GrapholEntity | undefined
    designer.ontology.diagrams.forEach(diagram => {
      diagramRepr = diagram.representations.get(designer.renderState!)
      if (diagramRepr) {
        diagramRepr.cy.$('[?aiGenerated.isNew]')?.forEach(elem => {
          if (elem.data().iri) {
            entity = designer.ontology.getEntity(elem.data().iri)
            if (entity) {
              ontologyBuilder.removeEntity(elem, entity, diagram)
            }
          } else {
            diagramRepr?.removeElement(elem.id())
          }
        })
      }
    });
    (designer.container.querySelector('gscape-designer-toolbox') as any)?.requestUpdate()

    const lastRequest = assistantContext.requestHistory.pop()
    lastRequest.response = messages[0]
    lastRequest.response.accepted = false
    assistantContext.setRequestHistory([
      ...assistantContext.requestHistory,
      lastRequest
    ])
    setMessages([])
    assistantContext.setIsAssistantRequestPending(false)
    ontologyBuilder.postEdit()
  }

  const updateUncheckedEntities = (node, checked: boolean) => {
    const item: NewItem = node._item
    if (item && node.checkable) {
      const itemID = `${item.grapholEntity.iri.fullIri}####${item.grapholElement.diagramId}####${item.grapholElement.id}`
      if (checked) {
        unCheckedEntities.delete(itemID)
      } else {
        unCheckedEntities.set(itemID, item)
      }
    }
    (node.children || []).forEach(c => updateUncheckedEntities(c, checked))
  }

  return (
    <Layout style={{ height: "100%", overflow: 'auto' }}>
      <Layout.Content>
        <AssistantForm
          onSubmit={onSubmitNewMessage}
          response={messages[0]}
          onAccept={onAcceptMessage}
          onReject={onRejectMessage}
          loading={loading}
          headerInfo={{
            title: <Flex gap={8} align="center">{VscEditSparkle({})}<span>{assistantName}</span></Flex>,
            subTitle: "Describe a fragment of your domain to have a possible representation. Just type your request or drop a txt file."
          }}
          renderExtraData={(previewData: NewClassItem[], isInHistory: boolean) => {
            return <EntitiesTree
              entitiesData={previewData}
              onCheck={(_, checkedInfo) => {
                updateUncheckedEntities(checkedInfo.node, checkedInfo.checked)
              }}
              onSelect={(_, selectInfo) => {
                designer.centerOnElement(
                  (selectInfo.node as any)._item.grapholElement.id,
                  (selectInfo.node as any)._item.grapholElement.diagramId, 1.5
                )
              }}
              checkable={!isInHistory}
            />
          }}
        ></AssistantForm>
      </Layout.Content>
    </Layout>
  )
}