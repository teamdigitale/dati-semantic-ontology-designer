import { message, Modal } from "antd";
import { AnnotatedElement, Annotation, AnnotationProperty, DefaultAnnotationProperties, Iri } from "grapholscape";
import { useContext } from "react";
import { renameElement } from "src/builder/rename-element";
import AnnotationForm from "src/pages/designer/annotations/AnnotationForm";
import { AnnotationInfo } from "src/pages/designer/entity-form-props";
import { isGrapholEntity } from "src/utils/utils";
import { ToolbarContext } from "../ToolbarContext";
import { addAnnotationEdge, removeAnnotationEdge } from "./utils";
import { describeEntityAI } from "src/pages/designer/ai-operate";

export function EditAnnotationModal(props: { annotationToEdit: Annotation, entity: AnnotatedElement, onDone: (newAnnotation?: Annotation) => void }) {

  const { grapholscape } = useContext(ToolbarContext)

  const editAnnotation = (input: AnnotationInfo) => {
    const ontology = grapholscape.ontology
    const property = input.property || ''
    let lexicalForm: string | Iri = input.range || ''
    const datatype = input.datatype || ''
    const language = input.language || ''
    const propertyIri: AnnotationProperty = ontology.getAnnotationProperty(property) === undefined ? new AnnotationProperty(property, ontology.namespaces) : ontology.getAnnotationProperty(property) as AnnotationProperty
    const hasIRIRange = input.hasIRIRange
    if (hasIRIRange) {
      lexicalForm = new Iri(lexicalForm, ontology.namespaces)
    }

    const newAnnotation = new Annotation(propertyIri, lexicalForm, language, datatype)
    const sourceEntity = isGrapholEntity(props.entity) ? props.entity : undefined
    if (!props.annotationToEdit.equals(newAnnotation)) {
      props.entity.removeAnnotation(props.annotationToEdit)
      if (props.annotationToEdit.hasIriValue) {
        if (sourceEntity && props.annotationToEdit.rangeIri)
          removeAnnotationEdge(props.annotationToEdit.propertyIri, sourceEntity, props.annotationToEdit.rangeIri, grapholscape)
      }
      if (sourceEntity && newAnnotation.hasIriValue) {
        addAnnotationEdge(property, sourceEntity, lexicalForm as Iri, grapholscape)
      }
    }
    props.entity.addAnnotation(newAnnotation)
    if (newAnnotation.propertyIri.equals(DefaultAnnotationProperties.label) && sourceEntity && grapholscape.renderState) {
      sourceEntity.occurrences.get(grapholscape.renderState)?.forEach(occurrence => {
        renameElement(occurrence, sourceEntity, grapholscape)
      })
    }

    if (!grapholscape.ontology.languages.includes(language)) {
      grapholscape.ontology.languages.push(language)
    }

    if (input.property && DefaultAnnotationProperties.comment.equals(input.property)) {
      if (sourceEntity) {
        sourceEntity.occurrences.get(grapholscape.renderState!)?.forEach(occ => {
          if (occ.aiGenerated) {
            occ.aiGenerated = undefined
            grapholscape
              .ontology
              .getDiagram(occ.diagramId)
              ?.representations.get(grapholscape.renderState!)
              ?.updateElement(occ, sourceEntity, false)
          }
        })
      }
    }

    message.success('Annotation Edited')
    return newAnnotation
  }

  return <Modal
    open={true}
    title="Edit Annotation"
    destroyOnHidden={true}
    footer={null}
    onCancel={() => props.onDone()}>
    <AnnotationForm
      referenceAnnotation={props.annotationToEdit}
      isDomainEntity={isGrapholEntity(props.entity)}
      handleDescriptionAskAI={async () => {
        if (isGrapholEntity(props.entity) && props.entity.types[0]) {
          return await describeEntityAI(props.entity, props.entity.types[0], grapholscape)
        }
      }}
      onCancel={() => props.onDone()}
      onOk={(input: AnnotationInfo) => {
        props.onDone(editAnnotation(input))
      }}
    ></AnnotationForm>
  </Modal>
}