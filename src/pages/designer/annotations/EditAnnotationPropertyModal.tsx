import { AnnotationProperty } from "grapholscape"
import { useContext } from "react"
import AnnPropertyForm from "src/pages/designer/annotations/AnnPropertyForm"
import { AnnPropertyInfo } from "src/pages/designer/entity-form-props"
import { ToolbarContext } from "../ToolbarContext"
import { message } from "src/store/store"
import { Modal } from "antd"

export default function EditAnnotationPropertyModal(props: { propertyToEdit: AnnotationProperty, onDone: (newProperty?: AnnotationProperty) => void }) {

  const { grapholscape } = useContext(ToolbarContext)

  const editAnnotationProperty = (input: AnnPropertyInfo) => {
    const ontology = grapholscape.ontology
    const propNamespace = input.namespace || ''
    const propInput = input.input || ''
    const newPropertyIriValue = propNamespace + propInput
    let newAnnotationProperty: AnnotationProperty | undefined
    if (props.propertyToEdit.fullIri !== newPropertyIriValue) {
      ontology.annProperties = ontology.annProperties.filter(p => !p.equals(props.propertyToEdit))
      newAnnotationProperty = ontology.getAnnotationProperty(newPropertyIriValue)
      if (!newAnnotationProperty) {
        newAnnotationProperty = new AnnotationProperty(newPropertyIriValue, ontology.namespaces)
        ontology.addAnnotationProperty(newAnnotationProperty)
      }
    }

    message.success('Annotation property edited')
    return newAnnotationProperty
  }

  return <Modal
    open={true}
    title="Edit Annotation Property"
    destroyOnHidden={true}
    footer={null}
    onCancel={() => props.onDone()}
    width='fit-content'>
    <AnnPropertyForm
      namespaces={grapholscape.ontology.namespaces}
      referenceProperty={props.propertyToEdit}
      onCancel={() => props.onDone()}
      onOk={(inputs: AnnPropertyInfo[]) => {
        props.onDone(editAnnotationProperty(inputs[0]))
      }}
    ></AnnPropertyForm>
  </Modal>
}