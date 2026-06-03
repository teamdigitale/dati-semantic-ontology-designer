import cytoscape, { SingularElementArgument } from "cytoscape"
import {
  Annotation,
  AnnotationProperty,
  AnnotationsDiagram,
  DefaultAnnotationProperties, Diagram,
  DiagramBuilder,
  DiagramColorManager,
  DiagramRepresentation, FunctionalityEnum, GrapholElement, GrapholEntity,
  GrapholObjectPropertyEdge,
  Hierarchy, Iri, RendererStatesEnum, TypesEnum,
  floatyOptions,
  parseRDFGraph,
  ui,
} from "grapholscape"
import { RDFGraph, SHACLShape } from "src/gen"
import { GrapholscapeDesigner } from "."
import { toggleComplete, toggleDisjointness } from "./edit-hierarchy"
import { DesignerEvent } from "./lifecycle"
import { PropertyInfo } from "./properties-info"
import { renameElement } from "./rename-element"
import { AdvancedFormProps, BaseEntityInfo } from "src/pages/designer/entity-form-props"

type GscapeDiagramSelector = ui.GscapeDiagramSelector

export type OntologyProblem = {
  type: 'error' | 'warning',
  message: string,
  grapholElement?: GrapholElement
}

export default class OntologyBuilder {

  grapholscape: GrapholscapeDesigner
  diagramBuilder: DiagramBuilder
  private rendererState = RendererStatesEnum.FLOATY

  constructor(grapholscape) {
    this.grapholscape = grapholscape
  }

  public addIndividualAndClassElementsForMetadata(individualIri: string, classIri: string) {
    let diagram = this.grapholscape.ontology.getDiagram(-2)
    if (!diagram) {
      diagram = new Diagram('Metadata', -2)
      diagram.representations.set(this.rendererState, new DiagramRepresentation(floatyOptions))
      this.grapholscape.ontology.addDiagram(diagram)
    }
    this.grapholscape.showDiagram(-2)
    this.diagramBuilder = new DiagramBuilder(diagram, RendererStatesEnum.FLOATY)
    let classEntity = this.grapholscape.ontology.getEntity(classIri)
    if (!classEntity) {
      classEntity = new GrapholEntity(new Iri(classIri, this.grapholscape.ontology.namespaces))
      this.grapholscape.ontology.addEntity(classEntity)
    }

    let individualEntity = this.grapholscape.ontology.getEntity(individualIri)
    if (!individualEntity) {
      individualEntity = new GrapholEntity(new Iri(individualIri, this.grapholscape.ontology.namespaces))
      this.grapholscape.ontology.addEntity(individualEntity)
    }

    const addedClassNode = this.diagramBuilder.addClass(classEntity)
    const addedIndividualNode = this.diagramBuilder.addIndividual(individualEntity)
    this.diagramBuilder.addEdge(addedIndividualNode.id, addedClassNode.id, TypesEnum.INSTANCE_OF)
    new DiagramColorManager(this.diagramBuilder.diagramRepresentation).colorDiagram()
    this.grapholscape.renderer.renderState.runLayout()
  }

  public addNodeElement(iriString: string, entityType: TypesEnum, ownerIri?: string, relationship?: string, propertyInfo?: PropertyInfo, datatype = '', deriveLabel = true, convertCamel = true, convertSnake = true, labelLanguage?: string, diagramId?: number) {

    const diagram = (diagramId ? this.grapholscape.ontology.getDiagram(diagramId) : this.grapholscape.renderer.diagram) as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
    const iri = new Iri(iriString, this.grapholscape.ontology.namespaces)
    let entity = this.grapholscape.ontology.getEntity(iriString)
    if (!entity) {
      entity = new GrapholEntity(iri)
      this.grapholscape.ontology.addEntity(entity)
      if (deriveLabel) {
        entity.addAnnotation(this.getNewEntityLabel(iri.remainder, convertCamel, convertSnake, labelLanguage))
      }
    }

    let ownerEntity: GrapholEntity | undefined
    if (ownerIri)
      ownerEntity = this.grapholscape.ontology.getEntity(ownerIri)

    let addedElement: GrapholElement | undefined
    if (entityType === TypesEnum.INDIVIDUAL) {
      addedElement = this.diagramBuilder.addIndividual(entity)
      const sourceId = entity.getIdInDiagram(diagram.id, TypesEnum.INDIVIDUAL, this.rendererState)

      if (ownerEntity) {
        const targetId = ownerEntity.getIdInDiagram(diagram.id, TypesEnum.CLASS, this.rendererState)
        if (!sourceId || !targetId) return
        this.diagramBuilder.addEdge(sourceId, targetId, TypesEnum.INSTANCE_OF)
      }
    }
    else if (entityType === TypesEnum.DATA_PROPERTY) {
      entity.datatype = datatype
      if (propertyInfo?.functionProperties.includes(FunctionalityEnum.FUNCTIONAL)) {
        entity.isDataPropertyFunctional = true
        //entity.functionProperties.push(FunctionalityEnum.FUNCTIONAL)
      }
      addedElement = this.diagramBuilder.addDataProperty(entity, ownerEntity)
      if (addedElement && (propertyInfo?.domainMandatory || propertyInfo?.domainTyped)) {
        const dpEdge = this.grapholscape.renderer.cy?.$id(addedElement?.id)?.connectedEdges().first()
        if (dpEdge) {
          const attributeGrapholEdge = this.diagramBuilder.diagramRepresentation?.grapholElements.get(dpEdge.id())
          if (attributeGrapholEdge?.isEdge() && attributeGrapholEdge?.is(TypesEnum.ATTRIBUTE_EDGE)) {
            attributeGrapholEdge.domainMandatory = propertyInfo.domainMandatory
            attributeGrapholEdge.domainTyped = propertyInfo.domainTyped
            this.diagramBuilder.diagramRepresentation?.updateElement(attributeGrapholEdge)
          }
        }
      }
    }
    else if (entityType === TypesEnum.CLASS) {
      addedElement = this.diagramBuilder.addClass(entity)

      if (ownerEntity) {
        if (relationship === 'superclass') {
          const sourceId = ownerEntity.getIdInDiagram(diagram.id, TypesEnum.CLASS, this.rendererState)
          const targetId = entity.getIdInDiagram(diagram.id, TypesEnum.CLASS, this.rendererState)
          if (!sourceId || !targetId) return
          this.diagramBuilder.addEdge(sourceId, targetId, TypesEnum.INCLUSION)
        } else if (relationship === 'subclass') {
          const sourceId = entity.getIdInDiagram(diagram.id, TypesEnum.CLASS, this.rendererState)
          const targetId = ownerEntity.getIdInDiagram(diagram.id, TypesEnum.CLASS, this.rendererState)
          if (!sourceId || !targetId) return
          this.diagramBuilder.addEdge(sourceId, targetId, TypesEnum.INCLUSION)
        }
      }

      // Generate new color for the new class, shown if user activate colorful mode
      if (this.diagramBuilder.diagramRepresentation)
        new DiagramColorManager(this.diagramBuilder.diagramRepresentation).colorDiagram()
    }

    if (ownerEntity) {
      this.grapholscape.renderer.renderState?.runLayout()
    } else if (addedElement) {
      this.grapholscape.centerOnElement(addedElement.id)
    }

    this.grapholscape.selectElement(addedElement.id, diagram.id)
    this.grapholscape.lifecycle.trigger(DesignerEvent.EntityAddition, entity, this.diagramBuilder.diagram.id)
    this.postEdit()
  }

  public addEdgeElement(iriString: string | null = null, edgeType: TypesEnum, sourceId: string, targetId: string, nodesType: TypesEnum[], propertyInfo?: PropertyInfo, deriveLabel = true, convertCamel = true, convertSnake = true, labelLanguage?: string, diagramId?: null) {

    const diagram = (diagramId ? this.grapholscape.ontology.getDiagram(diagramId) : this.grapholscape.renderer.diagram) as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
    const sourceEntity = this.grapholscape.ontology.getEntity(sourceId)
    const targetEntity = this.grapholscape.ontology.getEntity(targetId)
    if (!sourceEntity || !targetEntity) return

    if (iriString && edgeType === TypesEnum.OBJECT_PROPERTY) {
      let entity = this.grapholscape.ontology.getEntity(iriString)
      if (!entity) {
        const iri = new Iri(iriString, this.grapholscape.ontology.namespaces)
        entity = new GrapholEntity(iri)
        this.grapholscape.ontology.addEntity(entity)
        if (deriveLabel) {
          entity.addAnnotation(this.getNewEntityLabel(iri.remainder, convertCamel, convertSnake, labelLanguage))
        }
      }
      const addedEdge = this.diagramBuilder.addObjectProperty(entity, sourceEntity, targetEntity, nodesType)
      if (addedEdge?.isEdge()) {
        addedEdge.domainMandatory = propertyInfo?.domainMandatory
        addedEdge.domainTyped = propertyInfo?.domainTyped
        addedEdge.rangeMandatory = propertyInfo?.rangeMandatory
        addedEdge.rangeTyped = propertyInfo?.rangeTyped
        this.diagramBuilder.diagramRepresentation?.updateElement(addedEdge, entity)
      }
      if (propertyInfo)
        entity.functionProperties = entity?.functionProperties.concat(propertyInfo.functionProperties)
      this.grapholscape.lifecycle.trigger(DesignerEvent.EntityAddition, entity, this.diagramBuilder.diagram.id)
    }
    else if (iriString && edgeType === TypesEnum.ANNOTATION_PROPERTY) {
      let entity = this.grapholscape.ontology.getEntity(iriString)
      if (!entity) {
        const iri = new Iri(iriString, this.grapholscape.ontology.namespaces)
        entity = new GrapholEntity(iri)
        this.grapholscape.ontology.addEntity(entity)
      }

      if (!this.grapholscape.ontology.annotationsDiagram) {
        this.grapholscape.ontology.addDiagram(new AnnotationsDiagram())
      }

      this.grapholscape.ontology.annotationsDiagram?.addIRIValueAnnotation(
        sourceEntity,
        entity,
        targetEntity.iri,
        this.grapholscape.entityNameType,
        this.grapholscape.language,
        targetEntity
      );

      (this.grapholscape.widgets.get(ui.WidgetEnum.DIAGRAM_SELECTOR) as any)?.requestUpdate()
    }
    else if (edgeType === TypesEnum.INCLUSION) {
      const sourceID = sourceEntity.getIdInDiagram(diagram.id, nodesType[0], this.rendererState)
      const targetID = targetEntity.getIdInDiagram(diagram.id, nodesType[1], this.rendererState)
      if (!sourceID || !targetID) return
      this.diagramBuilder.addEdge(sourceID, targetID, edgeType)
    }
    this.postEdit()
  }

  public addDiagram(name) {
    const id = this.grapholscape.ontology.diagrams.length
    const newDiagram = new Diagram(name, id)
    newDiagram.representations.set(this.rendererState, new DiagramRepresentation(floatyOptions))
    this.grapholscape.ontology.addDiagram(newDiagram)
    this.grapholscape.showDiagram(id)
    this.grapholscape.lifecycle.trigger(DesignerEvent.DiagramAddition, newDiagram)
    newDiagram.representations.get(this.grapholscape.renderState)?.cy.scratch(
      '_highlightAIGenerated',
      this.grapholscape.ontology.diagrams.some(d => d.representations.get(this.grapholscape.renderState).cy?.scratch('_highlightAIGenerated'))
    )
    return newDiagram
  }

  public renameDiagram(newName) {
    const diagram = this.grapholscape.renderer.diagram
    if (diagram)
      diagram.name = newName
    const diagramSelector = this.grapholscape.container.getElementsByTagName('gscape-diagram-selector').item(0) as GscapeDiagramSelector
    diagramSelector.currentDiagramName = newName
  }

  public removeDiagram(diagram: Diagram) {
    if (this.grapholscape.ontology.diagrams.length > 1) {
      this.grapholscape.ontology.entities.forEach(e => {
        if (diagram.representations.get(this.rendererState)?.containsEntity(e)) {
          e.getOccurrencesByDiagramId(diagram.id).get(this.rendererState)?.forEach(el => {
            const occ = diagram.representations.get(this.rendererState)?.cy.$id(el.id).first()
            if (occ)
              this.removeEntity(occ, e, diagram)
          })
        }

      })
      this.grapholscape.ontology.removeDiagram(diagram.id)
      const id = this.grapholscape.ontology.diagrams[0].id
      this.grapholscape.showDiagram(id)
      const diagramSelector = this.grapholscape.widgets.get(ui.WidgetEnum.DIAGRAM_SELECTOR) as ui.GscapeDiagramSelector | undefined
      if (diagramSelector)
        diagramSelector.diagrams = this.grapholscape.ontology.diagramsMap
    }
  }

  public addSubhierarchy(inputs: BaseEntityInfo[], ownerIri: string, disjoint = false, complete = false, deriveLabel = true, convertCamel = true, convertSnake = true, labelLanguage?: string) {
    const diagram = this.grapholscape.renderer.diagram as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
    const hierarchyID = this.diagramBuilder.getNewId('node') + '-' + diagram.id
    const hierarchy = disjoint ? new Hierarchy(hierarchyID, TypesEnum.DISJOINT_UNION, complete) : new Hierarchy(hierarchyID, TypesEnum.UNION, complete)
    const superClass = this.grapholscape.ontology.getEntity(ownerIri)
    if (!superClass) return
    hierarchy.addSuperclass(superClass)
    for (let i of inputs) {
      let entity: GrapholEntity | undefined
      if (!i.entity) {
        const iri = new Iri(i.name, this.grapholscape.ontology.namespaces)
        entity = this.grapholscape.ontology.getEntity(i.name)
        if (!entity) {
          entity = new GrapholEntity(iri)
          this.grapholscape.ontology.addEntity(entity)
          if (deriveLabel) {
            entity.addAnnotation(this.getNewEntityLabel(iri.remainder, convertCamel, convertSnake, labelLanguage))
          }
        }
      } else {
        entity = i.entity
        if (!this.grapholscape.ontology.getEntity(entity.iri.fullIri)) {
          this.grapholscape.ontology.addEntity(entity)
        }
      }

      hierarchy.addInput(entity)
    }

    this.diagramBuilder.addHierarchy(hierarchy)

    this.grapholscape.ontology.addHierarchy(hierarchy)

    if (this.diagramBuilder.diagramRepresentation)
      new DiagramColorManager(this.diagramBuilder.diagramRepresentation).colorDiagram()

    this.grapholscape.renderer.renderState?.runLayout()
    this.postEdit()
  }

  public removeAnnotationEdges(propertyIri: Iri, sourceEntity: GrapholEntity, targetIri: Iri) {

    const propertyEntity = this.grapholscape.ontology.getEntity(propertyIri)
    this.grapholscape.ontology.diagrams.forEach(d => {
      const occurrences = sourceEntity.getOccurrencesByDiagramId(d.id).get(this.rendererState)
      occurrences?.forEach(sN => {
        const id = sN.id
        const occurrence = d.representations.get(this.rendererState)?.cy?.$id(id).first()
        if (occurrence && occurrence.isNode()) {
          const annotationEdges = occurrence.connectedEdges(`[ type = "${TypesEnum.ANNOTATION_PROPERTY}" ]`)
          annotationEdges.forEach(e => {
            if (e.data().iri === propertyIri.fullIri && e.target().data().iri === targetIri.fullIri && propertyEntity) {
              const propEdge = e
              this.removeEntity(propEdge, propertyEntity, d)
              const targetNode = propEdge.target()
              const targetEntity = this.grapholscape.ontology.getEntity(targetIri)
              if (targetNode.isNode() && targetNode.connectedEdges().length === 0 && targetEntity) {
                this.removeEntity(targetNode, targetEntity, d)
              }
            }
          })
        }
      })
    })
  }


  public removeAllOccurrences(entity: GrapholEntity) {

    this.grapholscape.ontology.diagrams.forEach(d => {
      const occurrences = entity.getOccurrencesByDiagramId(d.id).get(this.rendererState)//occurrences.get(this.rendererState)
      occurrences?.forEach(e => {
        const id = e.id
        const occurrence = d.representations.get(this.rendererState)?.cy?.$id(id).first()//this.grapholscape.renderer.cy?.$id(id).first()
        if (occurrence) {
          this.removeEntity(occurrence, entity, d)
        }
      })
    })


  }

  /**
   * Removes an entity occurrence from a diagram.
   * If no other entity occurrences are left,
   * the entity gets removed also from the whole ontology
   * @param cyOccurrence 
   * @param entity 
   * @param diag 
   */
  public removeEntity(cyOccurrence: SingularElementArgument, entity: GrapholEntity, diag?: Diagram) {
    const diagram = diag ? diag : this.grapholscape.renderer.diagram
    if (diagram) {
      this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
      const grapholElem = diagram.representations.get(this.rendererState)?.grapholElements.get(cyOccurrence.id())
      if (grapholElem) {

        if (cyOccurrence.isNode() && entity.is(TypesEnum.CLASS)) {
          this.grapholscape.ontology.getSuperHierarchiesOf(entity.fullIri).forEach(hierarchy => {
            this.removeHierarchyInput(hierarchy, entity.iri.fullIri)
          })

          this.grapholscape.ontology.getSubHierarchiesOf(entity.fullIri).forEach(hierarchy => {
            this.removeHierarchySuperclass(hierarchy, entity.iri.fullIri)
          })

          cyOccurrence.connectedEdges(`[ type = "${TypesEnum.OBJECT_PROPERTY}" ]`).forEach(opEdge => {
            const entity = this.grapholscape.ontology.getEntity(opEdge.data().iri)
            if (entity) {
              this.removeEntity(opEdge, entity, diagram)
            }
          })

        }

        entity.removeOccurrence(grapholElem, this.rendererState)
        this.diagramBuilder.removeElement(cyOccurrence.id())
        const occurrences = entity.occurrences.get(this.rendererState)
        if (occurrences && occurrences.length === 0) {
          this.grapholscape.ontology.entities.delete(entity.iri.fullIri)
        }
      }
      this.postEdit()
    }
  }

  public removeHierarchy(hierarchy: Hierarchy) {
    const diagram = this.grapholscape.renderer.diagram as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
    this.grapholscape.ontology.removeHierarchy(hierarchy)
    this.diagramBuilder.removeHierarchy(hierarchy)
    this.postEdit()
  }

  public removeHierarchyInput(hierarchy: Hierarchy, inputIri: string) {
    const diagram = this.grapholscape.renderer.diagram as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)

    const entity = this.grapholscape.ontology.getEntity(inputIri)
    if (entity) {
      hierarchy.removeInput(entity)
      this.diagramBuilder.removeHierarchyInputEdge(hierarchy, inputIri)
      if (hierarchy.inputs.length < 2) {
        // if less than 2 inputs left, remove the whole hierarchy
        this.removeHierarchy(hierarchy)
      }
    }
  }

  public removeHierarchySuperclass(hierarchy: Hierarchy, superclassIri: string) {
    const diagram = this.grapholscape.renderer.diagram as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)

    const entity = this.grapholscape.ontology.getEntity(superclassIri)
    if (entity) {
      hierarchy.removeSuperclass(entity)
      this.diagramBuilder.removeHierarchyInclusionEdge(hierarchy, superclassIri)
      if (hierarchy.superclasses.length === 0) {
        // if no superclasses left, remove the whole hierarchy
        this.removeHierarchy(hierarchy)
      }
    }
  }

  public renameEntity(oldIri: Iri, elemID: string, newIri: string, updateLabel: boolean, advancedSettings: AdvancedFormProps, datatype: string | undefined, isDataPropertyFunctional?: boolean, functionProperties?: FunctionalityEnum[] | undefined, domainTypedOrMandatory?: number, rangeTypedOrMandatory?: number, constraints?: any[]) {
    const diagram = this.grapholscape.renderer.diagram as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
    const grapholElem = diagram.representations.get(this.rendererState)?.grapholElements.get(elemID)

    const oldEntity = this.grapholscape.ontology.getEntity(oldIri.fullIri)

    let entity = this.grapholscape.ontology.getEntity(newIri)
    let iri = entity?.iri
    if (!entity || !iri) {
      iri = new Iri(newIri, this.grapholscape.ontology.namespaces)
      entity = new GrapholEntity(iri)
      entity.manualTypes = oldEntity.manualTypes

      // Set entity type properties BEFORE adding to ontology
      if (oldEntity?.is(TypesEnum.DATA_PROPERTY)) {
        entity.datatype = datatype ?? oldEntity.datatype
        entity.isDataPropertyFunctional = isDataPropertyFunctional ?? oldEntity.isDataPropertyFunctional
      }
      else if (oldEntity?.is(TypesEnum.OBJECT_PROPERTY)) {
        entity.functionProperties = functionProperties ?? oldEntity.functionProperties
        const edge = grapholElem as GrapholObjectPropertyEdge
        edge.domainMandatory = domainTypedOrMandatory === 1 || domainTypedOrMandatory === 2
        edge.domainTyped = domainTypedOrMandatory === 1 || domainTypedOrMandatory === 0
        edge.rangeMandatory = rangeTypedOrMandatory === 1 || rangeTypedOrMandatory === 2
        edge.rangeTyped = rangeTypedOrMandatory === 1 || rangeTypedOrMandatory === 0
      }

      // duplicate annotations
      oldEntity?.getAnnotations().forEach(a => {
        entity?.addAnnotation(new Annotation(
          new AnnotationProperty(a.property, this.grapholscape.ontology.namespaces),
          a.value,
          a.language,
          a.datatype
        ))
      })
      this.grapholscape.ontology.addEntity(entity)
      if (updateLabel) {
        this.updateLabelOnEntity(entity, advancedSettings, oldEntity)
      }
      if (constraints) {
        let referenceEntity = undefined
        const diagram = this.grapholscape.ontology.getDiagram(this.grapholscape.diagramId)
        if (diagram) {
          const diagramRepr = diagram.representations.get(RendererStatesEnum.FLOATY)
          const node = diagramRepr.cy.nodes().filter(n => n.id() === elemID).first()
          if (node) {
            const incomingEdges = diagramRepr.cy.edges(`[ type = "${TypesEnum.ATTRIBUTE_EDGE}" ]`).filter((edge) => edge.target().id() === node.id())
            if (incomingEdges.length > 0) {
              const edge = incomingEdges[0]
              const sourceNode = diagramRepr.cy.nodes().filter(n => n.id() === edge.source().id()).first()
              if (sourceNode) {
                referenceEntity = this.grapholscape.ontology.getEntity(sourceNode.data().iri)
              }
            }
          }

        }
        let newConstraints: SHACLShape[] = []
        constraints.filter(v => v.constraintValue.length > 0).forEach(c => {
          let shape: SHACLShape = {
            type: c.type,
            targetClass: referenceEntity ? referenceEntity.iri.fullIri : undefined,
            path: entity.iri.fullIri,
            property: c.property,
            constraintValue: c.constraintValue
          }
          newConstraints.push(shape)
        });
        this.grapholscape.ontology.shaclConstraints.set(entity.iri.fullIri, newConstraints)
      }
    }

    let diagramRepresentation = diagram.representations.get(this.rendererState)
    if (!grapholElem) return
    renameElement(grapholElem, entity, this.grapholscape)
    entity.addOccurrence(grapholElem, this.rendererState)

    if (entity.is(TypesEnum.DATA_PROPERTY)) {
      const node = diagramRepresentation?.cy.$id(grapholElem.id)
      if (!node) return
      node.data('functional', entity.isDataPropertyFunctional)
      node.data('datatype', entity.datatype)
    }


    if (!oldEntity) return
    if (grapholElem.is(TypesEnum.CLASS)) {
      let hierarchies: Hierarchy[] = []
      let classCyNode = this.diagramBuilder.diagramRepresentation?.cy.$id(grapholElem.id)
      let hierarchy: Hierarchy | undefined
      classCyNode?.neighborhood(`node[type $= ${TypesEnum.UNION}]`).forEach(un => {
        hierarchy = this.grapholscape.ontology.getHierarchy(un.data('hierarchyID'))
        if (hierarchy)
          hierarchies.push(hierarchy)
      })
      this.updateHierarchies(hierarchies, oldEntity, entity)
    }

    oldEntity.removeOccurrence(grapholElem, this.rendererState)
    const occurrences = oldEntity.occurrences.get(this.rendererState)
    if (occurrences && occurrences.length === 0) {
      this.grapholscape.ontology.entities.delete(oldIri.fullIri)
    }
    this.postEdit()
  }

  public refactorEntity(entity: GrapholEntity, newIri: string, updateLabel: boolean, advancedSettings: AdvancedFormProps, datatype?: string, isDataPropertyFunctional?: boolean, functionProperties?: FunctionalityEnum[], domainTypedOrMandatory?: number, rangeTypedOrMandatory?: number, constraints?: any[]) {
    const diagram = this.grapholscape.renderer.diagram as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)

    const oldIri = entity.iri.fullIri
    let newEntity = this.grapholscape.ontology.getEntity(newIri)
    let iri = newEntity ? newEntity.iri : new Iri(newIri, this.grapholscape.ontology.namespaces)
    if (!newEntity) {
      newEntity = new GrapholEntity(iri)
      this.grapholscape.ontology.addEntity(newEntity)
    }

    if (entity.is(TypesEnum.CLASS)) {
      this.updateHierarchies(
        this.grapholscape.ontology.getHierarchiesOf(oldIri),
        entity,
        newEntity
      )
    }

    entity.occurrences.get(this.rendererState)?.forEach(o => newEntity?.addOccurrence(o, this.rendererState))
    entity.getAnnotations().forEach(a => newEntity?.addAnnotation(a))
    if (updateLabel) {
      this.updateLabelOnEntity(newEntity, advancedSettings, entity)
    }
    //entity.iri = iri
    if (newEntity.is(TypesEnum.OBJECT_PROPERTY) && functionProperties) {
      newEntity.functionProperties = functionProperties
    }

    if (newEntity.is(TypesEnum.DATA_PROPERTY)) {
      if (datatype) {
        newEntity.datatype = datatype
      }
      newEntity.isDataPropertyFunctional = isDataPropertyFunctional ?? false
    }
    this.grapholscape.ontology.entities.delete(oldIri)

    this.grapholscape.ontology.addEntity(newEntity)

    newEntity?.occurrences.get(this.rendererState)?.forEach(o => {
      renameElement(o, newEntity, this.grapholscape)
      if (newEntity.is(TypesEnum.OBJECT_PROPERTY)) {
        const edge = o as GrapholObjectPropertyEdge
        edge.domainMandatory = domainTypedOrMandatory === 1 || domainTypedOrMandatory === 2
        edge.domainTyped = domainTypedOrMandatory === 1 || domainTypedOrMandatory === 0
        edge.rangeMandatory = rangeTypedOrMandatory === 1 || rangeTypedOrMandatory === 2
        edge.rangeTyped = rangeTypedOrMandatory === 1 || rangeTypedOrMandatory === 0
      }
    })

    if (constraints) {
      let occurrence = newEntity.occurrences.get(this.rendererState)?.[0]
      let referenceEntity = undefined
      const diagram = this.grapholscape.ontology.getDiagram(this.grapholscape.diagramId)
      if (diagram) {
        const diagramRepr = diagram.representations.get(RendererStatesEnum.FLOATY)
        const node = diagramRepr.cy.nodes().filter(n => n.id() === occurrence.id).first()
        if (node) {
          const incomingEdges = diagramRepr.cy.edges(`[ type = "${TypesEnum.ATTRIBUTE_EDGE}" ]`).filter((edge) => edge.target().id() === node.id())
          if (incomingEdges.length > 0) {
            const edge = incomingEdges[0]
            const sourceNode = diagramRepr.cy.nodes().filter(n => n.id() === edge.source().id()).first()
            if (sourceNode) {
              referenceEntity = this.grapholscape.ontology.getEntity(sourceNode.data().iri)
            }
          }
        }

      }
      let newConstraints: SHACLShape[] = []
      constraints.filter(v => v.constraintValue.length > 0).forEach(c => {
        let shape: SHACLShape = {
          type: c.type,
          targetClass: referenceEntity ? referenceEntity.iri.fullIri : undefined,
          path: entity.iri.fullIri,
          property: c.property,
          constraintValue: c.constraintValue
        }
        newConstraints.push(shape)
      });
      this.grapholscape.ontology.shaclConstraints.set(referenceEntity?.iri.fullIri, newConstraints)
    }

    /*newEntity.occurrences.get(this.rendererState)?.forEach(o => 
      this.grapholscape.ontology.diagrams.forEach(d=> {
        let diagramRepresentation = d.representations.get(this.rendererState)
        renameElement(o.id, iri, diagramRepresentation)
    }) )*/

    if (datatype) {
      this.grapholscape.ontology.diagrams.forEach(d => {
        let diagramRepresentation = d.representations.get(this.rendererState)
        newEntity?.getOccurrencesByDiagramId(d.id, this.rendererState).get(this.rendererState)?.forEach(o => {
          const node = diagramRepresentation?.cy.$id(o.id)
          if (!node) return
          node.data('functional', newEntity?.isDataPropertyFunctional)
        })
      })
    }
    this.postEdit()
  }

  /**
   * Edit a hierarchy adding a class as superclass.
   * Also updates graph adding the edge between hierarchy node and superclass.
   * @param hierarchyID hiearchyID to edit
   * @param superClassIRI The class to set as superclass
   * @param edgeType [optional] edge type is derived from hierarchy node type,
   * hence you should not need to pass it.
   */
  public addHiearchySuperClass(
    hierarchyID: string,
    superClassIRI: string,
    edgeType?: TypesEnum.UNION |
      TypesEnum.DISJOINT_UNION |
      TypesEnum.COMPLETE_UNION |
      TypesEnum.COMPLETE_DISJOINT_UNION
  ) {
    const diagram = this.grapholscape.renderer.diagram
    if (!diagram)
      return

    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
    const hierarchy = this.grapholscape.ontology.getHierarchy(hierarchyID)
    if (hierarchy) {
      if (!edgeType) {
        edgeType = hierarchy.type
        if (hierarchy.forcedComplete) {
          edgeType = hierarchy.type === TypesEnum.UNION ? TypesEnum.COMPLETE_UNION : TypesEnum.COMPLETE_DISJOINT_UNION
        }
      }
      const superClassEntity = this.grapholscape.ontology.getEntity(superClassIRI)
      // there can be only one class per diagram, just take the id of the first entity occurrence in this diagram
      const superClassID = superClassEntity
        ?.occurrences.get(this.rendererState)
        ?.find(occ => occ.diagramId === this.diagramBuilder?.diagram.id && occ.is(TypesEnum.CLASS))
        ?.id
      // nodeID != hierarchyID
      const hierarchyNodeID = this.diagramBuilder?.diagramRepresentation?.cy.$(`[hierarchyID = "${hierarchyID}"]`).first().id()
      if (superClassEntity && superClassID && hierarchyNodeID) {
        hierarchy.addSuperclass(superClassEntity)
        this.diagramBuilder?.addEdge(hierarchyNodeID, superClassID, edgeType)
      }
    }
  }

  /**
   * Edit a hierarchy adding a class as input.
   * Also updates graph adding the edge between hierarchy node and superclass.
   * @param hierarchyID 
   * @param inputClassIRI 
   * @returns 
   */
  public addHierarchyInput(hierarchyID: string, inputClassIRI: string) {
    const diagram = this.grapholscape.renderer.diagram
    if (!diagram)
      return

    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
    const hierarchy = this.grapholscape.ontology.getHierarchy(hierarchyID)
    if (hierarchy) {
      const classEntity = this.grapholscape.ontology.getEntity(inputClassIRI)
      const classOccurrenceID = classEntity
        ?.occurrences.get(this.rendererState)
        ?.find(occ => occ.diagramId === this.diagramBuilder?.diagram.id && occ.is(TypesEnum.CLASS))
        ?.id
      const hierarchyNodeID = this.diagramBuilder.diagramRepresentation?.cy.$(`[hierarchyID = "${hierarchyID}"]`).first().id()

      if (classEntity && classOccurrenceID && hierarchyNodeID) {
        hierarchy.addInput(classEntity)
        this.diagramBuilder.addEdge(classOccurrenceID, hierarchyNodeID, TypesEnum.INPUT)
      }
    }
  }

  /**
   * Takes hierarchies in which a renamed/refactored class is involved,
   * then update the iri in all hierarchies models.
   *   - Rename class: provide hierarchies attached to the renamed occurrence
   *   - Refactor class: provide all hierarchies in which the class is involved
   * @param hierarchies the list of hierarchies involved to the edited entity.
   * @param oldIri 
   * @param newIri 
   */
  public updateHierarchies(hierarchies: Hierarchy[], previousEntity: GrapholEntity, newEntity: GrapholEntity) {
    hierarchies.forEach(hierarchy => {
      if (hierarchy?.inputs.find(i => i === previousEntity)) {
        hierarchy.removeInput(previousEntity)
        hierarchy.addInput(newEntity)
      }

      if (hierarchy?.superclasses.find(i => i.classEntity === previousEntity)) {
        hierarchy.removeSuperclass(previousEntity)
        hierarchy.addSuperclass(newEntity)
      }
    })
  }

  public toggleFunctionality(iri) {
    const entity = this.grapholscape.ontology.getEntity(iri)
    if (entity) {
      if (entity.hasFunctionProperty(FunctionalityEnum.FUNCTIONAL)) {
        if (entity.is(TypesEnum.OBJECT_PROPERTY))
          entity.functionProperties = []

        if (entity.is(TypesEnum.DATA_PROPERTY))
          entity.isDataPropertyFunctional = false
      } else {
        if (entity.is(TypesEnum.OBJECT_PROPERTY))
          entity.functionProperties.push(FunctionalityEnum.FUNCTIONAL)

        if (entity.is(TypesEnum.DATA_PROPERTY))
          entity.isDataPropertyFunctional = true
      }
      const diagram = this.grapholscape.renderer.diagram as Diagram
      this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
      if (entity)
        //this.diagramBuilder.toggleFunctionality(entity, entity?.hasFunctionProperty(FunctionalityEnum.FUNCTIONAL))
        this.grapholscape.ontology.diagrams.forEach(d => {
          let diagramRepresentation = d.representations.get(this.rendererState)
          entity?.getOccurrencesByDiagramId(d.id, this.rendererState).get(this.rendererState)?.forEach(o => {
            const node = diagramRepresentation?.cy.$id(o.id)
            if (!node) return
            node.data('functional', entity.isDataPropertyFunctional)
          })
        })
    }

  }

  public toggleUnion(elem: cytoscape.CollectionReturnValue) {
    const hierarchyID: string | undefined = elem.data().hierarchyID

    if (hierarchyID) {
      const hierarchy = this.grapholscape.ontology.getHierarchy(hierarchyID)
      if (hierarchy) {
        hierarchy.type = hierarchy.type === TypesEnum.UNION ? TypesEnum.DISJOINT_UNION : TypesEnum.UNION
        toggleDisjointness(elem, this.grapholscape.renderer.diagram!.representations.get(RendererStatesEnum.FLOATY)!)
      }
    }
  }

  public toggleComplete(edge: cytoscape.EdgeSingular) {
    const hierarchyID: string | undefined = edge.source().data().hierarchyID
    if (hierarchyID) {
      const hierarchy = this.grapholscape.ontology.getHierarchy(hierarchyID)
      const superClassIRI = edge.target().data().iri
      if (hierarchy && superClassIRI) {
        const superClass = hierarchy.superclasses.find(sc => sc.classEntity.iri.equals(superClassIRI))
        if (superClass) {
          superClass.complete = !superClass.complete
          toggleComplete(edge, superClass.complete, this.grapholscape.renderer.diagram?.representations.get(RendererStatesEnum.FLOATY)!)
        }
      }
    }
  }

  public swapEdge(elem) {
    const diagram = this.grapholscape.renderer.diagram as Diagram
    this.diagramBuilder = new DiagramBuilder(diagram, this.rendererState)
    this.diagramBuilder.swapEdge(elem)
  }

  public convertCamelCase(input: string) {
    input = input.replace(/((?<=[a-z])[A-Z]|(?<!A)[A-Z](?=[a-z]))/g, " $1").trim()
    //input = input.charAt(0).toUpperCase() + input.slice(1);
    let inputSplit = input.split(' ')
    inputSplit.forEach((w, i) => {
      if (w !== w.toUpperCase() && i > 0)
        inputSplit[i] = w.toLowerCase()
      else
        inputSplit[i] = w
    })
    input = inputSplit.join(' ')
    return input
  }

  public convertSnakeCase(input: string) {
    input = input.replace(/_/g, ' ')
    return input
  }

  private _problems: OntologyProblem[] | undefined

  public validateOntology(): boolean {
    this._problems = []
    let result = true
    let floatyRepr: DiagramRepresentation | undefined, hierarchy: Hierarchy | undefined
    this.grapholscape.ontology.diagrams.forEach(diagram => {
      floatyRepr = diagram.representations.get(RendererStatesEnum.FLOATY)
      if (floatyRepr) {
        floatyRepr.cy.nodes(`[hierarchyID]`).forEach(elem => {
          hierarchy = this.grapholscape.ontology.getHierarchy(elem.data().hierarchyID)
          if (hierarchy && !hierarchy.isValid()) {
            const grapholElem = this.grapholscape.ontology.getGrapholElement(elem.id(), diagram.id, RendererStatesEnum.FLOATY)
            if (hierarchy.inputs.length === 0) {
              this._problems!.push({
                type: 'error',
                message: `The hierarchy with ID=[${hierarchy.id}] has no input classes. \n
                  To fix this error please add some classes as inputs to the union node.
                `,
                grapholElement: grapholElem,
              })

              result = false
            }

            if (hierarchy.superclasses.length === 0) {
              this._problems!.push({
                type: 'warning',
                message: `The hierarchy with ID=[${hierarchy.id}] has no super classes. \n
                  To clear this warning please add an inclusion edge toward a class.
                `,
                grapholElement: grapholElem,
              })
            }
          }
        })
      }
    })

    return result
  }

  /**
   * Merge a RDFGraph inside an existing RDFGraph.
   * Entities will be added through DiagramBuilder, it will avoid duplicates because
   * it expects operations to be based on IRIs(GrapholEntity) and not IDs.
   * 
   * Parse the rdfGraph creating the Ontology object containing diagram and entities so we
   * can easily add nodes/edges via DiagramBuilder.
   * DiagramBuilder assumes we are adding entities already defined in the ontology, 
   * so for each element we find in parsed diagram, first add it to current ontology,
   * then add its representation via DiagramBuilder.
   * Hierarchies are computed beforehand so we know for each classIri which are the involved
   * hierarchies, just check if it's already present that hierarchy in diagram, if not add it.
   * 
   * @param rdfGraph the diagram to merge, either in RDFGraph format or cytoscape representation
   * @param baseDiagramId [optional] the diagram id to use as base for the merge.
   * if not passed new diagrams will be created, one for each diagram in the rdfGraph.
   * @returns A promise resolved in case of sucessful merge, rejected in case of errors.
   * Show loading animation while waiting the promise to resolve/reject.
   */
  public mergeRDFGraph(rdfGraph: RDFGraph, baseDiagramId?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      let targetDiagram: Diagram | undefined
      if (baseDiagramId !== undefined) {
        targetDiagram = this.grapholscape.ontology.getDiagram(baseDiagramId)
        if (!targetDiagram) {
          console.error(`Cannot find diagram with ID = ${baseDiagramId}`)
          reject()
          return
        }
      }

      let targetCy = targetDiagram?.representations.get(this.rendererState)?.cy
      if (!targetCy && targetDiagram) {
        reject()
        return
      }

      if (targetDiagram) {
        this.diagramBuilder = new DiagramBuilder(targetDiagram, this.rendererState)
      }

      const _tempOntology = parseRDFGraph(rdfGraph)

      let entity: GrapholEntity | undefined
      let parsedEntity: GrapholEntity | undefined
      let sourceEntity: GrapholEntity | undefined
      let targetEntity: GrapholEntity | undefined
      let hierarchies: Hierarchy[] = []
      let addedElem: GrapholElement | undefined
      let resultCollection = cytoscape().collection()
      let newDiagramId: number = 0

      _tempOntology.diagrams.forEach(d => {
        if (baseDiagramId === undefined || !targetDiagram) {
          // if diagramId not passed then create a new diagram for each diagram to merge (basically not a merge)
          while (this.grapholscape.ontology.getDiagram(newDiagramId) !== undefined) {
            newDiagramId += 1
          }

          targetDiagram = new Diagram(d.name, newDiagramId)
          targetDiagram.representations.set(this.rendererState, new DiagramRepresentation(floatyOptions))
          this.grapholscape.ontology.addDiagram(targetDiagram)
          this.diagramBuilder = new DiagramBuilder(targetDiagram, this.rendererState)
        }

        const diagramRepr = d.representations.get(this.rendererState)
        targetCy = targetDiagram.representations.get(this.rendererState)?.cy
        if (!targetCy) {
          return
        }

        diagramRepr?.cy.nodes(`[ type = "${TypesEnum.CLASS}" ]`).forEach(c => {
          parsedEntity = _tempOntology.getEntity(c.data().iri)

          if (parsedEntity) {
            entity = this.grapholscape.ontology.getEntity(parsedEntity.iri)
            if (!entity) {
              // if entity is not in current ontology, clear all occurrences
              // diagramBuilder will create new occurrences for this class
              parsedEntity.removeAllOccurrences(this.rendererState)
              this.grapholscape.ontology.addEntity(parsedEntity)
              entity = parsedEntity
            }

            addedElem = this.diagramBuilder.addClass(entity)
            resultCollection = resultCollection.union(targetCy!.$id(addedElem.id))
          }
        })

        const addedHierarchies: string[] = []
        diagramRepr?.cy.nodes(`[ type = "${TypesEnum.CLASS}" ]`).forEach(c => {
          const entity = this.grapholscape.ontology.getEntity(c.data().iri)
          if (!entity) {
            return
          }

          // add hierarchies
          hierarchies = _tempOntology.getHierarchiesOf(entity.iri)
          hierarchies.forEach(h => {
            if (addedHierarchies.includes(h.id)) {
              return
            }
            // build the hierarchy from updated entities in the target ontology, not the temp one!
            // why? cause the entities in _tempOntology have occurrences ID based on the source ontology which
            // might clash with the IDs in the target ontology
            const newHierarchy = new Hierarchy(h.id, h.type, h.forcedComplete)

            h.inputs.map(input => this.grapholscape.ontology.getEntity(input.fullIri)).forEach(newInput => {
              if (newInput)
                newHierarchy.addInput(newInput)
            })

            h.superclasses.forEach(sc => {
              const newSC = this.grapholscape.ontology.getEntity(sc.classEntity.fullIri)
              if (newSC) {
                newHierarchy.addSuperclass(newSC, sc.complete)
              }
            })

            const unionNode = this.diagramBuilder.addHierarchy(newHierarchy)
            if (unionNode) {
              newHierarchy.id = unionNode.id
              resultCollection = resultCollection.union(targetCy!.$(`[ hierarchyID = "${unionNode.id}"]`).neighborhood())
            }
            this.grapholscape.ontology.addHierarchy(newHierarchy)
            addedHierarchies.push(h.id)
          })
        })

        diagramRepr?.cy.edges(`[ type = "${TypesEnum.OBJECT_PROPERTY}" ]`).forEach(op => {
          parsedEntity = _tempOntology.getEntity(op.data().iri)
          targetEntity = this.grapholscape.ontology.getEntity(op.target().data().iri)
          sourceEntity = this.grapholscape.ontology.getEntity(op.source().data().iri)


          if (parsedEntity && sourceEntity && targetEntity) {
            entity = this.grapholscape.ontology.getEntity(parsedEntity.iri)
            if (!entity) {
              // if entity is not in current ontology, clear all occurrences
              // diagramBuilder will create new occurrences for this class
              parsedEntity.removeAllOccurrences(this.rendererState)
              this.grapholscape.ontology.addEntity(parsedEntity)
              entity = parsedEntity
            }

            addedElem = this.diagramBuilder.addObjectProperty(entity, sourceEntity, targetEntity, [TypesEnum.CLASS])
            if (addedElem) {
              resultCollection = resultCollection.union(targetCy!.$id(addedElem.id))
            }
          }
        })

        diagramRepr?.cy.nodes(`[ type = "${TypesEnum.DATA_PROPERTY}" ]`).forEach(dp => {
          parsedEntity = _tempOntology.getEntity(dp.data().iri)
          sourceEntity = this.grapholscape
            .ontology
            .getEntity(dp.neighborhood(`[ type = "${TypesEnum.CLASS}" ]`).first().data().iri)

          if (parsedEntity && sourceEntity) {
            entity = this.grapholscape.ontology.getEntity(parsedEntity.iri)
            if (!entity) {
              // if entity is not in current ontology, clear all occurrences
              // diagramBuilder will create new occurrences for this class
              parsedEntity.removeAllOccurrences(this.rendererState)
              this.grapholscape.ontology.addEntity(parsedEntity)
              entity = parsedEntity
            }

            addedElem = this.diagramBuilder.addDataProperty(entity, sourceEntity)
            if (addedElem) {
              resultCollection = resultCollection.union(targetCy!.$id(addedElem.id))
            }
          }
        })

        diagramRepr?.cy.nodes(`[ type = "${TypesEnum.INDIVIDUAL}" ]`).forEach(ind => {
          parsedEntity = _tempOntology.getEntity(ind.data().iri)
          sourceEntity = this.grapholscape
            .ontology
            .getEntity(ind.neighborhood(`[ type = "${TypesEnum.CLASS}" ]`).first().data().iri)

          if (parsedEntity && sourceEntity) {
            entity = this.grapholscape.ontology.getEntity(parsedEntity.iri)
            if (!entity) {
              // if entity is not in current ontology, clear all occurrences
              // diagramBuilder will create new occurrences for this class
              parsedEntity.removeAllOccurrences(this.rendererState)
              this.grapholscape.ontology.addEntity(parsedEntity)
              entity = parsedEntity
            }

            addedElem = this.diagramBuilder.addIndividual(entity)
            const sourceId = sourceEntity.getIdInDiagram(targetDiagram!.id, TypesEnum.CLASS, this.rendererState)
            if (addedElem && sourceId) {
              resultCollection = resultCollection.union(targetCy!.$id(addedElem.id))
              addedElem = this.diagramBuilder.addEdge(addedElem?.id, sourceId, TypesEnum.INSTANCE_OF)
              if (addedElem) {
                resultCollection = resultCollection.union(targetCy!.$id(addedElem.id))
              }
            }
          }
        })

        diagramRepr?.cy.edges(`[ type = "${TypesEnum.INCLUSION}" ]`).forEach(inclusionEdge => {
          sourceEntity = this.grapholscape.ontology.getEntity(inclusionEdge.source().data().iri)
          targetEntity = this.grapholscape.ontology.getEntity(inclusionEdge.target().data().iri)
          const sourceId = sourceEntity?.getIdInDiagram(targetDiagram!.id, TypesEnum.CLASS, this.rendererState)
          const targetId = targetEntity?.getIdInDiagram(targetDiagram!.id, TypesEnum.CLASS, this.rendererState)

          if (sourceId && targetId) {
            addedElem = this.diagramBuilder.addEdge(sourceId, targetId, TypesEnum.INCLUSION)
            if (addedElem) {
              resultCollection = resultCollection.union(targetCy!.$id(addedElem.id))
            }
          }
        })

        if (this.diagramBuilder.diagramRepresentation)
          new DiagramColorManager(this.diagramBuilder.diagramRepresentation).colorDiagram()
      })

      if (baseDiagramId !== undefined) {
        resultCollection.select()
        this.grapholscape.renderer.renderState?.runLayout()
        setTimeout(() => targetCy?.fit(resultCollection, 100), 250)
      }
      resolve()
    })
  }

  public getErrors() {
    if (!this._problems)
      this.validateOntology()

    return this._problems?.filter(p => p.type === 'error') || []
  }

  public getWarnings() {
    if (!this._problems)
      this.validateOntology()

    return this._problems?.filter(p => p.type === 'warning') || []
  }

  private getNewEntityLabel(lexicalForm: string, convertCamelCase: boolean, convertSnakeCase: boolean, language?: string) {
    let label = convertCamelCase ? this.convertCamelCase(lexicalForm) : lexicalForm
    label = convertSnakeCase ? this.convertSnakeCase(label) : label
    return new Annotation(DefaultAnnotationProperties.label, label, language, language ? 'rdf:PlainLiteral' : 'xsd:string')
  }

  /**
   * Given a new entity updated from a old entity, updates the label using
   * the new iri remainder.
   * 
   * If the new entity has a label matching the old entity iri remainder,
   * we can safely replace that label with a new one.
   * 
   * Language and camel/snake case conversion will follow the global
   * advanced settings.
   * @param newEntity the entity on which the label must be updated
   * @param advancedSettings the settings to use for label generation,
   * global settings are expected here
   * @param oldEntity the previous entity, used for replacing old label,
   * if not defined then no label will be replaced.
   */
  private updateLabelOnEntity(
    newEntity: GrapholEntity,
    advancedSettings: AdvancedFormProps,
    oldEntity?: GrapholEntity
  ) {
    const labelAnnotations = newEntity.getLabels()
    let annotationToRemove: Annotation | undefined
    if (labelAnnotations.length === 1 && labelAnnotations[0].value !== newEntity.iri.remainder) {
      annotationToRemove = labelAnnotations[0]
    } else if (oldEntity && labelAnnotations.length > 1) {
      annotationToRemove = labelAnnotations.find(a => {
        // try finding a match in any possible case, we do not know settings at the time the label was created
        return a.value === oldEntity.iri.remainder
          || a.value === this.convertSnakeCase(this.convertCamelCase(oldEntity.iri.remainder))
          || a.value === this.convertCamelCase(oldEntity.iri.remainder)
          || a.value === this.convertSnakeCase(oldEntity.iri.remainder)
      })
    }

    if (annotationToRemove) {
      newEntity.removeAnnotation(annotationToRemove)
    }

    const newLabel = this.getNewEntityLabel(newEntity.iri.remainder, advancedSettings.convertCamel, advancedSettings.convertSnake, advancedSettings.language)
    if (!newEntity.getLabels(advancedSettings.language).some(l => l.value === newLabel.value)) {
      newEntity.addAnnotation(newLabel)
    }
  }

  public postEdit() {
    const entityColorList = this.grapholscape.widgets.get(ui.WidgetEnum.ENTITY_COLOR_LEGEND)
    if (entityColorList) {
      ui.setColorList(entityColorList as ui.GscapeEntityColorLegend, this.grapholscape)
    }
  }
}