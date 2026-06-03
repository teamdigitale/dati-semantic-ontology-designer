import cytoscape from "cytoscape"

export default function autopanOnDraw(cy: cytoscape.Core) {
  cy.panningEnabled(true)
  setTimeout(() => {
    const ghostNode = cy.$('.eh-ghost-node')
    ghostNode.style('events', true)

    ghostNode.on('position', () => {
      const PADDING = 60
      const newRenderedPosition = ghostNode.renderedPosition()
      const renderedWidth = ghostNode.renderedWidth()
      const renderedHeight = ghostNode.renderedHeight()

      const maxRenderedX = cy.width() - PADDING
      const maxRenderedY = cy.height() - PADDING

      const topLeftRenderedPosition = {
        x: newRenderedPosition.x - renderedWidth / 2,
        y: newRenderedPosition.y - renderedHeight / 2
      }

      const bottomRightRenderedPosition = {
        x: newRenderedPosition.x + renderedWidth / 2,
        y: newRenderedPosition.y + renderedHeight / 2
      }

      let exceedX: number | undefined
      let exceedY: number | undefined

      if (bottomRightRenderedPosition.x >= maxRenderedX) {
        exceedX = -bottomRightRenderedPosition.x + maxRenderedX;
      }

      if (topLeftRenderedPosition.x <= PADDING) {
        exceedX = topLeftRenderedPosition.x;
      }

      if (bottomRightRenderedPosition.y >= maxRenderedY) {
        exceedY = -bottomRightRenderedPosition.y + maxRenderedY;
      }

      if (topLeftRenderedPosition.y <= PADDING) {
        exceedY = topLeftRenderedPosition.y;
      }

      if (exceedX) {
        cy.panBy({ x: exceedX, y: 0 })
      }

      if (exceedY) {
        cy.panBy({ y: exceedY, x: 0 })
      }
    })
  }, 500)
}