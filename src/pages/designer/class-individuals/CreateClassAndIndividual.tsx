import { Form, Modal } from "antd"
import { useContext, useState } from "react"
import { computeIRI } from "src/builder/iri-processing"
import OntologyBuilder from "src/builder/ontology-builder"
import ClassAndIndividualForm from "src/pages/designer/class-individuals/ClassAndIndividualForm"
import { BaseEntityInfo, HierarchyInfo, ISAInfo } from "src/pages/designer/entity-form-props"
import EntityIcon from 'src/components/EntityIcon'
import { TypesEnum } from "src/gen"
import { message } from "src/store/store"
import { FormContext } from "../FormContext"
import { ToolbarContext } from "../ToolbarContext"

export type ClassAndIndividualModal = {
  formType?: 'isa' | 'hierarchy',
  entityType: TypesEnum.CLASS | TypesEnum.INDIVIDUAL,
  onDone: () => void,
}

export default function CreateClassAndIndividualModal(props: ClassAndIndividualModal) {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, referenceEntity } = useContext(FormContext)
  const [advancedValuesState, setAdvancedValuesState] = useState(advancedValues)

  let title: JSX.Element
  if (props.formType) {
    let entityName = ''
    if (referenceEntity) {
      entityName = referenceEntity.getDisplayedName(grapholscape.entityNameType, grapholscape.language) || ''
    }
    title = props.formType === 'isa'
      ? <span>
        Create Class in ISA with <EntityIcon type={props.entityType} />{entityName}
      </span>
      : <span>
        Create Subhierarchy for <EntityIcon type={props.entityType} />{entityName}
      </span>
  } else if (props.entityType === TypesEnum.CLASS) {
    title = <span>
      <EntityIcon type={props.entityType} />
      Create Class
    </span>
  } else if (props.entityType === TypesEnum.INDIVIDUAL) {
    title = <span>
      <EntityIcon type={props.entityType} />
      Create Individual
    </span>
  }

  const create = (values: BaseEntityInfo[] | HierarchyInfo) => {
    const ontologyBuilder = new OntologyBuilder(grapholscape)

    if (props.formType === 'hierarchy' && isHierarchyInfo(values) && referenceEntity) {
      ontologyBuilder.addSubhierarchy(
        (values as HierarchyInfo).inputs.map(input => ({
          ...input,
          name: input.entity ? input.entity.iri.fullIri : computeIRI(advancedValuesState.namespace, input.name)
        })),
        referenceEntity.iri.fullIri,
        values.disjoint,
        values.complete,
        advancedValuesState.deriveLabel,
        advancedValuesState.convertCamel,
        advancedValuesState.convertSnake,
        advancedValuesState.language,
      )
      message.success('Hierarchy Created')
    } else if (props.formType !== 'hierarchy') { // class, individual or class in isa
      (values as BaseEntityInfo[]).forEach(input => {

        if (!input.entity) {
          ontologyBuilder.addNodeElement(
            computeIRI(advancedValuesState.namespace, input.name),
            props.entityType,
            referenceEntity?.iri?.fullIri,
            (input as ISAInfo).isaDirection, // if formType === 'isa', inputs have also isaDirection
            undefined,
            undefined,
            advancedValuesState.deriveLabel,
            advancedValuesState.convertCamel,
            advancedValuesState.convertSnake,
            advancedValuesState.language
          )
        } else {
          ontologyBuilder.addNodeElement(
            input.entity.iri.fullIri,
            props.entityType,
            referenceEntity?.iri?.fullIri,
            (input as ISAInfo).isaDirection, // if formType === 'isa', inputs have also isaDirection
            undefined,
            undefined,
            false,
            false,
            false,
            advancedValuesState.language
          )
        }
      })
      message.success(`${props.entityType} created`)
    }
  }

  return <Modal title={title} open={true} footer={null} onCancel={props.onDone} getContainer={document.getElementById('root')}
    width='50%'
    style={{ minWidth: 500 }}>
    <FormContext.Provider value={{
      ...useContext(FormContext),
      // we need to override advanced values with the state of this form, 
      // because some of them (e.g. namespace) can be changed by the user
      // and they must not update the global advanced values.
      advancedValues: advancedValuesState,
      setAdvancedValues: setAdvancedValuesState,
    }}>
      <ClassAndIndividualForm
        formType={props.formType}
        entityType={props.entityType}
        onCancel={props.onDone}
        onOk={(inputs: BaseEntityInfo[] | HierarchyInfo) => {
          create(inputs)
          props.onDone()
        }}
      ></ClassAndIndividualForm>
    </FormContext.Provider>
  </Modal>
}

function isHierarchyInfo(value: any): value is HierarchyInfo {
  return value.complete !== undefined && value.disjoint !== undefined && value.inputs !== undefined
}