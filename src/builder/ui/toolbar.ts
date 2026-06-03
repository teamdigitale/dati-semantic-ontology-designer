import { EventName, createComponent } from '@lit/react'
import { ui as UI, rdfgraphSerializer } from 'grapholscape'
import { LitElement, PropertyDeclarations, css, html } from 'lit'
import React from 'react'
import { aiStyle } from 'src/css/ai-style'
import { codeIcon, editSparkleIcon, helpIcon, ontologyQueryIcon } from 'src/css/icons.jsx'
import Grapholscape from '../core'
import { DesignerEvent } from '../lifecycle'
import globeIcon from './globe-icon'
import { downloadIcon } from './style'

const {
  BaseMixin,
  baseStyle,
  icons,
} = UI

export class GscapeDesignerToolbar extends BaseMixin(LitElement) {
  title = "Designer Tools"

  declare public grapholscape?: Grapholscape
  declare protected isDefaultClosed: boolean
  declare public undoEnabled: boolean
  declare public redoEnabled: boolean
  declare public objectPropEnabled: boolean
  declare public individualEnabled: boolean
  declare public saveDraftVisible: boolean
  declare public saveVersionVisible: boolean
  declare public newVersionEnabled: boolean
  declare public removeDiagramDisabled: boolean
  declare public isAssistantRequestPending: boolean
  declare public helpVisible: boolean

  static properties: PropertyDeclarations = {
    grapholscape: { type: Object },
    undoEnabled: { type: Boolean },
    redoEnabled: { type: Boolean },
    objectPropEnabled: { type: Boolean },
    individualEnabled: { type: Boolean },
    saveDraftEnabled: { type: Boolean },
    saveVersionVisible: { type: Boolean },
    saveDraftVisible: { type: Boolean },
    newVersionEnabled: { type: Boolean },
    removeDiagramDisabled: { type: Boolean },
    isAssistantRequestPending: { type: Boolean },
    helpVisible: { type: Boolean },
  }

  static styles = [
    baseStyle,
    aiStyle,
    css`
      .gscape-panel {
        padding: 0px;
        max-width: unset;
        width: unset;
        overflow: unset;
      }

      .widget-body {
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 2px;
        width: fit-content;
      }

      .hr {
        background-color: var(--gscape-color-border-subtle);
        width: 1px;
        height: 1.7em;
        margin: 0 8px
      }
    `,
  ]

  constructor() {
    super()
    this.isDefaultClosed = false
    this.undoEnabled = false
    this.redoEnabled = false
    this.objectPropEnabled = false
    this.individualEnabled = false
    this.newVersionEnabled = true
    this.grapholscape = {} as any
  }

  private handleNewClass() {
    this.dispatchEvent(new CustomEvent('newClass', { bubbles: true, composed: true }))
  }

  private handleNewDataProperty() {
    //new DataPropertyModal(this.grapholscape).create()
    this.dispatchEvent(new CustomEvent('newDataProperty', { bubbles: true, composed: true }))
  }

  private handleNewObjectProperty() {
    this.dispatchEvent(new CustomEvent('newObjectProperty', { bubbles: true, composed: true }))
    /*if (this.lastSelectedElement?.is(TypesEnum.CLASS) && this.lastSelectedElement.isNode()) {
      addObjectProperty(this.grapholscape, this.lastSelectedElement).select!()
    }*/
  }

  private handleNewIndividual() {
    this.dispatchEvent(new CustomEvent('newIndividual', { bubbles: true, composed: true }))
  }

  private handleSaveDraft() {
    this.grapholscape?.lifecycle.trigger(DesignerEvent.SaveDraft, rdfgraphSerializer(this.grapholscape))
  }

  private handleSaveVersion() {
    this.grapholscape?.lifecycle.trigger(DesignerEvent.SaveVersion, rdfgraphSerializer(this.grapholscape))
  }

  render() {
    return html`
      <div class="gscape-panel">
        <div class="widget-body">
          <gscape-button
            @click=${() => this.dispatchEvent(new CustomEvent('newDiagram'))}
            size="s"
            label="Diagram"
            title="Add Diagram"
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${icons.plus}</span>
          </gscape-button>
          <gscape-button
            @click=${() => this.dispatchEvent(new CustomEvent('renameDiagram'))}
            size="s"
            type="subtle"
            title="Rename Diagram"
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${icons.renameIcon}</span>
          </gscape-button>
          <gscape-button
            @click=${() => this.dispatchEvent(new CustomEvent('removeDiagram'))}
            size="s" 
            type="subtle" 
            title="Remove Diagram" 
            ?disabled=${this.isAssistantRequestPending || this.removeDiagramDisabled}
          >
            <span slot="icon">${icons.rubbishBin}</span>
          </gscape-button>

          <div class="hr"></div>

          <gscape-button @click=${this.handleNewClass} 
            size="s" 
            type="subtle" 
            title="Add Class"
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${icons.classIcon}</span>
          </gscape-button>
          <gscape-button @click=${this.handleNewDataProperty} 
            size="s" 
            type="subtle" 
            title="Add Data Property"
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${icons.dataPropertyIcon}</span>
          </gscape-button>
          <gscape-button @click=${this.handleNewObjectProperty} 
            size="s" 
            type="subtle" 
            title="Add Object Property"
            ?disabled=${this.isAssistantRequestPending || !this.objectPropEnabled}
          >
            <span slot="icon">${icons.objectPropertyIcon}</span>
          </gscape-button>
          <gscape-button @click=${this.handleNewIndividual} 
            size="s" 
            type="subtle" 
            title="Add Individual"
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${icons.individualIcon}</span>
          </gscape-button>

          ${window["aiConfig"]
            ? html`<gscape-button
                size="s"
                class="ai"
                title="Toggle the AI Design Assistant"
                label="Design"
                @click=${() => this.grapholscape?.lifecycle.trigger(DesignerEvent.AssistantRequest)}
                ?disabled=${this.isAssistantRequestPending}
              >
                <span slot="icon">${editSparkleIcon}</span>
              </gscape-button>`
            : null
          }

          <div class="hr"></div>

          <!-- <gscape-button size="s" type="subtle" title="Undo" ?disabled=${!this.undoEnabled}>
            <span slot="icon">${icons.undo}</span>
          </gscape-button>

          <gscape-button size="s" type="subtle" title="Redo" ?disabled=${!this.redoEnabled}>
            <span slot="icon">${icons.redo}</span>
          </gscape-button>

          <div class="hr"></div> -->

          <gscape-select
            title="Language"
            placeholder="Select Language"
            ?disabled=${this.isAssistantRequestPending}
            .options=${this.grapholscape.ontology.languages.map((l) => { 
              return {
                id: l,
                text: l,
              }
            }) as UI.SelectOption[]}
            default-option=${this.grapholscape.language}
            @change=${(evt) => {
              this.dispatchEvent(new CustomEvent('languageChange', {
                composed: true,
                bubbles: true,
                detail: evt.target.selectedOptionsId[0]
              }))
            }}
          ></gscape-select>

          <gscape-button
            size="s" 
            title="Ontology Manager" 
            type="subtle" 
            @click=${() => this.dispatchEvent(new CustomEvent('settingsClick'))}
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${icons.settings_icon}</span>
          </gscape-button>
      
          ${this.saveDraftVisible
        ? html`
              <gscape-button
                size="s"
                type="subtle"
                title="Save Draft"
                @click=${this.handleSaveDraft}
                ?disabled=${this.isAssistantRequestPending}
              >
                <span slot="icon">${icons.save}</span>
              </gscape-button>`
        : null}

          <gscape-button
            size="s"
            type="subtle"
            title="Preview OWL"
            @click=${() => this.dispatchEvent(new CustomEvent('previewOWLClick'))}
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${icons.owl_icon}</span>
          </gscape-button>

          <gscape-button
            size="s"
            type="subtle"
            title="Entity Catalog"
            @click=${() => this.dispatchEvent(new CustomEvent('entityCatalogClick'))}
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${globeIcon}</span>
          </gscape-button>

          <gscape-button
            size="s"
            type="subtle"
            title="Download Ontology"
            @click=${() => this.dispatchEvent(new CustomEvent('downloadClick'))}
            ?disabled=${this.isAssistantRequestPending}
          >
            <span slot="icon">${downloadIcon}</span>
          </gscape-button>
            

          ${this.saveVersionVisible ? html`<gscape-button
            size="s"
            type="primary"
            label="New Version"
            title="Save A New Version"
            ?disabled=${this.isAssistantRequestPending || !this.newVersionEnabled}
            @click=${this.handleSaveVersion}
          >
            <span slot="icon">${icons.addPack}</span>
          </gscape-button>` : null}

          ${window["aiConfig"]
            ? html`
              <gscape-button
                size="s"
                class="ai"
                title="Toggle the AI Explain Assistant"
                label="Explain"
                @click=${() => this.dispatchEvent(new CustomEvent('ontologyQueryClick', { bubbles: true, composed: true }))}
                ?disabled=${this.isAssistantRequestPending}
              >
                <span slot="icon">${ontologyQueryIcon}</span>
              </gscape-button>`
            : null
          }

          ${this.helpVisible ? html`
            <gscape-button
              size="s"
              type="subtle"
              title="Help - User Manual"
              @click=${() => this.dispatchEvent(new CustomEvent('helpClick'))}
              ?disabled=${this.isAssistantRequestPending}
            >
            <span slot="icon">${helpIcon}</span>
          </gscape-button>
          ` : null}
        </div>
      </div>
    `
  }
}

const DesignerToolbar = createComponent({
  tagName: 'gscape-designer-toolbox',
  elementClass: GscapeDesignerToolbar,
  react: React,
  displayName: 'DesignerToolbar',
  events: {
    onAssistantRequest: 'assistantRequest' as EventName<CustomEvent>,
    onOntologyQueryClick: 'ontologyQueryClick' as EventName<CustomEvent>,
    onSaveVersion: 'saveVersion' as EventName<CustomEvent>,
    onSaveDraft: 'saveDraft' as EventName<CustomEvent>,
    onNewIndividual: 'newIndividual' as EventName<CustomEvent>,
    onNewObjectProperty: 'newObjectProperty' as EventName<CustomEvent>,
    onNewDataProperty: 'newDataProperty' as EventName<CustomEvent>,
    onNewClass: 'newClass' as EventName<CustomEvent>,
    onRemoveDiagram: 'removeDiagram' as EventName<CustomEvent>,
    onRenameDiagram: 'renameDiagram' as EventName<CustomEvent>,
    onNewDiagram: 'newDiagram' as EventName<CustomEvent>,
    onSettingsClick: 'settingsClick' as EventName<CustomEvent>,
    onDownload: 'downloadClick' as EventName<CustomEvent>,
    onPreviewOWLClick: 'previewOWLClick' as EventName<CustomEvent>,
    onHelpClick: 'helpClick' as EventName<CustomEvent>,
    onEntityCatalogClick: 'entityCatalogClick' as EventName<CustomEvent>,
    onLanguageChange: 'languageChange' as EventName<CustomEvent<string>>,
  },
})

export default DesignerToolbar

customElements.define('gscape-designer-toolbox', GscapeDesignerToolbar)