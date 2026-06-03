import { FunctionalityEnum, GrapholElement, GrapholEntity } from "grapholscape"
import { createContext } from "react"
import { AdvancedFormProps } from "src/pages/designer/entity-form-props"

export type EditEntityInfo = {
  name: string,
  entity: GrapholEntity,
  namespace: string,
  updateLabel: boolean,
  datatype?: string,
  isDataPropertyFunctional?: boolean,
  functionProperties?: FunctionalityEnum[],
  domainTypedOrMandatory?: number,
  rangeTypedOrMandatory?: number,
  rename?: { elemId: string },
  constraints?: any[] 
}

type FormContextType = {
  advancedValues: AdvancedFormProps,
  setAdvancedValues: (values: AdvancedFormProps) => void,
  /**
   * The entity of reference from which the form has been issued.
   * i.e: right click on Person => add object property: Person
   * is the reference entity.
   */
  referenceEntity?: GrapholEntity,
  entityToEdit?: { entity: GrapholEntity, element: GrapholElement },
  editEntity?: (editInfo: EditEntityInfo) => void,
}

export const FormContext = createContext<FormContextType>({
  advancedValues: {
    convertCamel: true,
    deriveLabel: true,
    convertSnake: true,
    language: 'en',
    languageList: ['en'],
    namespace: '',
    namespaceList: [],
  },
  setAdvancedValues: (values) => { },
  referenceEntity: undefined,
  entityToEdit: undefined,
  editEntity: (editInfo) => { },
})