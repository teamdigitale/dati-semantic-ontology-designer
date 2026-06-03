import { Diagram, DiagramBuilder, DiagramColorManager, DiagramRepresentation, floatyOptions, FloatyRendererState, GrapholElement, GrapholEntity, Grapholscape, parseRDFGraph, RendererStatesEnum, TypesEnum } from "grapholscape";
import { ElementAiGenerated, RDFGraph } from "src/gen";

let currentDiagram: Diagram | undefined = undefined
/**
 * Merges an rdfGraph into an existing instance of grapholscape,
 * it reuses all the entities occurrences already present in the
 * ontology in any diagram.
 * 
 * Diagrams in the incoming rdfGraph are not kept.
 * @param grapholscape grapholscape instance in which the rdf graph will be merged
 * @param rdfGraphToMerge the rdf graph from which all graph elements will be moved into the destination ontology
 */
export default function mergeRDFGraph(grapholscape: Grapholscape, rdfGraphToMerge: RDFGraph) {
  const _tempOntology = parseRDFGraph(rdfGraphToMerge)
  const rendererState = RendererStatesEnum.FLOATY
  currentDiagram = grapholscape.ontology.getDiagram(grapholscape.diagramId || grapholscape.ontology.diagrams[0].id)
  if (!currentDiagram) {
    currentDiagram = new Diagram('from_ai', grapholscape.ontology.diagrams.length)
    currentDiagram.representations.set(rendererState, new DiagramRepresentation(floatyOptions))
  }

  // const resultCollection = currentDiagram.representations.get(rendererState)!.cy.collection()
  _tempOntology.namespaces.forEach(ns => {
    if (!grapholscape.ontology.namespaces.find(n => n.value === ns.value)) {
      grapholscape.ontology.namespaces.push(ns)
    }
  })

  const diagramBuilder = new DiagramBuilder(currentDiagram, rendererState)

  let objectPropertyEntity: GrapholEntity | undefined
  let sourceEntity: GrapholEntity
  let targetEntity: GrapholEntity
  _tempOntology.diagrams.forEach(diagramTomerge => {
    const diagramRepr = diagramTomerge.representations.get(rendererState)
    if (diagramRepr?.cy) {
      diagramRepr.cy.edges().forEach(edge => {
        if (edge.source().data().iri && edge.target().data().iri) {
          if (edge.data().iri) {
            objectPropertyEntity = addEntity(grapholscape, _tempOntology.getEntity(edge.data().iri)!)
          } else {
            objectPropertyEntity = undefined
          }

          const aiInfo: { source: ElementAiGenerated, target: ElementAiGenerated } = {
            // edge: edge.data().aiGenerated,
            source: edge.source().data().aiGenerated,
            target: edge.target().data().aiGenerated,
          }

          sourceEntity = addEntity(grapholscape, _tempOntology.getEntity(edge.source().data().iri)!)
          targetEntity = addEntity(grapholscape, _tempOntology.getEntity(edge.target().data().iri)!)
          addEdge(grapholscape, edge, sourceEntity, targetEntity, aiInfo, objectPropertyEntity)
        }
      })

      let newNode: GrapholElement | undefined
      diagramRepr.cy.nodes("[[degree = 0]][iri]").forEach(node => {
        sourceEntity = addEntity(grapholscape, _tempOntology.getEntity(node.data().iri)!)
        if (!sourceEntity.occurrences.get(RendererStatesEnum.FLOATY)?.at(0)) {
          if (node.data().type === TypesEnum.CLASS) {
            newNode = diagramBuilder.addClass(sourceEntity)
          } else if (node.data().type === TypesEnum.DATA_PROPERTY) {
            newNode = diagramBuilder.addDataProperty(sourceEntity)
          }

          if (newNode && node.data().aiGenerated) {
            newNode.aiGenerated = node.data().aiGenerated
            diagramBuilder.diagramRepresentation?.updateElement(newNode, sourceEntity)
          }
        }
      })
    }
  })

  grapholscape.ontology.diagrams.forEach(d => {
    const repr = d.representations.get(RendererStatesEnum.FLOATY)
    if (repr) {
      new DiagramColorManager(repr).colorDiagram()
    }
  })

  const newElems = grapholscape.renderer.cy?.$('[?aiGenerated.isNew]')
  if (newElems?.nonempty()) {
    const renderState = (grapholscape.renderer.renderState as FloatyRendererState)
    if (!renderState?.layoutRunning) {
      renderState?.runLayout().then(() => {
        grapholscape.renderer.cy?.fit(newElems, 50)
      })
    } else {
      renderState.stopLayout()
      grapholscape.renderer.cy?.fit(newElems, 50)
      if (renderState?.isLayoutInfinite) {
        renderState.runLayoutInfinitely()
      } else {
        renderState.runLayout()
      }
    }
  }
}

function addEdge(grapholscape: Grapholscape, edge: cytoscape.EdgeSingular, sourceEntity: GrapholEntity, targetEntity: GrapholEntity, aiInfo: { source: ElementAiGenerated; target: ElementAiGenerated; }, objectPropertyEntity?: GrapholEntity) {
  let sourceCyOcc: cytoscape.CollectionReturnValue | undefined
  let shouldAdd = true

  let sourceCyToBeUsed: cytoscape.CollectionReturnValue | undefined
  let targetCyToBeUsed: cytoscape.CollectionReturnValue | undefined
  let diagramTobeUsed = currentDiagram

  const edgeSelector = edge.data().iri
    ? `[type = "${edge.data().type}"][iri = "${edge.data().iri}"]`
    : `[type = "${edge.data().type}"]`
  let cy: cytoscape.Core | undefined
  // it's a general edge, check if any occurrence of sourceEntity has the same kind of edge with targetEntity
  for (let sourceOccurrence of sourceEntity.occurrences.get(RendererStatesEnum.FLOATY) || []) {
    cy = grapholscape.ontology
      .getDiagram(sourceOccurrence.diagramId)
      ?.representations.get(RendererStatesEnum.FLOATY)
      ?.cy
    sourceCyOcc = cy?.$id(sourceOccurrence.id)

    if (!sourceCyToBeUsed || sourceCyToBeUsed.empty() || !targetCyToBeUsed || targetCyToBeUsed.empty()) {
      // sourceCyToBeUsed = sourceCyOcc
      if (cy?.$(`[iri = "${targetEntity.iri.fullIri}"]`).nonempty()) {
        sourceCyToBeUsed = sourceCyOcc
        targetCyToBeUsed = cy?.$(`[iri = "${targetEntity.iri.fullIri}"]`)
        diagramTobeUsed = grapholscape.ontology.getDiagram(sourceOccurrence.diagramId)
      }
    }

    if (sourceCyOcc?.connectedEdges(edgeSelector).connectedNodes(`[iri = "${targetEntity.iri.fullIri}"]`).nonempty()) {
      shouldAdd = false
      break
    }
  }

  if (shouldAdd) {
    diagramTobeUsed = diagramTobeUsed || grapholscape.ontology.diagrams[0]
    let diagramRepr = diagramTobeUsed.representations.get(RendererStatesEnum.FLOATY)
    let newEdge: GrapholElement | undefined, newSource: GrapholElement | undefined, newTarget: GrapholElement | undefined
    function _addEdge(sourceId: string, targetId: string) {
      if (objectPropertyEntity) {
        newEdge = diagramBuilder.addObjectProperty(objectPropertyEntity, sourceEntity, targetEntity, [TypesEnum.CLASS])
      } else {
        newEdge = diagramBuilder.addEdge(sourceId, targetId, edge.data().type)
      }

      if (newEdge && (newEdge.is(TypesEnum.INCLUSION) || newEdge.is(TypesEnum.OBJECT_PROPERTY))) {
        newEdge.aiGenerated = edge.data().aiGenerated
        if (objectPropertyEntity) {
          newEdge.displayedName = objectPropertyEntity.getDisplayedName(grapholscape.entityNameType, grapholscape.language)
        }
        diagramRepr?.updateElement(newEdge.id, objectPropertyEntity)
      }
    }

    const diagramBuilder = new DiagramBuilder(diagramTobeUsed, RendererStatesEnum.FLOATY)

    if (sourceCyToBeUsed?.nonempty() && targetCyToBeUsed?.nonempty() && diagramTobeUsed && edge.data().type !== TypesEnum.ATTRIBUTE_EDGE) {
      // add only edge
      _addEdge(sourceCyToBeUsed.id(), targetCyToBeUsed.id())
    } else {
      let sourceOccurrence: GrapholElement | undefined, targetOccurrence: GrapholElement | undefined
      if (edge.source().data().type === TypesEnum.CLASS) {
        sourceOccurrence = sourceEntity.occurrences.get(RendererStatesEnum.FLOATY)?.at(0)
      }

      if (edge.target().data().type === TypesEnum.CLASS) {
        targetOccurrence = targetEntity.occurrences.get(RendererStatesEnum.FLOATY)?.at(0)
      }

      if (sourceOccurrence)
        diagramTobeUsed = grapholscape.ontology.getDiagram(sourceOccurrence.diagramId)
      else if (targetOccurrence)
        diagramTobeUsed = grapholscape.ontology.getDiagram(targetOccurrence.diagramId)

      if (diagramTobeUsed) {
        diagramRepr = diagramTobeUsed.representations.get(RendererStatesEnum.FLOATY)
        diagramBuilder.diagram = diagramTobeUsed
      }

      if (edge.data().type === TypesEnum.ATTRIBUTE_EDGE) {
        let dp: GrapholElement | undefined, isANewOccurrence = false
        if (edge.source().data().type === TypesEnum.DATA_PROPERTY) {
          isANewOccurrence = targetOccurrence === undefined
            || diagramRepr?.cy.$(`[iri = "${targetEntity.iri.fullIri}"]`).neighborhood(`[iri = "${sourceEntity.iri.fullIri}"]`).empty() || false
          if (!targetOccurrence) {
            newTarget = diagramBuilder.addClass(targetEntity)
          }
          dp = diagramBuilder.addDataProperty(sourceEntity, targetEntity)
        } else {
          isANewOccurrence = sourceOccurrence === undefined
            || (!!sourceCyOcc && sourceCyOcc.neighborhood(`[iri = "${targetEntity.iri.fullIri}"]`).empty())
          if (!sourceOccurrence) {
            newSource = diagramBuilder.addClass(sourceEntity)
          }
          dp = diagramBuilder.addDataProperty(targetEntity, sourceEntity)
        }

        if (dp && isANewOccurrence) {
          dp.aiGenerated = { chunkId: '0', isNew: true }
          dp.displayedName = targetEntity.getDisplayedName(grapholscape.entityNameType, grapholscape.language)
          diagramRepr?.updateElement(dp, targetEntity)
        }
      } else {
        if (sourceOccurrence) { // add only target
          newTarget = diagramBuilder.addClass(targetEntity)
          _addEdge(sourceOccurrence.id, newTarget.id)
        } else if (targetOccurrence) { // add only source
          newSource = diagramBuilder.addClass(sourceEntity)
          _addEdge(newSource.id, targetOccurrence.id)
        } else { // add both
          newSource = diagramBuilder.addClass(sourceEntity)
          newTarget = diagramBuilder.addClass(targetEntity)
          _addEdge(newSource.id, newTarget.id)
        }
      }
    }

    // update ai info
    if (newSource) {
      newSource.aiGenerated = aiInfo.source
      newSource.displayedName = sourceEntity.getDisplayedName(grapholscape.entityNameType, grapholscape.language)
      diagramRepr?.updateElement(newSource, sourceEntity)
    }

    if (newTarget) {
      newTarget.aiGenerated = aiInfo.target
      newTarget.displayedName = targetEntity.getDisplayedName(grapholscape.entityNameType, grapholscape.language)
      diagramRepr?.updateElement(newTarget, targetEntity)
    }
  }
}

function addEntity(grapholscape: Grapholscape, entity: GrapholEntity) {
  const existingEntity = grapholscape.ontology.getEntity(entity.iri)
  if (!existingEntity) {
    // if entity is not in current ontology, clear all occurrences
    // diagramBuilder will create new occurrences for this class
    entity.removeAllOccurrences(RendererStatesEnum.FLOATY)
    grapholscape.ontology.addEntity(entity)
  }

  return existingEntity || entity
}