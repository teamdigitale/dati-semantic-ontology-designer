import { Modal } from "antd";
import { EntityNameType, FunctionalityEnum, RendererStatesEnum, TypesEnum } from "grapholscape";
import { useContext, useState } from "react";
import EntityIcon from "src/components/EntityIcon";
import { DPInfo } from "../entity-form-props";
import { FormContext } from "../FormContext";
import { ToolbarContext } from "../ToolbarContext";
import { DataPropertyModal } from "./CreateDataProperty";
import DataPropertyForm from "./DataPropertyForm";

export default function EditDataProperty(props: DataPropertyModal) {

  const { advancedValues, entityToEdit, editEntity } = useContext(FormContext)
  const { grapholscape } = useContext(ToolbarContext)

  const [advancedValuesState, setAdvancedValuesState] = useState({
    ...advancedValues,
    // namespace must be the one of the entity to edit, not the one one globally set
    namespace: entityToEdit ? entityToEdit.entity.iri.namespaceValue : advancedValues.namespace,
  })

  let referenceEntity = undefined
  if (entityToEdit && grapholscape) {
    const diagram = grapholscape.ontology.getDiagram(grapholscape.diagramId)
    if (diagram) {
      const diagramRepr = diagram.representations.get(RendererStatesEnum.FLOATY)
      const node = diagramRepr.cy.nodes().filter(n => n.id() === entityToEdit.element.id).first()
      if (node) {
        const incomingEdges = diagramRepr.cy.edges(`[ type = "${TypesEnum.ATTRIBUTE_EDGE}" ]`).filter((edge) => edge.target().id() === node.id())
        if (incomingEdges.length > 0) {
          const edge = incomingEdges[0]
          const sourceNode = diagramRepr.cy.nodes().filter(n => n.id() === edge.source().id()).first()
          if (sourceNode) {
            referenceEntity = grapholscape.ontology.getEntity(sourceNode.data().iri)
          }
        }
      }
    }
  }

  const title = <span>
    Edit <EntityIcon type={TypesEnum.DATA_PROPERTY} /> {entityToEdit.entity.getDisplayedName(EntityNameType.LABEL)}
  </span>

  return <Modal
    title={title}
    onCancel={() => props.onDone()}
    open={true}
    footer={null}
    width='50%'
    style={{ minWidth: 800 }}
    centered>
    <FormContext.Provider value={{
      ...useContext(FormContext),
      // we need to override advanced values with the state of this form, 
      // because some of them (e.g. namespace) can be changed by the user
      // and they must not update the global advanced values.
      advancedValues: advancedValuesState,
      setAdvancedValues: setAdvancedValuesState,
      referenceEntity: referenceEntity,
    }}>
      <DataPropertyForm
        onCancel={() => props.onDone()}
        onOk={(inputs: DPInfo[], constraints: any[]) => {
          let namespace: string | undefined
          let updateLabel = inputs[0].updateLabel || false
          if (inputs[0].entity) {
            const selectedEntity = inputs[0].entity
            namespace = selectedEntity.iri.namespaceValue
            updateLabel = false
          } else {
            namespace = advancedValuesState.namespace
          }

          editEntity({
            name: inputs[0].name,
            namespace: namespace,
            entity: entityToEdit.entity,
            datatype: inputs[0].datatype,
            isDataPropertyFunctional: inputs[0].isFunctional,
            functionProperties: inputs[0].isFunctional ? [FunctionalityEnum.FUNCTIONAL] : [],
            updateLabel: inputs[0].updateLabel || false,
            rename: inputs[0].isRefactor ? undefined : { elemId: entityToEdit.element.id },
            constraints: constraints
          })
          props.onDone()
        }}
      />
    </FormContext.Provider>
  </Modal>
}