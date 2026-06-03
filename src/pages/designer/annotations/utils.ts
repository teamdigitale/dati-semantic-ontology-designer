import { GrapholEntity, Iri, TypesEnum } from "grapholscape"
import { GrapholscapeDesigner } from "src/builder"
import OntologyBuilder from "src/builder/ontology-builder"

export function addAnnotationEdge(property: string, sourceEntity: GrapholEntity, targetIri: Iri, grapholscape: GrapholscapeDesigner) {
  const ontology = grapholscape.ontology
  const ontoBuilder = new OntologyBuilder(grapholscape)
  const sourceType = sourceEntity.types[0]
  let targetEntity = ontology.getEntity(targetIri)
  const targetType = ontology.getEntity(targetIri) ? ontology.getEntity(targetIri)?.types[0] as TypesEnum : TypesEnum.INDIVIDUAL
  if (!targetEntity) {
    targetEntity = new GrapholEntity(targetIri)
    ontology.addEntity(targetEntity)
  }
  const nodesType = [sourceType, targetType]
  ontoBuilder.addEdgeElement(property, TypesEnum.ANNOTATION_PROPERTY, sourceEntity.fullIri, targetEntity.fullIri, nodesType)
  if (ontology.annotationsDiagram)
    grapholscape.showDiagram(ontology.annotationsDiagram.id)
}

export function removeAnnotationEdge(propertyIri: Iri, sourceEntity: GrapholEntity, targetIri: Iri, grapholscape: GrapholscapeDesigner) {
  const ontoBuilder = new OntologyBuilder(grapholscape)
  ontoBuilder.removeAnnotationEdges(propertyIri, sourceEntity, targetIri)
}