import { useContext } from "react"
import AnnPropertyForm from "src/pages/designer/annotations/AnnPropertyForm"
import { AnnPropertyInfo } from "src/pages/designer/entity-form-props"
import { ToolbarContext } from "../ToolbarContext"
import { AnnotationProperty } from "grapholscape"
import { message, Modal } from "antd"

export default function CreateAnnotationPropertyModal(props: { onDone: (newAnnotationsProperty?: AnnotationProperty[]) => void }) {

  const { grapholscape } = useContext(ToolbarContext)

  const createAnnotationProperty = (input: AnnPropertyInfo): AnnotationProperty => {
    const propNamespace = input.namespace || ''
    const propInput = input.input || ''
    const newProperty = propNamespace + propInput
    let newAnnotationProperty = grapholscape.ontology.getAnnotationProperty(newProperty)
    if (!newAnnotationProperty) {
      newAnnotationProperty = new AnnotationProperty(newProperty, grapholscape.ontology.namespaces)
      grapholscape.ontology.addAnnotationProperty(newAnnotationProperty)
    }

    return newAnnotationProperty
  }

  return <Modal
    open={true}
    title="Create Annotation Property"
    destroyOnHidden={true}
    footer={null}
    onCancel={() => props.onDone()}
    width='fit-content'>
    <AnnPropertyForm
      namespaces={grapholscape.ontology.namespaces}
      onCancel={() => props.onDone()}
      onOk={(inputs: AnnPropertyInfo[]) => {
        const newAnnotationsProperties = inputs.map(input => createAnnotationProperty(input))
        if (newAnnotationsProperties.length === 1) {
          message.success(`Annotation property created`)
        } else {
          message.success(`${newAnnotationsProperties.length} Annotations properties created`)
        }
        props.onDone(newAnnotationsProperties)
      }}
    ></AnnPropertyForm>
  </Modal>
}