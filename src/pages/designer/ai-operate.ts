import { } from "antd";
import { SingularElementArgument } from "cytoscape";
import { EntityNameType, FunctionalityEnum, GrapholEntity, Grapholscape, RendererStatesEnum, TypesEnum } from "grapholscape";
import { DescribeOntologyEntityRequestEntityTypeEnum as DescribeEntityType } from "src/gen";
import { PromptApi, message } from "src/store/store";
import { computeIRI } from "../../builder/iri-processing";
import OntologyBuilder from "../../builder/ontology-builder";

export async function describeEntityAI(entity: GrapholEntity, type: TypesEnum, grapholscape: Grapholscape) {
  let propertyInfo: { domainName: string, rangeName: string } | undefined
  let typeName: DescribeEntityType
  const entityOccurrences = entity.occurrences.get(RendererStatesEnum.FLOATY)
  let cyOccurrence: SingularElementArgument | undefined
  if (entityOccurrences && entityOccurrences.length > 0) {
    const occurrence = entityOccurrences[0]
    cyOccurrence = grapholscape.ontology.getDiagram(occurrence.diagramId)
      ?.representations.get(RendererStatesEnum.FLOATY)
      ?.cy.$id(occurrence.id).first()
  }
  switch (type) {
    case TypesEnum.DATA_PROPERTY:
      typeName = DescribeEntityType.ATTRIBUTE
      if (cyOccurrence?.nonempty()) {
        const domainNode = cyOccurrence.neighborhood(`node[type = "${TypesEnum.CLASS}"]`).first()
        const domainName = grapholscape.ontology.getEntity(domainNode.data().iri)?.getDisplayedName(EntityNameType.LABEL)
        if (domainName) {
          propertyInfo = {
            domainName: domainName,
            rangeName: entity.datatype,
          }
        }
      }
      break

    case TypesEnum.OBJECT_PROPERTY:
      typeName = DescribeEntityType.RELATIONSHIP
      if (cyOccurrence?.nonempty() && cyOccurrence.isEdge() && cyOccurrence.data().iri) {
        const domainName = grapholscape.ontology.getEntity(cyOccurrence.source().data().iri)?.getDisplayedName(EntityNameType.LABEL)
        const rangeName = grapholscape.ontology.getEntity(cyOccurrence.target().data().iri)?.getDisplayedName(EntityNameType.LABEL)
        if (domainName && rangeName) {
          propertyInfo = {
            domainName: domainName,
            rangeName: rangeName,
          }
        }
      }
      break

    default:
      typeName = DescribeEntityType.CLASS
      break
  }

  return PromptApi.describeOntologyEntity({
    describeOntologyEntityRequest: {
      context: grapholscape.ontology.name,
      entityName: entity.getDisplayedName(EntityNameType.LABEL),
      entityType: typeName,
      propertyInfo: propertyInfo,
      language: grapholscape.language,
    }
  })
}

export async function generateDataProperties(ownerClassEntity: GrapholEntity, language: string, grapholscape: Grapholscape) {
  return new Promise<void>((resolve) => {
    if (ownerClassEntity) {
      PromptApi.suggestClassDataProperties({
        suggestClassDataPropertiesRequest: {
          className: ownerClassEntity.getDisplayedName(EntityNameType.LABEL),
          context: grapholscape.ontology.name,
          language: language,
          numberResults: 5,
        }
      }).then(response => {
        if (response.length > 0 && response.every(i => typeof i === 'string') && grapholscape.renderer.diagram) {
          const ontologyBuilder = new OntologyBuilder(grapholscape)
          response.forEach(newDataPropertyName => {
            ontologyBuilder.addNodeElement(
              computeIRI(grapholscape.ontology.iri || '', newDataPropertyName),
              TypesEnum.DATA_PROPERTY,
              ownerClassEntity.iri.fullIri,
              undefined,
              {
                functionProperties: [FunctionalityEnum.FUNCTIONAL],
                domainMandatory: false,
                domainTyped: true,
              },
              'xsd:string',
              true,
              true,
              true,
              language
            )
          })
        } else {
          message.info("AI: no new result generated")
        }
      }).catch(e => {
        message.info("AI: sorry, I was not able to provide no valid result")
      }).finally(() => {
        resolve()
      })
    }
  })
}

export async function generateSubhierarchy(ownerClassEntity: GrapholEntity, language: string, grapholscape: Grapholscape) {
  return new Promise<void>((resolve) => {
    if (ownerClassEntity) {
      const className = ownerClassEntity.getDisplayedName(EntityNameType.LABEL)
      PromptApi.suggestClassSubclasses({
        suggestClassDataPropertiesRequest: {
          className: className,
          context: grapholscape.ontology.name,
          language: language,
          numberResults: 5,
        }
      }).then(response => {
        if (response.length > 0 && response.every(i => typeof i === 'string') && grapholscape.renderer.diagram) {
          const ontologyBuilder = new OntologyBuilder(grapholscape)
          ontologyBuilder.addSubhierarchy(
            response.map(newSubclassName => ({ name: computeIRI(grapholscape.ontology.iri || '', newSubclassName)})),
            ownerClassEntity.iri.fullIri,
            true,
            true,
            true,
            true,
            true,
            language
          )
        } else {
          throw new Error()
        }
      }).catch(e => {
        message.info("AI: sorry, I was not able to provide no valid result")
      }).finally(() => resolve())
    }
  })
}

export async function generateAll(ownerClassEntity: GrapholEntity, elemType: TypesEnum, language: string, grapholscape: Grapholscape) {
  await generateDataProperties(ownerClassEntity, language, grapholscape)
  await generateSubhierarchy(ownerClassEntity, language, grapholscape)
  const description = await describeEntityAI(ownerClassEntity, elemType, grapholscape)
  return { description }
}