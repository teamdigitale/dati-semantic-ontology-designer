import { message, Modal } from "antd"
import { Namespace } from "grapholscape"
import { useContext } from "react"
import { NamespaceInfo } from "src/pages/designer/entity-form-props"
import NamespaceForm from "src/pages/designer/namespaces/NamespaceForm"
import { refactorEntitiesNamespace } from "src/utils/utils"
import { ToolbarContext } from "../ToolbarContext"
import { FormContext } from "../FormContext"

export default function EditNamespaceModal(props: { namespaceToEdit: Namespace, prefixToEdit: string, onDone: (newNamespace?: Namespace, newPrefix?: string) => void }) {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, setAdvancedValues } = useContext(FormContext)

  const editNamespace = (input: NamespaceInfo) => {
    props.namespaceToEdit.prefixes = props.namespaceToEdit.prefixes.filter(p => p !== props.prefixToEdit)

    if (props.namespaceToEdit.value === input.namespace) {
      props.namespaceToEdit.addPrefix(input.prefix || '')
      message.success('Namespace Edited')
      if (input.refactor) {
        refactorEntitiesNamespace(grapholscape, props.namespaceToEdit)
      }
      setAdvancedValues({ ...advancedValues, namespaceList: grapholscape.ontology.namespaces })
      return { newNamespace: props.namespaceToEdit, newPrefix: input.prefix }
    } else {
      if (props.namespaceToEdit.prefixes.length === 0) {
        grapholscape.ontology.namespaces = grapholscape.ontology.namespaces.filter(n => n.value !== props.namespaceToEdit.value)
      }
      let newNamespace = grapholscape.ontology.getNamespace(input.namespace || '')
      if (newNamespace) {
        newNamespace.addPrefix(input.prefix || '')
      } else {
        newNamespace = new Namespace([input.prefix || ''], input.namespace || '')
        grapholscape.ontology.addNamespace(newNamespace)
      }
      if (input.refactor) {
        refactorEntitiesNamespace(grapholscape, props.namespaceToEdit, newNamespace)
      }

      setAdvancedValues({
        ...advancedValues,
        // update default namespace for new entities if it has changed
        namespace: advancedValues.namespace === props.namespaceToEdit.value
          ? newNamespace.value
          : advancedValues.namespace,
        namespaceList: grapholscape.ontology.namespaces,
      })

      message.success('Namespace Edited')
      return { newNamespace, newPrefix: input.prefix }
    }
  }

  return <>
    <Modal
      open={true}
      title="Create Namespace"
      destroyOnHidden={true}
      footer={null}
      onCancel={() => props.onDone()}>
      <NamespaceForm
        referenceNamespace={props.namespaceToEdit}
        prefix={props.prefixToEdit}
        prefixes={grapholscape.ontology.namespaces.flatMap(ns => ns.prefixes)}
        onCancel={() => props.onDone()}
        onOk={(inputs: NamespaceInfo[]) => {
          const { newNamespace, newPrefix } = editNamespace(inputs[0])
          props.onDone(newNamespace, newPrefix)
        }}
      ></NamespaceForm>
    </Modal>
  </>
}