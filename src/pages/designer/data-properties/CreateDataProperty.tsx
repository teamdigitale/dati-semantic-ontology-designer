import { Modal } from "antd"
import { FunctionalityEnum } from "grapholscape"
import { useContext, useState } from "react"
import checkTypizations from "src/builder/check-typizations"
import { computeIRI } from "src/builder/iri-processing"
import OntologyBuilder from "src/builder/ontology-builder"
import { DPInfo } from "src/pages/designer/entity-form-props"
import EntityIcon from 'src/components/EntityIcon'
import { SHACLShape, TypesEnum } from "src/gen"
import DataPropertyForm from "src/pages/designer/data-properties/DataPropertyForm"
import { getTypedOrMandatoryBooleans } from "src/pages/designer/TypedOrMandatorySlider"
import { message } from "src/store/store"
import { FormContext } from "../FormContext"
import { ToolbarContext } from "../ToolbarContext"

export type DataPropertyModal = {
  onDone: () => void,
}

export default function CreateDataPropertyModal(props: DataPropertyModal) {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, referenceEntity } = useContext(FormContext)

  const [advancedValuesState, setAdvancedValuesState] = useState(advancedValues)

  let title: JSX.Element

  title = <span>
    <EntityIcon type={TypesEnum.DATA_PROPERTY} />
    Create Data Property
  </span>


  const create = (values: DPInfo[], constraintsValues) => {
    const ontologyBuilder = new OntologyBuilder(grapholscape)

    values.forEach(input => {
      const domainInfo = getTypedOrMandatoryBooleans(input.typedOrMandatory)
      if (input.entity) {
        ontologyBuilder.addNodeElement(
          input.entity.iri.fullIri,
          TypesEnum.DATA_PROPERTY,
          referenceEntity?.iri?.fullIri,
          undefined,
          undefined,
          input.datatype,
          false,
          false,
          false,
          advancedValues.language
        )
      } else {
        ontologyBuilder.addNodeElement(
          computeIRI(advancedValues.namespace, input.name),
          TypesEnum.DATA_PROPERTY,
          referenceEntity?.iri?.fullIri,
          undefined,
          {
            functionProperties: input.isFunctional ? [FunctionalityEnum.FUNCTIONAL] : [],
            domainMandatory: domainInfo.mandatory,
            domainTyped: domainInfo.typed,
          },
          input.datatype,
          advancedValues.deriveLabel,
          advancedValues.convertCamel,
          advancedValues.convertSnake,
          advancedValues.language
        )
      }
    })
    let classIri = referenceEntity?.iri?.fullIri ?? 'http://www.w3.org/2002/07/owl#Thing'
    if (constraintsValues && classIri) {
      let domainConstraints: SHACLShape[] = grapholscape.ontology.shaclConstraints.get(classIri) || []
      constraintsValues.filter(v => (v.constraintValue && v.constraintValue.length > 0) || v.property).forEach(c => {
        let shape: SHACLShape = {
          type: c.type,
          targetClass: classIri,
          path: computeIRI(advancedValues.namespace, values[0].name),
          property: c.property,
          constraintValue: c.constraintValue
        }
        domainConstraints.push(shape)
      });
      grapholscape.ontology.shaclConstraints.set(classIri, domainConstraints)
    }

    values.forEach(input => {
      if (getTypedOrMandatoryBooleans(input.typedOrMandatory).typed) {
        const entity = grapholscape.ontology.getEntity(computeIRI(advancedValues.namespace, input.name))

        if (entity) {
          checkTypizations(grapholscape, entity)
        }
      }
    })

    message.success('Data Property Created')

  }

  return <Modal
    title={title}
    open={true}
    footer={null}
    onCancel={() => props.onDone()}
    width='50%'
    style={{ minWidth: 800 }}
    getContainer={document.getElementById('root')}
  >
    <FormContext.Provider value={{
      ...useContext(FormContext),
      // we need to override advanced values with the state of this form, 
      // because some of them (e.g. namespace) can be changed by the user
      // and they must not update the global advanced values.
      advancedValues: advancedValuesState,
      setAdvancedValues: setAdvancedValuesState
    }}>
      <DataPropertyForm
        onCancel={() => props.onDone()}
        onOk={(inputs: DPInfo[], constraintsValues?) => {
          create(inputs, constraintsValues)
          props.onDone()
        }}
      ></DataPropertyForm>
    </FormContext.Provider>
  </Modal>
}