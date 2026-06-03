import { GrapholElement, ui } from "grapholscape";
import { html, css, PropertyDeclarations, CSSResultGroup } from "lit";
import { OntologyProblem } from "../ontology-builder";

export default class ProblemsDialog extends ui.GscapeConfirmDialog {

  declare public problems: OntologyProblem[]

  constructor(type: 'error' | 'warning', problems: OntologyProblem[]) {
    super(undefined, 'Ontology Problems', type)

    this.problems = problems
  }

  static properties: PropertyDeclarations = {
    message: { type: String },
    dialogTitle: { type: String },
    type: { type: String, reflect: true },
    problems: { type: Array }
  }

  static styles: CSSResultGroup = [
    super.styles,
    css`
      .problem {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .dialog-message {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
    `
  ]

  render() {
    return html`
      <div class="gscape-panel">
        <div class="header">
          <span type=${this.type} class="slotted-icon">${this.headerIcon}</span>
          ${this.dialogTitle}
        </div>
        <div class="dialog-message area" type=${this.type}>
          ${this.problems.map(problem => html`
            <div class="problem">
              <span>${problem.message}</span>
              ${problem.grapholElement && html`
                <gscape-button size="s" @click=${() => this.handleElemSearch(problem.grapholElement!)}>
                  ${ui.getIconSlot('icon', ui.icons.search)}
                </gscape-button>
              `}
            </div>
          `)}
        </div>

        <div class="buttons">
          ${this._onConfirm || this._onCancel
            ? html`
              <gscape-button type="subtle" label="Cancel" type="subtle" @click=${this.handleCancel}></gscape-button>
            `
            : null
          }
          <gscape-button type="primary" label="Ok" @click=${this.handleConfirm}></gscape-button>
        </div>
      </div>
    `
  }

  private async handleElemSearch(grapholElement: GrapholElement) {
    await this.updateComplete
    this.dispatchEvent(new CustomEvent<GrapholElement>('find-elem-problem', {
      bubbles: true,
      composed: true,
      detail: grapholElement
    }))
  }
}

customElements.define('problems-dialog', ProblemsDialog)