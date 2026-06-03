import {
  computeHierarchies,
  DefaultFilterKeyEnum, DefaultThemesEnum,
  DisplayedNamesManager,
  EntityNavigator,
  FloatyRendererState,
  getDefaultFilters,
  Grapholscape,
  GrapholscapeConfig,
  parseRDFGraph,
  RDFGraphParser,
  RendererStatesEnum,
  ThemeManager,
  ui
} from "grapholscape";
import { RDFGraph, RDFGraphConfig } from "src/gen";
import { DesignerLifeCycle, IonDesignerEvent } from "./lifecycle";

export default class DesignerCore extends Grapholscape {
  protected availableRenderers: RendererStatesEnum[];
  protected entityNavigator: EntityNavigator;
  protected displayedNamesManager: DisplayedNamesManager;
  protected themesManager: ThemeManager;
  declare lifecycle: DesignerLifeCycle
  constructor(rdfGraph: RDFGraph, container: HTMLElement) {
    super()
    this.lifecycle = new DesignerLifeCycle()
    this.availableRenderers = [RendererStatesEnum.FLOATY];
    this.entityNavigator = new EntityNavigator(this)
    this.displayedNamesManager = new DisplayedNamesManager(this)
    this.on = this.lifecycle.on

    const ontology = parseRDFGraph(rdfGraph)
    let config = RDFGraphParser.getConfig(rdfGraph)
    this.ontology = ontology
    computeHierarchies(this.ontology)
    this.container = container
    this.renderer.container = container
    this.renderer.lifecycle = this.lifecycle
    this.themesManager = new ThemeManager(this)
    // this.renderer.renderState = new GrapholRendererState()
    if (!config?.selectedTheme) {
      this.themesManager.setTheme(DefaultThemesEnum.GRAPHOLSCAPE)
    }
    if (config) {
      config = Object.assign(config || {}, {
        renderers: [RendererStatesEnum.FLOATY], // force only floaty
        widgets: {
          [ui.WidgetEnum.SETTINGS]: false,
        }
      })
      this.setConfig(config)
    } else {
      this.setRenderer(new FloatyRendererState())
    }

    this.renderer.filters = new Map()
    this.renderer.filters.set(DefaultFilterKeyEnum.DATA_PROPERTY, getDefaultFilters().DATA_PROPERTY)
    this.renderer.filters.set(DefaultFilterKeyEnum.INDIVIDUAL, getDefaultFilters().INDIVIDUAL)
  }

  // whether the ontology contains any unhandled ai generated entities
  get aiDirtyState() {
    return this.ontology.diagrams.some(d => {
      const repr = d.representations.get(RendererStatesEnum.FLOATY)
      return repr?.cy.$('[?aiGenerated.isNew]').nonempty()
    })
  }

  /**
   * Changes the ontology's default language, updates the languages list
   * both in model and UI
   * @param language 
   */
  setDefaultLanguage(language?: string) {
    this.ontology.defaultLanguage = language

    if (language) {
      if (!this.ontology.languages.includes(language)) {
        this.ontology.languages.push(language)
      }

      const settingsWidget = this.widgets.get(ui.WidgetEnum.SETTINGS) as any
      if (!settingsWidget.languages.includes(language)) {
        settingsWidget.languages = [...settingsWidget.languages, language]
      }
    }
  }

  declare on: IonDesignerEvent
}