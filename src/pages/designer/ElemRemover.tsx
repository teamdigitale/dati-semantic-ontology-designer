import { ExclamationCircleOutlined } from "@ant-design/icons"
import { Button, Flex, Modal, Popover, Typography } from "antd"
import { Collection, EdgeSingular, NodeSingular } from "cytoscape"
import { DiagramBuilder, GrapholEntity, RendererStatesEnum, TypesEnum } from "grapholscape"
import { useContext } from "react"
import OntologyBuilder from "src/builder/ontology-builder"
import { ToolbarContext } from "./ToolbarContext"
import { message } from "src/store/store"

export default function ElemRemover({ elems, onDone }: { elems: Collection, onDone?: () => void }) {

  const { grapholscape } = useContext(ToolbarContext)

  const entitiesElems = elems.filter('[iri]')
  const areThereMultipleEntities = entitiesElems.size() > 1
  const ontologyBuilder = new OntologyBuilder(grapholscape)
  const diagramBuilder = new DiagramBuilder(grapholscape.renderer.diagram!, RendererStatesEnum.FLOATY)

  const handleDelete = (all = true) => {
    let entity: GrapholEntity | undefined
    entitiesElems.forEach(elem => {
      entity = grapholscape.ontology.getEntity(elem.data().iri)
      if (entity) {
        all
          ? ontologyBuilder.removeAllOccurrences(entity)
          : ontologyBuilder.removeEntity(elem, entity)
      }
    })

    deleteElems()
    message.success(all ? 'Entities and all their occurrences deleted' : 'Selected elements deleted')
    onDone && onDone()
  }

  const deleteElems = () => {
    elems.nodes('[hierarchyID]:inside').forEach(elem => removeHierarchyByNode(elem))
    // remove only edges that are still 'inside' graph, skip those already removed by previous steps
    elems.edges(':inside').forEach(elem => {
      switch (elem.data().type) {
        case TypesEnum.UNION:
        case TypesEnum.DISJOINT_UNION:
        case TypesEnum.COMPLETE_DISJOINT_UNION:
        case TypesEnum.COMPLETE_UNION:
          removeHierarchySuperClassEdge(elem)
          break

        case TypesEnum.INPUT:
          removeHierarchyInputEdge(elem)
          break

        case TypesEnum.INCLUSION:
        case TypesEnum.ATTRIBUTE_EDGE:
        case TypesEnum.INSTANCE_OF:
          diagramBuilder.removeElement(elem.id())
      }
    })
  }

  function removeHierarchyByNode(elem: NodeSingular) {
    if (elem.edges().nonempty()) {
      const hierarchy = grapholscape.ontology.getHierarchy(elem.id())
      if (hierarchy) {
        ontologyBuilder.removeHierarchy(hierarchy)
      }
    }
    else {
      diagramBuilder.removeElement(elem.id())
    }
  }

  function removeHierarchySuperClassEdge(elem: EdgeSingular) {
    // removing 'complete-' from edge type assures the type to be the same of the hierarchy node
    const hierarchyID = elem.connectedNodes(`[type = "${elem.data('type').replace('complete-', '')}"]`).first().data('hierarchyID')
    const superclassIri = elem.target().data('iri')
    const hierarchy = grapholscape.ontology.getHierarchy(hierarchyID)
    if (hierarchy)
      ontologyBuilder.removeHierarchySuperclass(hierarchy, superclassIri)
  }

  function removeHierarchyInputEdge(elem: EdgeSingular) {
    const hierarchyID = elem.connectedNodes(`[type $= "${TypesEnum.UNION}"]`).first().data('hierarchyID')
    const inputclassIri = elem.connectedNodes(`[type = "${TypesEnum.CLASS}"]`).first().data('iri')
    const hierarchy = grapholscape.ontology.getHierarchy(hierarchyID)
    if (hierarchy)
      ontologyBuilder.removeHierarchyInput(hierarchy, inputclassIri)
  }

  const numElems = elems.filter(':inside').size()

  return <>
    <Modal
      title={<Flex gap={8}><ExclamationCircleOutlined /><>Delete {numElems} {numElems > 1 ? 'Elements' : 'Element'}</></Flex>}
      open={elems.nonempty()}
      footer={<>
        <Button onClick={() => onDone && onDone()}>Cancel</Button>
        {entitiesElems.nonempty() &&
          <Popover content={<>Delete only the selected entity occurrences.<br />If there are multiple occurrences of the same entity, that entity will not be deleted.</>}>
            <Button danger onClick={() => handleDelete(false)}>Delete Element</Button>
          </Popover>}
        {entitiesElems.nonempty() && <Popover content="Delete all selected entity's occurrences across all diagrams.">
          <Button type="primary" danger onClick={() => handleDelete()}>Delete All</Button>
        </Popover>}
        {entitiesElems.empty() && <Button type="primary" danger onClick={() => handleDelete()}>Delete</Button>}
      </>}
      onCancel={() => onDone && onDone()}
    >
      {entitiesElems.empty()
        ? <Typography.Text>Confirm deleting {numElems} {numElems > 1 ? 'Elements' : 'Element'}.</Typography.Text>
        : areThereMultipleEntities
          ? <>
            Delete only selected elements or all entities' occurrences?
            <Typography.Text type="warning" style={{ display: 'block', marginTop: '10px' }}>
              This action will also remove all the object properties involving deleted entities
            </Typography.Text>
          </>
          : <>
            <Typography.Text>Delete this single element or all the occurrences of the current entity?</Typography.Text>
            <Typography.Text type="warning" style={{ display: 'block', marginTop: '10px' }}>
              This action will also remove all the object properties involving this entity
            </Typography.Text>
          </>
      }
    </Modal>
  </>
}

