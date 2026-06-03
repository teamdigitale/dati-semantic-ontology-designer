import { FunctionalityEnum, GrapholEntity, Namespace, TypesEnum } from "grapholscape"
import { PropertyInfo } from "src/builder/properties-info"

export type AdvancedFormProps = {
  namespace: string
  namespaceList: Namespace[]
  language: string
  languageList: string[],
  deriveLabel: boolean,
  convertCamel: boolean,
  convertSnake: boolean,
}

export type EntityFormProps = {
  propertyInfoToEdit?: PropertyInfo,
  onGenerateDescriptionAI?: () => Promise<string>,
  // onDone: () => void,
  // TODO: remove onCancel and onOk => creation and edit must be handled inside the form, outside
  // we only need to know when the user closed the modal to hide it
  onCancel?: () => void,
  onOk?: (inputs: BaseEntityInfo[], constraintsValues?) => void,
}

export type FormProps = {
  onCancel?: () => void,
  onOk?: (inputs) => void,
}

export type TypedOrMandatory = 0 | 1 | 2 // Typed - Both - Mandatory

export type BaseEntityInfo = {
  name: string,
  entity?: GrapholEntity,
  updateLabel?: boolean,
  isRefactor?: boolean,
}

export type DPInfo = BaseEntityInfo & {
  datatype: string,
  isFunctional: boolean
  typedOrMandatory?: TypedOrMandatory
}

export type OPInfo = BaseEntityInfo & {
  functionProperties: FunctionalityEnum[],
  domainTypedOrMandatory: TypedOrMandatory,
  rangeTypedOrMandatory: TypedOrMandatory,
  //domainMinCard: number,
  //domainMaxCard: number,
  //rangeMinCard: number,
  //rangeMaxCard: number,
}

export type ISAInfo = BaseEntityInfo & {
  isaDirection: 'subclass' | 'superclass'
}

export type HierarchyInfo = {
  inputs: BaseEntityInfo[],
  complete: boolean,
  disjoint: boolean,
}

export type NamespaceInfo = {
  prefix?: string,
  namespace?: string,
  refactor?: boolean,
}

export type AnnPropertyInfo = {
  namespace?: string,
  input?: string
}

export type AnnotationInfo = {
  property?: string,
  range?: string,
  datatype?: string,
  language?: string,
  hasIRIRange?: boolean
}

export type AnnotationsDownloadInfo = {
  diagrams: string[],
  entityTypes: TypesEnum[],
  includeAllEntities: boolean,
  fileFormat: string
}

export type OntologyUploadInfo = {
  diagram: number,
  namespace: string,
  lang: string
}