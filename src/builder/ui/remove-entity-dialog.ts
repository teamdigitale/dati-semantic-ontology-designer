import { ui } from "grapholscape";
import { html, LitElement, css } from "lit";
import modalSharedStyles from "./modal-shared-styles";

const { ModalMixin, BaseMixin, baseStyle } = ui

export class RemoveEntityDialog extends ModalMixin(BaseMixin(LitElement)) {

  private _onDeleteSingle: () => void = () => { }
  private _onDeleteAll: () => void = () => { }
  private _onCancel: () => void = () => { }

  declare private message: string
  declare private warning: string

  static properties = {
    message: { type: String },
    warning: { type: String },
  }

  constructor(public multiple = false) {
    super()
    this.title = `Delete ${multiple ? 'Entities' : 'Entity'}`
    this.message = multiple
      ? 'Delete only selected elements or all entities\' occurrences?'
      : 'Delete this single element or all the occurrences of the current entity?'

    this.warning = multiple
      ? 'this action will also remove all the object properties involving deleted entities'
      : 'this action will also remove all the object properties involving this entity'
  }

  static styles = [
    baseStyle,
    modalSharedStyles,
    css`
      :host {
        position: absolute;
      }
    `
  ]

  render() {
    return html`
      <div class="gscape-panel">
        <div class="header">
          <span class="slotted-icon">${ui.icons.info_outline}</span>
          ${this.title}
        </div>
        <div class="dialog-message area">
          <div>${this.message}</div>
          <div class="muted-text" style="margin-top: 16px; color: var(--gscape-color-attention)">
            <span class="bold-text">Warning:</span>
            <span>${this.warning}</span>
          </div>
        </div>

        <div class="bottom-buttons">
          <gscape-button type="subtle" label="Cancel" type="subtle" @click=${this.handleCancel}></gscape-button>
          <gscape-button label="Delete Element" @click=${this.handleDeleteSingle}></gscape-button>
          <gscape-button type="primary" label="Delete All" @click=${this.handleDeleteAll}></gscape-button>
        </div>
      </div>
    `
  }

  private handleDeleteAll() {
    this._onDeleteAll()
    this.remove()
  }

  public onDeleteAll(callback: () => void): RemoveEntityDialog {
    this._onDeleteAll = callback
    this.requestUpdate()
    return this
  }

  private handleDeleteSingle() {
    this._onDeleteSingle()
    this.remove()
  }

  public onDeleteSingle(callback: () => void): RemoveEntityDialog {
    this._onDeleteSingle = callback
    this.requestUpdate()
    return this
  }

  public onCancel(callback: () => void): RemoveEntityDialog {
    this._onCancel= callback
    this.requestUpdate()
    return this
  }

  private handleCancel() {
    this._onCancel()
    this.remove()
  }
}

customElements.define('remove-entity-dialog', RemoveEntityDialog)