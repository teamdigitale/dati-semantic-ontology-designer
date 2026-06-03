import { Modal } from "antd"
import { Namespace } from "grapholscape"
import { useContext } from "react"
import { NamespaceInfo } from "src/pages/designer/entity-form-props"
import NamespaceForm from "src/pages/designer/namespaces/NamespaceForm"
import { message } from "src/store/store"
import { ToolbarContext } from "../ToolbarContext"
import { FormContext } from "../FormContext"
import { refactorEntitiesNamespace } from "src/utils/utils"

export default function CreateNamespaceModal(props: { onDone: (newNamespaces?: Namespace[]) => void }) {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, setAdvancedValues } = useContext(FormContext)

  const createNamespace = (input: NamespaceInfo) => {
    let newNamespace = grapholscape.ontology.getNamespace(input.namespace || '')
    if (newNamespace) {
      newNamespace.addPrefix(input.prefix || '')
    } else {
      newNamespace = new Namespace([input.prefix || ''], input.namespace || '')
      grapholscape.ontology.addNamespace(newNamespace)
    }

    refactorEntitiesNamespace(grapholscape, newNamespace)
    setAdvancedValues({ ...advancedValues, namespaceList: grapholscape.ontology.namespaces })
    return newNamespace
  }

  return <Modal
    open={true}
    title="Create Namespace"
    destroyOnHidden={true}
    footer={null}
    onCancel={() => props.onDone()}
  >
    <NamespaceForm
      prefixes={grapholscape.ontology.namespaces.flatMap(ns => ns.prefixes)}
      onCancel={() => props.onDone()}
      onOk={(inputs: NamespaceInfo[]) => {
        const newNamespaces = inputs.map(input => createNamespace(input))
        if (newNamespaces.length === 1) {
          message.success('Namespace created')
        } else {
          message.success(`${newNamespaces.length} Namespaces created`)
        }

        props.onDone(newNamespaces)
      }}
    ></NamespaceForm>
  </Modal>
}