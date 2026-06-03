import { LitElement, PropertyDeclarations, css, html } from "lit"
import { LifecycleEvent, RendererStatesEnum, TypesEnum, ui as UI } from 'grapholscape'
import { GrapholscapeDesigner } from "../../builder"
import { createComponent } from "@lit/react"
import React from "react"

const {
  BaseMixin,
  baseStyle,
} = UI

class GscapeDesignerInfobar extends BaseMixin(LitElement) {
  declare private _grapholscape?: GrapholscapeDesigner
  declare public content: string

  static properties: PropertyDeclarations = {
    grapholscape: { type: Object },
    content: { type: String }
  }

  static styles = [
    baseStyle,
    css`
      :host {
        left: 50%;
        transform: translate(-50%);
        position: absolute;
        bottom: 70px;
      }

      .gscape-panel {
        background-color: transparent;
        padding: 0px;
        max-width: unset;
        width: unset;
        border: none;
        box-shadow: none;
      }

      .widget-body {
        background-color: transparent;
        padding: 8px;
        display: flex;
        align-items: center;
        gap: 4px;
        overflow: auto;
        width: fit-content;
      }

    `,
  ]

  constructor() {
    super()
    this.content = ''
  }

  render() {
    return html`
      <div class="gscape-panel">
        <div class="widget-body">
          <div class="muted-text bold-text"> ${this.content} </div>
        </div>
      </div>
    `
  }

  gscapeMouseOverHandler = (evt: cytoscape.EventObject) => {
    if (evt.target === this.grapholscape.renderer.cy) return
    const elem = evt.target

    if (elem.data('anchorPosition')) {
      this.content = 'Drag anchor to edit edge'
    }
    else if (elem.data('type') === TypesEnum.DATA_PROPERTY) {
      this.content = 'Double click to toggle functionality'
    }
    else if (elem.data('type') === TypesEnum.UNION || elem.data('type') === TypesEnum.DISJOINT_UNION) {
      if (elem.isNode())
        this.content = elem.data('type') === TypesEnum.UNION ? 'Double click to add disjointness' : 'Double click to remove disjointness'
      else {
        this.content = elem.data('targetLabel') === 'C' ? 'Double click to remove completeness' : 'Double click to add completeness'
      }
    }
    else if ((elem.data('type') === TypesEnum.OBJECT_PROPERTY || (elem.data('type') === TypesEnum.INCLUSION && elem.source().data('type') === TypesEnum.CLASS && elem.target().data('type') === TypesEnum.CLASS) || (elem.data('type') === TypesEnum.INCLUSION && elem.source().data('type') === TypesEnum.DATA_PROPERTY && elem.target().data('type') === TypesEnum.DATA_PROPERTY))) {
      this.content = 'Double click to swap edge'
    }

    this.show()
  }

  gscapeMouseOutHandler = () => {
    this.content = ''
    this.hide()
  }

  set grapholscape(grapholscape: GrapholscapeDesigner | undefined) {
    if (this._grapholscape === grapholscape) return
    this._grapholscape = grapholscape
    if (!grapholscape) return

    grapholscape.on(LifecycleEvent.MouseOver,this.gscapeMouseOverHandler)
    grapholscape.on(LifecycleEvent.MouseOut, this.gscapeMouseOutHandler)
  }

  get grapholscape() { return this._grapholscape }
}

const InfoBar = createComponent({
  tagName: 'gscape-designer-infobar',
  elementClass: GscapeDesignerInfobar,
  react: React,
  displayName: 'DesignerInfobar',
})
customElements.define('gscape-designer-infobar', GscapeDesignerInfobar)

export default InfoBar