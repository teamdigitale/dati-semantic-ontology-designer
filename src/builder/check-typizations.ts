import { EdgeSingular } from "cytoscape";
import { Diagram, GrapholElement, GrapholEntity, Grapholscape, RendererStatesEnum, TypesEnum } from "grapholscape";
import { OntologyProblem } from "./ontology-builder";
import ProblemsDialog from "./ui/problem-dialog";

export default function checkTypizations(grapholscape: Grapholscape, propertyToCheck: GrapholEntity) {
  if (propertyToCheck.is(TypesEnum.DATA_PROPERTY)) {
    let diagram: Diagram | undefined
    let typedClassesIris: Set<string> = new Set()
    let attributeEdge: EdgeSingular | undefined
    let propertyNode: GrapholElement | undefined
    
    propertyToCheck.occurrences.get(RendererStatesEnum.FLOATY)?.forEach(dpNode => {
      propertyNode = dpNode
      diagram = grapholscape.ontology.getDiagram(dpNode.diagramId)

      if (diagram) {
        attributeEdge = diagram.representations
          .get(RendererStatesEnum.FLOATY)
          ?.cy.$id(dpNode.id)
          .connectedEdges(`[type = "${TypesEnum.ATTRIBUTE_EDGE}"]`)
          .first()

        if (attributeEdge?.nonempty() && attributeEdge.data().domainTyped) {
          typedClassesIris.add(attributeEdge.source().data().iri)
        }
      }
    })

    if (typedClassesIris.size > 1) {
      const problems: OntologyProblem[] = [{
        type: "warning",
        message: `Data property ${propertyToCheck.getDisplayedName(grapholscape.entityNameType, grapholscape.language)} domain has been typed on multiple classes. \n
        Are you sure this is what you want?`,
        grapholElement: propertyNode
      }]

      const problemsDialog = new ProblemsDialog('warning', problems)
      problemsDialog.addEventListener('find-elem-problem', (evt: CustomEvent<GrapholElement>) => {
        if (evt.detail.iri)
          grapholscape.selectEntity(evt.detail.iri, evt.detail.diagramId, 1.5)
        else
          grapholscape.centerOnElement(evt.detail.id, evt.detail.diagramId, 1.5)
        problemsDialog.remove()
      })
      grapholscape.uiContainer?.appendChild(problemsDialog)
      problemsDialog.show()
    }
  }
}