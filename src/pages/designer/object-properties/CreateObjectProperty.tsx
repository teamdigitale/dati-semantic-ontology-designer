import { Modal } from "antd"
import { useContext, useState } from "react"
import { computeIRI } from "src/builder/iri-processing"
import OntologyBuilder from "src/builder/ontology-builder"
import EntityIcon from 'src/components/EntityIcon'
import { SHACLShape, TypesEnum } from "src/gen"
import { OPInfo } from "src/pages/designer/entity-form-props"
import ObjectPropertyForm from "src/pages/designer/object-properties/ObjectPropertyForm"
import { getTypedOrMandatoryBooleans } from "src/pages/designer/TypedOrMandatorySlider"
import { message } from "src/store/store"
import { FormContext } from "../FormContext"
import { ToolbarContext } from "../ToolbarContext"

export type ObjectPropertyModal = {
  onDone: () => void,
}

export default function CreateObjectPropertyModal(props: ObjectPropertyModal & {
  sourceIRI: string | undefined,
  targetIRI: string | undefined,
  sourceType: TypesEnum | undefined,
  targetType: TypesEnum | undefined,
}) {
  const sourceClassIri = props.sourceIRI || ''
  const targetClassIri = props.targetIRI || ''
  const nodesType = [props.sourceType, props.targetType] as TypesEnum[]

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues } = useContext(FormContext)

  const [advancedValuesState, setAdvancedValuesState] = useState(advancedValues)

  let title: JSX.Element

  title = <span>
    <EntityIcon type={TypesEnum.OBJECT_PROPERTY} />
    Create Object Property
  </span>


  const create = (input: OPInfo, constraintsValues) => {
    const ontologyBuilder = new OntologyBuilder(grapholscape)
    const domainInfo = getTypedOrMandatoryBooleans(input.domainTypedOrMandatory)
    const rangeInfo = getTypedOrMandatoryBooleans(input.rangeTypedOrMandatory)

    if (input.entity) {
      ontologyBuilder.addEdgeElement(
        input.entity.iri.fullIri,
        TypesEnum.OBJECT_PROPERTY,
        sourceClassIri,
        targetClassIri,
        nodesType,
        undefined,
        false,
        false,
        false,
        advancedValuesState.language,
      )
    } else {
      ontologyBuilder.addEdgeElement(
        computeIRI(advancedValuesState.namespace, input.name),
        TypesEnum.OBJECT_PROPERTY,
        sourceClassIri,
        targetClassIri,
        nodesType,
        { // PropertyInfo
          functionProperties: input.functionProperties,
          domainTyped: domainInfo.typed,
          domainMandatory: domainInfo.mandatory,
          rangeTyped: rangeInfo.typed,
          rangeMandatory: rangeInfo.mandatory,
        },
        advancedValuesState.deriveLabel,
        advancedValuesState.convertCamel,
        advancedValuesState.convertSnake,
        advancedValuesState.language,
      )
    }

    if (constraintsValues) {
      let domainConstraints: SHACLShape[] = grapholscape.ontology.shaclConstraints.get(sourceClassIri) || []
      let rangeConstraints: SHACLShape[] = grapholscape.ontology.shaclConstraints.get(targetClassIri) || []
      constraintsValues.forEach(c => {
        let shape: SHACLShape = {
          type: c.type,
          targetClass: c.targetClass === 'domain' ? sourceClassIri : targetClassIri,
          path: computeIRI(advancedValuesState.namespace, input.name),
          constraintValue: [c.constraintValue]
        }
        if (c.targetClass === 'domain') {
          domainConstraints.push(shape)
        } else {
          rangeConstraints.push(shape)
        }
      });
      grapholscape.ontology.shaclConstraints.set(sourceClassIri, domainConstraints)
      grapholscape.ontology.shaclConstraints.set(targetClassIri, rangeConstraints)
    }

    message.success('Object Property Created')
  }

  return <Modal
    title={title}
    open={true}
    footer={null}
    onCancel={() => props.onDone()}
    width='50%'
    style={{ minWidth: 800 }}
  >
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
        onOk={(inputs: OPInfo[], constraintsValues?) => {
          create(inputs[0], constraintsValues)
          props.onDone()
        }}
      ></ObjectPropertyForm>
    </FormContext.Provider>
  </Modal>
}