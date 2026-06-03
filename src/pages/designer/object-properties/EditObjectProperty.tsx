import { Modal } from "antd";
import { EntityNameType, TypesEnum } from "grapholscape";
import { useContext, useState } from "react";
import EntityIcon from "src/components/EntityIcon";
import { OPInfo } from "../entity-form-props";
import { FormContext } from "../FormContext";
import { ObjectPropertyModal } from "./CreateObjectProperty";
import ObjectPropertyForm from "./ObjectPropertyForm";

export default function EditObjectProperty(props: ObjectPropertyModal) {

  const { advancedValues, entityToEdit, editEntity } = useContext(FormContext)

  const [advancedValuesState, setAdvancedValuesState] = useState({
    ...advancedValues,
    // namespace must be the one of the entity to edit, not the one one globally set
    namespace: entityToEdit ? entityToEdit.entity.iri.namespaceValue : advancedValues.namespace,
  })

  const title = <span>
    Edit <EntityIcon type={TypesEnum.OBJECT_PROPERTY} /> {entityToEdit.entity.getDisplayedName(EntityNameType.LABEL)}
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
    }}>
      <ObjectPropertyForm
        onCancel={() => props.onDone()}
        onOk={(inputs: OPInfo[]) => {
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
            functionProperties: inputs[0].functionProperties,
            domainTypedOrMandatory: inputs[0].domainTypedOrMandatory,
            rangeTypedOrMandatory: inputs[0].rangeTypedOrMandatory,
            updateLabel: inputs[0].updateLabel || false,
            rename: inputs[0].isRefactor ? undefined : { elemId: entityToEdit.element.id }
          })
          props.onDone()
        }}
      />
    </FormContext.Provider>
  </Modal>
}