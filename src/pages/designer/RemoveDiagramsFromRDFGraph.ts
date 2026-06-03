import { RDFGraph } from "src/gen";

export default function removeDiagramsFromRDFGraph(rdfGraph: RDFGraph, diagramsToConsider: number[]): RDFGraph {
  const newRDFGraph = JSON.parse(JSON.stringify(rdfGraph))
  if (diagramsToConsider.length > 0) {
    newRDFGraph.diagrams = newRDFGraph.diagrams.filter(d => diagramsToConsider.includes(d.id))
    newRDFGraph.entities = newRDFGraph.entities.filter(entity => newRDFGraph.diagrams.some(d => {
      return d.nodes?.some(n => n.iri === entity.fullIri) || d.edges?.some(n => n.iri === entity.fullIri)
    }))
    
    if (newRDFGraph.selectedDiagramId !== undefined && !newRDFGraph.diagrams.some(d => d.id === newRDFGraph.selectedDiagramId)) {
      newRDFGraph.selectedDiagramId = newRDFGraph.diagrams[0].id
    }
  }

  return newRDFGraph
}