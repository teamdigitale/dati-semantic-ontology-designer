import { EntityNameType, Language, ThemeConfig, WidgetsConfig } from "grapholscape";

export { default as initBuilderUI } from './ui';
export { default as GrapholscapeDesigner } from './core'
export * from './lifecycle'

export type OntologyDesignerConfig = {
  themes?: ThemeConfig[],
  selectedTheme?: string,
  language?: Language | string,
  entityNameType?: EntityNameType,
  widgets?: WidgetsConfig,
}