import { Modal } from "antd";
import { EntityNameType } from "grapholscape";
import { useContext, useState } from "react";
import EntityIcon from "src/components/EntityIcon";
import ClassAndIndividualForm from "src/pages/designer/class-individuals/ClassAndIndividualForm";
import { FormContext } from "../FormContext";
import { ClassAndIndividualModal } from "./CreateClassAndIndividual";

export default function EditClassAndIndividual(props: ClassAndIndividualModal) {

  const { advancedValues, entityToEdit, editEntity } = useContext(FormContext)
  const [advancedValuesState, setAdvancedValuesState] = useState({
    ...advancedValues,
    namespace: entityToEdit ? entityToEdit.entity.iri.namespaceValue : advancedValues.namespace,
  })

  const title = <span>
    Edit <EntityIcon type={entityToEdit.entity.types[0]} /> {entityToEdit.entity.getDisplayedName(EntityNameType.LABEL)}
  </span>

  return <Modal title={title} onCancel={() => props.onDone()} open={true} footer={null}>
    <FormContext.Provider value={{
      ...useContext(FormContext),
      // we need to override advanced values with the state of this form, 
      // because some of them (e.g. namespace) can be changed by the user
      // and they must not update the global advanced values.
      advancedValues: advancedValuesState,
      setAdvancedValues: setAdvancedValuesState,
    }}>
      <ClassAndIndividualForm
        entityType={props.entityType}
        onCancel={() => props.onDone()}
        onOk={(inputs) => {
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
            name: inputs[0].name.trim(),
            entity: entityToEdit.entity,
            namespace: namespace,
            updateLabel: updateLabel,
            rename: inputs[0].isRefactor ? undefined : { elemId: entityToEdit.element.id },
          })
          props.onDone()
        }}
      />
    </FormContext.Provider>
  </Modal>
}