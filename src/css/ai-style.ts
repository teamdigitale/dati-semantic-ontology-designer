import { css } from 'lit'

export const aiDarkColor = css`#FFA8A8`
export const aiLightColor = css`#FCFF00`
export const aiStyle = css`
  gscape-button.ai {
    --gscape-color-bg-default: transparent;
    background: linear-gradient(135deg, ${aiDarkColor}, ${aiLightColor});
    color: var(--gscape-color-fg-default);
    border-radius: var(--gscape-border-radius);
  }

  .ai-area {
    background-image: linear-gradient(135deg, ${aiDarkColor} 10%, ${aiLightColor} 100%);
    border-radius: var(--gscape-border-radius);
  }
`