import { FunctionalityEnum } from "grapholscape"

export type PropertyInfo = {
  functionProperties: FunctionalityEnum[],
  domainTyped: boolean,
  domainMandatory: boolean,
  rangeTyped?: boolean,
  rangeMandatory?: boolean,
}