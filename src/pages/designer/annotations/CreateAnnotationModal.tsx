import { AnnotatedElement, Annotation, AnnotationProperty, DefaultAnnotationProperties, Iri } from "grapholscape"
import { useContext } from "react"
import AnnotationForm from "src/pages/designer/annotations/AnnotationForm"
import { AnnotationInfo } from "src/pages/designer/entity-form-props"
import { isGrapholEntity } from "src/utils/utils"
import { ToolbarContext } from "../ToolbarContext"
import { addAnnotationEdge } from "./utils"
import { message, Modal } from "antd"
import { describeEntityAI } from "src/pages/designer/ai-operate"

export default function CreateAnnotationModal(props: {
  annotatedElement: AnnotatedElement,
  onDone: (newAnnotation?: Annotation) => void,
  defaultInput?: AnnotationInfo,
}) {

  const { grapholscape } = useContext(ToolbarContext)

  const createAnnotation = (input: AnnotationInfo): Annotation => {
    if (!input.property || !input.range) {
      message.warning('Cannot create annotation')
      return
    }
    const ontology = grapholscape.ontology
    let lexicalForm: string | Iri = input.hasIRIRange ? new Iri(input.range, ontology.namespaces) : input.range
    const propertyIri: AnnotationProperty = ontology.getAnnotationProperty(input.property) === undefined
      ? new AnnotationProperty(input.property, ontology.namespaces)
      : ontology.getAnnotationProperty(input.property)

    const newAnnotation = new Annotation(
      propertyIri,
      lexicalForm,
      input.language,
      input.datatype
    )
    props.annotatedElement.addAnnotation(newAnnotation)
    const sourceEntity = isGrapholEntity(props.annotatedElement) ? props.annotatedElement : undefined

    if (input.hasIRIRange && sourceEntity) {
      // lexicalForm = new Iri(lexicalForm, ontology.namespaces)
      // if (sourceEntity) {
      addAnnotationEdge(input.property, sourceEntity, newAnnotation.propertyIri, grapholscape)
      // }
    }

    if (input.language && !grapholscape.ontology.languages.includes(input.language)) {
      grapholscape.ontology.languages.push(input.language)
    }

    if (sourceEntity && input.property && DefaultAnnotationProperties.comment.equals(input.property)) {
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

    message.success('Annotation Created')
    return newAnnotation
  }

  return <Modal
    open={true}
    title="Create Annotation"
    destroyOnHidden={true}
    footer={null}
    onCancel={() => props.onDone()}>
    <AnnotationForm
      onCancel={() => props.onDone()}
      onOk={(input: AnnotationInfo) => {
        props.onDone(createAnnotation(input))
      }}
      defaultInput={props.defaultInput}
      isDomainEntity={isGrapholEntity(props.annotatedElement)}
      handleDescriptionAskAI={async () => {
        const entity = props.annotatedElement
        if (isGrapholEntity(entity)) {
          return await describeEntityAI(entity, entity.types[0], grapholscape)
        }
      }}
    ></AnnotationForm>
  </Modal>
}