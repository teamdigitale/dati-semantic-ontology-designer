import cytoscape from "cytoscape"
import { DiagramRepresentation, GrapholElement, TypesEnum } from "grapholscape"

export function toggleDisjointness(node: cytoscape.NodeSingular, diagramRepr: DiagramRepresentation) {
  const unionGrapholElem = diagramRepr.grapholElements.get(node.id())
  if (unionGrapholElem) {

    if (unionGrapholElem.is(TypesEnum.UNION)) {
      unionGrapholElem.type = TypesEnum.DISJOINT_UNION
      unionGrapholElem.displayedName = undefined
      diagramRepr.updateElement(unionGrapholElem, undefined, false)

      // update edges type too
      let edgeGrapholElem: GrapholElement | undefined
      node.connectedEdges(`[type $= "${TypesEnum.UNION}"]`).forEach(edge => {
        edgeGrapholElem = diagramRepr.grapholElements.get(edge.id())
        if (edgeGrapholElem) {
          edgeGrapholElem.type = edgeGrapholElem.type === TypesEnum.COMPLETE_UNION
            ? TypesEnum.COMPLETE_DISJOINT_UNION
            : TypesEnum.DISJOINT_UNION
          diagramRepr.updateElement(edgeGrapholElem)
        }
      })
    } else {
      unionGrapholElem.type = TypesEnum.UNION
      unionGrapholElem.displayedName = 'or'
      diagramRepr.updateElement(unionGrapholElem, undefined, false)

      // update edges type too
      let edgeGrapholElem: GrapholElement | undefined
      node.connectedEdges(`[type $= "${TypesEnum.DISJOINT_UNION}"]`).forEach(edge => {
        edgeGrapholElem = diagramRepr.grapholElements.get(edge.id())
        if (edgeGrapholElem) {
          edgeGrapholElem.type = edgeGrapholElem.type === TypesEnum.COMPLETE_DISJOINT_UNION
            ? TypesEnum.COMPLETE_UNION
            : TypesEnum.UNION

          diagramRepr.updateElement(edgeGrapholElem)
        }
      })
    }
  }
}

export function toggleComplete(edge: cytoscape.EdgeSingular, isComplete: boolean, diagramRepr: DiagramRepresentation) {
  const edgeGrapholElem = diagramRepr.grapholElements.get(edge.id())
  if (edgeGrapholElem && edgeGrapholElem.isEdge()) {
    const type = edgeGrapholElem.type
    if (isComplete) {
      edgeGrapholElem.type = type === TypesEnum.UNION ? TypesEnum.COMPLETE_UNION : TypesEnum.COMPLETE_DISJOINT_UNION
    } else {
      edgeGrapholElem.type = type === TypesEnum.COMPLETE_UNION ? TypesEnum.UNION : TypesEnum.DISJOINT_UNION
    }

    diagramRepr.updateElement(edgeGrapholElem)
  }
}