import { Drawer, Modal } from "antd";
import { Collection, CollectionReturnValue, NodeCollection, NodeSingular, SingularElementReturnValue } from "cytoscape";
import { DefaultAnnotationProperties, DiagramBuilder, GrapholEdge, GrapholElement, GrapholEntity, LifecycleEvent, RendererStatesEnum, ui } from "grapholscape";
import mousetrap from "mousetrap";
import { useContext, useEffect, useState } from "react";
import checkTypizations from "src/builder/check-typizations";
import drawNewEdge from "src/builder/edge-creation/draw-new-edge";
import OntologyBuilder from "src/builder/ontology-builder";
import { editEntityIcon } from "src/builder/ui/style";
import EntityIcon from "src/components/EntityIcon";
import { aiDarkColor, aiLightColor } from "src/css/ai-style";
import { aiIcon } from 'src/css/icons.jsx';
import { TypesEnum } from "src/gen";
import { describeEntityAI, generateAll, generateDataProperties, generateSubhierarchy } from "src/pages/designer/ai-operate";
import AnnotationTable from "./annotations/AnnotationsTable";
import CreateAnnotationModal from "./annotations/CreateAnnotationModal";
import CreateClassAndIndividualModal from "./class-individuals/CreateClassAndIndividual";
import EditClassAndIndividual from "./class-individuals/EditClassAndIndividual";
import CreateDataPropertyModal from "./data-properties/CreateDataProperty";
import EditDataProperty from "./data-properties/EditDataProperty";
import ElemRemover from "./ElemRemover";
import { FormContext } from "./FormContext";
import CreateObjectPropertyModal from "./object-properties/CreateObjectProperty";
import EditObjectProperty from "./object-properties/EditObjectProperty";
import { ToolbarContext } from "./ToolbarContext";
import { RAGApi } from "src/store/store";
import OWLDrawer from "./OwlDrawer";
import { FormatEnum } from "src/model";
import EntityCatalog from "./entity-catalog/EntityCatalog";
import { ApiContext } from "./ApiContext";

export function ContextualMenu() {
  const { grapholscape } = useContext(ToolbarContext)
  const formContext = useContext(FormContext)
  const { sparqlEndpointConnection } = useContext(ApiContext)


  let commandsWidget: ui.GscapeContextMenu
  // const [commandElementTarget, setCommandElementTarget] = useState<any>()
  const [referenceEntity, setReferenceEntity] = useState<GrapholEntity | undefined>()
  const [entityToEdit, setEntityToEdit] = useState<{
    entity: GrapholEntity,
    element: GrapholElement,
  } | undefined>()
  const [sourceIRI, setSourceIRI] = useState<string | undefined>()
  const [targetIRI, setTargetIRI] = useState<string | undefined>()
  const [sourceType, setSourceType] = useState<TypesEnum | undefined>()
  const [targetType, setTargetType] = useState<TypesEnum | undefined>()

  const [createIsa, setCreateIsa] = useState(false)
  const [createIndividual, setCreateIndividual] = useState(false)
  const [createDataProperty, setCreateDataProperty] = useState(false)
  const [createObjectProperty, setCreateObjectProperty] = useState(false)
  const [editClass, setEditClass] = useState(false)
  const [editIndividual, setEditIndividual] = useState(false)
  const [editDataProperty, setEditDataProperty] = useState(false)
  const [editObjectProperty, setEditObjectProperty] = useState(false)
  const [createHierarchy, setCreateHierarchy] = useState(false)
  const [editAnnotations, setEditAnnotations] = useState(false)
  const [mutlipleRemove, setMultipleRemove] = useState(false)
  const [elemsToRemove, setElemsToRemove] = useState<Collection | undefined>(undefined)
  const [newAIDescription, setNewAIDescription] = useState<string | undefined>(undefined)
  const [classesForDataExamples, setClassesForDataExamples] = useState<string[] | undefined>(undefined)
  const [findSimilarsTo, setFindSimilarsTo] = useState<GrapholEntity | undefined>(undefined)

  let ontologyBuilder: OntologyBuilder | undefined

  useEffect(() => {
    commandsWidget = new ui.GscapeContextMenu()
    if (!grapholscape) return

    grapholscape.on(LifecycleEvent.ContextClick, (evt) => {
      if (evt.target === grapholscape.renderer.cy) {
        return
      }
      let elem = evt.target as CollectionReturnValue

      if (grapholscape.renderState === RendererStatesEnum.FLOATY) {
        // setCommandElementTarget(elem)
        const commandsByType = getCommandsByType()
        // get commands for this elem type
        let commandsFunctions = commandsByType.get(elem.data('type')) || []
        const selectedElems = grapholscape.renderer.cy && grapholscape.renderer.cy.$(':selected')
        if (selectedElems && selectedElems.size() > 1 && selectedElems.contains(evt.target)) {
          elem = selectedElems
          commandsFunctions = [aiGenerate, removeMultiple]
        } else if (elem.data().iri) {
          const entity = grapholscape.ontology.getEntity(elem.data().iri)
          if (entity && !entity.types.includes(TypesEnum.ANNOTATION_PROPERTY)) {
            commandsFunctions.push(...(commandsByType.get('Entity') || []))
          }
        } else {
          const grapholElement = grapholscape.renderer.diagram?.representations.get(RendererStatesEnum.FLOATY)?.grapholElements.get(elem.id())
          if (grapholElement && grapholElement.isHierarchy()) {
            // For hierarchies there can be edges or nodes, manually add specific commands
            if (elem.isNode()) {
              commandsFunctions.push(addHierarchySuperClassEdge)
              commandsFunctions.push(addInputEdge)
            }
            commandsFunctions.push((elems) => ({
              ...removeMultiple(elems),
              disabled: elem.isEdge() && elem.source().outdegree(true) < 2
            }))
          }
          else if (elem.data('type') === TypesEnum.INPUT && (elem.connectedNodes(`[type = "${TypesEnum.UNION}"]`).nonempty() || elem.connectedNodes(`[type = "${TypesEnum.DISJOINT_UNION}"]`).nonempty())) {
            const hierarchyNode = elem.connectedNodes(`[type = "${TypesEnum.UNION}"], [type = "${TypesEnum.DISJOINT_UNION}"]`).first()
            commandsFunctions.push((elems) => ({
              ...removeMultiple(elems),
              disabled: hierarchyNode.connectedEdges(`[type = "${TypesEnum.INPUT}"]`).size() <= 2
            }))
          }
        }

        try {
          const htmlNodeReference = (elem as any).popperRef()
          if (htmlNodeReference && commandsFunctions.length > 0) {
            // each command function is a function taking grapholscape and the selected element
            // use map to get array of commands calling the command function
            const commands = grapholscape.aiDirtyState
              ? [{ content: "Accept or Reject AI edits first. ", icon: aiIcon }]
              : commandsFunctions.map(cf => cf(elem))
            if (elem.size() === 1 && elem.isNode()) {
              commandsWidget.attachTo(htmlNodeReference, commands)
            } else {
              commandsWidget.attachToPosition(evt.renderedPosition, grapholscape.container, commands)
            }

            /**
             * Set AI command background
             */
            commandsWidget.updateComplete.then(() => {
              const cmdComponents = commandsWidget.shadowRoot?.querySelectorAll('.command-entry')

              cmdComponents.forEach((cmdComponent: HTMLElement) => {
                cmdComponent.style.background = ''
                cmdComponent.style.color = ''

                if (cmdComponent?.querySelector('.command-text')?.innerHTML.includes('AI Generate')) {
                  cmdComponent.style.backgroundImage = `linear-gradient(135deg, ${aiDarkColor} 10%, ${aiLightColor} 100%)`
                  cmdComponent.style.marginBottom = '8px'
                } else if (cmdComponent.querySelector('.command-text')?.innerHTML.includes('Remove')) {
                  cmdComponent.style.background = `var(--gscape-color-danger-muted)`;
                  cmdComponent.style.color = `var(--gscape-color-danger)`;
                }
              })
            })
          }
        } catch (e) { console.error(e) }
      }
    })
    ontologyBuilder = new OntologyBuilder(grapholscape)

    mousetrap.bind('mod+shift+s', (e) => {
      e.preventDefault()
      onAddSubclassEdge(grapholscape.renderer.cy?.$(':selected').first() as NodeSingular)
    })

    mousetrap.bind('mod+shift+a', (e) => {
      e.preventDefault()
      if (referenceEntity || grapholscape.selectedEntity) {
        setReferenceEntity(referenceEntity || grapholscape.selectedEntity)
        setEditAnnotations(true)
      }
    })

    mousetrap.bind('mod+shift+e', (e) => {
      e.preventDefault()
      if (referenceEntity || grapholscape.selectedEntity && grapholscape.renderer.selectedElement) {
        setEntityToEdit({
          element: grapholscape.renderer.selectedElement,
          entity: referenceEntity || grapholscape.selectedEntity
        })
        switch (grapholscape.renderer.cy?.$(':selected').first().data().type) {
          case TypesEnum.CLASS:
            setEditClass(true)
            break

          case TypesEnum.INDIVIDUAL:
            setEditIndividual(true)
            break

          case TypesEnum.DATA_PROPERTY:
            setEditDataProperty(true)
            break

          case TypesEnum.OBJECT_PROPERTY:
            setEditObjectProperty(true)
            break

          default:
            setEntityToEdit(undefined)
        }
      }
    })

    mousetrap.bind('del', () => {
      const selectedElems = grapholscape.renderer.cy?.$(':selected')
      if (selectedElems?.nonempty()) {
        setElemsToRemove(selectedElems)
        setMultipleRemove(true)
      }
    })

    return () => {
      mousetrap.reset()
    }
  }, [grapholscape, commandsWidget])

  /**
 * Get a map storing for each element type (TypesEnum) an array of Command[].
 * Entities have some common commands, the key for such common commands in the map is 'Entity'.
 * The commands are actually functions taking the selected elem.
 * @returns a Map of functions yielding a command by element's type
 */
  const getCommandsByType = () => {
    /**
     * TODO: commandsMap can be set once in the useEffect above so it doesn't get created
     * at every right click.
     * (put it in useEffect so it won't be recreated at each component update)
     */
    const commandsMap = new Map<string | TypesEnum, ((elem: CollectionReturnValue) => ui.Command)[]>()

    // Common commands for all entities
    commandsMap.set('Entity', [
      // rename,
      editEntity,
      editAnnotationsCommand,
      removeMultiple
    ])

    commandsMap.set(TypesEnum.CLASS, [
      findSimilarsToCommand,
      addDataProperty,
      addObjectProperty,
      addIndividual,
      addISA,
      addSubhierarchy,
      addSubclassEdgeCommand,
    ])

    commandsMap.set(TypesEnum.DATA_PROPERTY, [findSimilarsToCommand, addInclusionEdge, addAttributeToClass])

    if (window["aiConfig"]) {
      commandsMap.get(TypesEnum.CLASS)?.unshift(aiGenerate)
      commandsMap.get(TypesEnum.DATA_PROPERTY)?.unshift(aiGenerate)
    }

    commandsMap.set(TypesEnum.OBJECT_PROPERTY, [findSimilarsToCommand])

    commandsMap.set(TypesEnum.INDIVIDUAL, [findSimilarsToCommand, addInstanceOfEdge])

    commandsMap.set(TypesEnum.INCLUSION, [removeMultiple])

    commandsMap.set(TypesEnum.INSTANCE_OF, [removeMultiple])

    commandsMap.set(TypesEnum.ATTRIBUTE_EDGE, [removeMultiple])

    commandsMap.set(TypesEnum.ANNOTATION_PROPERTY, [])

    return commandsMap
  }


  // COMMANDS
  /** TODO: evaluate taking elem from the component state  */
  const addISA = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Class in IS-A',
      icon: ui.icons.addClassIcon,
      shortcut: 'Ctrl+Shift+C',
      select: () => {
        if (elem.data().iri) {
          const refEntity = grapholscape.ontology.getEntity(elem.data().iri)
          if (refEntity) {
            setReferenceEntity(refEntity)
            setCreateIsa(true)
          }
        }
      }
    }
  }

  const addIndividual = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Individual',
      icon: ui.icons.addIndividualIcon,
      shortcut: 'Ctrl+Shift+I',
      select: () => {
        const entity = grapholscape.ontology.getEntity(elem.data().iri)
        if (entity) {
          setCreateIndividual(true)
          setReferenceEntity(entity)
        }
      }
    }
  }

  const addDataProperty = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Data Property',
      icon: ui.icons.addDataPropertyIcon,
      shortcut: 'Ctrl+Shift+D',
      select: () => {
        const entity = grapholscape.ontology.getEntity(elem.data().iri)
        if (entity) {
          setCreateDataProperty(true)
          setReferenceEntity(entity)
        }
      }
    }
  }

  const addObjectProperty = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Object Property',
      icon: ui.icons.addObjectPropertyIcon,
      shortcut: 'Ctrl+Shift+O',
      select: () => {
        const entity = grapholscape.ontology.getEntity(elem.data().iri)
        if (entity) {
          let currentCy = grapholscape.renderer.cy as any
          drawNewEdge(
            currentCy,
            TypesEnum.OBJECT_PROPERTY,
            elem,
            grapholscape.theme,
            (_, sourceNode, targetNode, addedEdge) => { // ehcomplete
              addedEdge.remove()
              setCreateObjectProperty(true)
              setReferenceEntity(entity)
              setSourceIRI(sourceNode.data().iri)
              setTargetIRI(targetNode.data().iri)
              setSourceType(sourceNode.data().type)
              setTargetType(targetNode.data().type)
            })
        }
      }
    }
  }

  const editEntity = (elem: SingularElementReturnValue): ui.Command => {
    return {
      content: 'Edit',
      icon: editEntityIcon,
      shortcut: 'Ctrl+Shift+E',
      select: () => {
        const entity = grapholscape.ontology.getEntity(elem.data('iri'))
        if (entity) {
          switch (elem.data('type')) {
            case TypesEnum.DATA_PROPERTY:
              setEditDataProperty(true)
              break
              // if (elem.isNode()) {
              //   const attributeEdge = elem.incomers(`edge[type = "${TypesEnum.ATTRIBUTE_EDGE}"]`).first()
              //   let domainClass: GrapholEntity | undefined
              //   if (attributeEdge.nonempty() && attributeEdge.isEdge()) {
              //     domainClass = grapholscape.ontology.getEntity(attributeEdge.source().data().iri)
              //   }
              //   //console.log(attributeEdge)
              //   new DataPropertyModal(grapholscape).edit(
              //     entity,
              //     attributeEdge.id(),
              //     domainClass,
              //     {
              //       functionProperties: [],
              //       domainTyped: attributeEdge.nonempty() && attributeEdge.isEdge() ? attributeEdge.data().domainTyped : false,
              //       domainMandatory: attributeEdge.nonempty() && attributeEdge.isEdge() ? attributeEdge.data().domainMandatory : false,
              //     }
              //   )
              // }
              break

            case TypesEnum.OBJECT_PROPERTY:
              setEditObjectProperty(true)
              break
              // if (elem.isEdge()) {
              //   const domainClass = grapholscape.ontology.getEntity(elem.source().data().iri)
              //   const rangeClass = grapholscape.ontology.getEntity(elem.target().data().iri)
              //   if (domainClass && rangeClass) {
              //     new ObjectPropertyModal(grapholscape).edit(
              //       entity,
              //       elem.id(),
              //       {
              //         functionProperties: [], // not used
              //         domainMandatory: elem.data().domainMandatory,
              //         domainTyped: elem.data().domainTyped,
              //         rangeMandatory: elem.data().rangeMandatory,
              //         rangeTyped: elem.data().rangeTyped,
              //       },
              //       domainClass,
              //       rangeClass
              //     )
              //   }
              // }
              break

            case TypesEnum.CLASS:
              setEditClass(true)
              break
            case TypesEnum.INDIVIDUAL:
              setEditIndividual(true)
              break
          }
          setEntityToEdit({ entity, element: grapholscape.renderer.grapholElements.get(elem.id()) })
        }
      }
    }
  }

  const addSubhierarchy = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Subhierarchy',
      icon: ui.icons.addSubhierarchyIcon,
      shortcut: 'Ctrl+Shift+H',
      select: () => {
        const entity = grapholscape.ontology.getEntity(elem.data().iri)
        if (entity) {
          setReferenceEntity(entity)
          setCreateHierarchy(true)
        }
      }
    }
  }

  const editAnnotationsCommand = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Edit Annotations',
      icon: ui.icons.editIcon,
      shortcut: 'Ctrl+Shift+A',
      select: () => {
        const entity = grapholscape.ontology.getEntity(elem.data().iri)
        if (entity) {
          setReferenceEntity(entity)
          setEditAnnotations(true)
        }
      }
    }
  }

  const addSubclassEdgeCommand = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Subclass Edge',
      icon: ui.icons.addISAIcon,
      shortcut: 'Ctrl+Shift+S',
      select: () => onAddSubclassEdge(elem)
    }
  }

  const onAddSubclassEdge = (elem: NodeSingular): void => {
    let currentCy = grapholscape.renderer.cy as any
    drawNewEdge(currentCy, TypesEnum.INCLUSION, elem, grapholscape.theme, (_, sourceNode, targetNode, addedEdge) => {
      addedEdge.remove()
      if (grapholscape.renderer.diagram) {
        const diagramBuilder = new DiagramBuilder(grapholscape.renderer.diagram, RendererStatesEnum.FLOATY)
        diagramBuilder.addEdge(sourceNode.id(), targetNode.id(), TypesEnum.INCLUSION)
      }
    })
  }

  const removeMultiple = (elems: Collection): ui.Command => {
    return {
      content: `Remove${elems.size() > 1 ? ` ${elems.size()} elements` : ''}`,
      icon: ui.icons.rubbishBin,
      shortcut: 'Del',
      select: () => {
        setElemsToRemove(elems)
        setMultipleRemove(true)
      }
    }
  }

  const addHierarchySuperClassEdge = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Inclusion Edge',
      icon: ui.icons.addISAIcon,
      select: () => {
        let currentCy = grapholscape.renderer.cy as any
        let edgeType = elem.data().type
        if (elem.data().hierarchyForcedComplete) {
          if (elem.data().type === TypesEnum.UNION) {
            edgeType = TypesEnum.COMPLETE_UNION
          } else {
            edgeType = TypesEnum.COMPLETE_DISJOINT_UNION
          }
        }

        drawNewEdge(currentCy, edgeType, elem, grapholscape.theme, (_, sourceNode, targetNode, addedEdge) => {
          addedEdge.remove()
          ontologyBuilder.addHiearchySuperClass(sourceNode.data().hierarchyID, targetNode.data().iri)
        })
      }
    }
  }

  const addInputEdge = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Input Edge',
      icon: ui.icons.addInputIcon,
      select: () => {
        let currentCy = grapholscape.renderer.cy as any
        drawNewEdge(
          currentCy,
          TypesEnum.INPUT,
          elem,
          grapholscape.theme,
          (_, sourceNode, targetNode, addedEdge) => {
            addedEdge.remove()
            if (grapholscape.renderer.diagram) {
              if (sourceNode.data().type.endsWith('union')) {
                ontologyBuilder.addHierarchyInput(sourceNode.data().hierarchyID, targetNode.data().iri)
              } else {
                ontologyBuilder.addHierarchyInput(targetNode.data().hierarchyID, sourceNode.data().iri)
              }
            }
          },
          true // input edges must go towards input node, but we draw them in opposite direction
        )
      }
    }
  }

  const addAttributeToClass = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add to Class',
      icon: ui.icons.addDataPropertyIcon,
      select: () => {
        let currentCy = grapholscape.renderer.cy as any
        drawNewEdge(
          currentCy,
          TypesEnum.ATTRIBUTE_EDGE,
          elem,
          grapholscape.theme,
          (_, sourceNode, targetNode, addedEdge) => {
            addedEdge.remove()
            if (grapholscape.renderer.diagram) {
              const diagramBuilder = new DiagramBuilder(grapholscape.renderer.diagram, RendererStatesEnum.FLOATY)
              const attributeEdge = elem.connectedEdges(`[ type = "${TypesEnum.ATTRIBUTE_EDGE}" ]`).first()
              if (attributeEdge.empty()) {
                diagramBuilder.addEdge(sourceNode.id(), targetNode.id(), TypesEnum.ATTRIBUTE_EDGE) as GrapholEdge | undefined
              } else {
                const dataPropertyEntity = grapholscape.ontology.getEntity(elem.data().iri)
                const classEntity = grapholscape.ontology.getEntity(sourceNode.data().iri)
                if (dataPropertyEntity && classEntity) {
                  const addedNode = diagramBuilder.addDataProperty(dataPropertyEntity, classEntity)
                  if (addedNode) { // replicate domain info on new created edge
                    const newCyEdge = grapholscape.renderer
                      .cy
                      ?.$id(addedNode.id)
                      .connectedEdges(`[ type = "${TypesEnum.ATTRIBUTE_EDGE}" ]`)
                      .first()

                    if (newCyEdge && newCyEdge.nonempty()) {
                      const newGrapholEdge = grapholscape.renderer.grapholElements?.get(newCyEdge.id()) as GrapholEdge | undefined
                      if (newGrapholEdge) {
                        newGrapholEdge.domainTyped = attributeEdge.data().domainTyped
                        newGrapholEdge.domainMandatory = attributeEdge.data().domainMandatory
                        if (grapholscape.renderState) {
                          grapholscape.renderer
                            .diagram
                            .representations
                            .get(grapholscape.renderState)
                            ?.updateElement(newGrapholEdge)
                        }
                      }
                      grapholscape.renderer.renderState?.runLayout()
                      setTimeout(() => grapholscape.centerOnElement(addedNode.id, addedNode.diagramId, 1.5), 250)
                    }
                  }

                  checkTypizations(grapholscape, dataPropertyEntity)
                }
              }
            }
          },
          true // input edges must go towards input node, but we draw them in opposite direction
        )
      }
    }
  }

  const addInclusionEdge = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add Inclusion Edge',
      icon: ui.icons.addISAIcon,
      select: () => {
        let currentCy = grapholscape.renderer.cy as any
        drawNewEdge(currentCy, TypesEnum.INCLUSION, elem, grapholscape.theme, (_, sourceNode, targetNode, addedEdge) => {
          addedEdge.remove()
          if (grapholscape.renderer.diagram) {
            const diagramBuilder = new DiagramBuilder(grapholscape.renderer.diagram, RendererStatesEnum.FLOATY)
            diagramBuilder.addEdge(sourceNode.id(), targetNode.id(), TypesEnum.INCLUSION)
          }
        })
      }
    }
  }

  const addInstanceOfEdge = (elem: NodeSingular): ui.Command => {
    return {
      content: 'Add InstanceOf Edge',
      icon: ui.icons.addInstanceIcon,
      select: () => {
        let currentCy = grapholscape.renderer.cy as any
        drawNewEdge(
          currentCy,
          TypesEnum.INSTANCE_OF,
          elem,
          grapholscape.theme,
          (_, sourceNode, targetNode, addedEdge) => {
            addedEdge.remove()
            if (grapholscape.renderer.diagram) {
              const diagramBuilder = new DiagramBuilder(grapholscape.renderer.diagram, RendererStatesEnum.FLOATY)
              diagramBuilder.addEdge(sourceNode.id(), targetNode.id(), TypesEnum.INSTANCE_OF)
            }
          },
        )
      }
    }
  }

  const aiGenerate = (elem: NodeCollection): ui.Command => {
    const entity = grapholscape.ontology.getEntity(elem.data().iri || '')

    const classes = elem.filter(e => e.data().type === TypesEnum.CLASS)

    const getDataExamplesCommand = {
      content: `Get Data Exaples`,
      description: "Let AI suggest examples of RDF triples instantiating the selected classes or data properties based on the current ontology",
      icon: aiIcon,
      disabled: classes.size() === 0,
      select: () => {
        setClassesForDataExamples(classes.map(e => e.data().iri).filter(iri => !!iri))
      }
    }

    const allSubCmd = {
      content: "All",
      description: "Let AI generate a description of the selected element and suggestions of properties and subhierarchies related to it",
      icon: aiIcon,
      select: async () => {
        if (entity) {
          return new Promise<void>((resolve) => {
            generateAll(entity, elem.data().type, grapholscape.language, grapholscape).then(({ description }) => {
              setNewAIDescription(description)
              setReferenceEntity(entity)
            }).finally(resolve)
          })
        }
      }
    }

    const dpSubCmd = {
      content: "Data Properties",
      icon: ui.icons.addDataPropertyIcon,
      select: async () => {
        if (entity) {
          await generateDataProperties(entity, grapholscape.language, grapholscape)
        }
      },
    }

    const hierarchySubCmd = {
      content: "SubHierarchy",
      icon: ui.icons.addSubhierarchyIcon,
      select: async () => {
        if (entity) {
          await generateSubhierarchy(entity, grapholscape.language, grapholscape)
        }
      }
    }

    const describeSubCmd = {
      content: "Description",
      icon: ui.icons.editIcon,
      select: () => {
        return new Promise<void>(resolve => {
          if (entity) {
            describeEntityAI(entity, elem.data().type, grapholscape).then(description => {
              setNewAIDescription(description)
              setReferenceEntity(entity)
            }).finally(resolve)
          }
        })
      }
    }

    let subCommands: ui.Command[] = []
    if (elem.data().type === TypesEnum.CLASS) {
      subCommands = [
        allSubCmd,
        dpSubCmd,
        hierarchySubCmd,
        describeSubCmd
      ]
    }

    if (elem.data().type === TypesEnum.DATA_PROPERTY) {
      subCommands = [describeSubCmd]
    }

    if (classes.size() > 0) {
      subCommands.push(getDataExamplesCommand)
    }

    return {
      content: "AI Generate",
      description: "Let AI generate suggestions of properties for this class",
      icon: aiIcon,
      subCommands: elem.size() > 1 ? Promise.resolve([getDataExamplesCommand]) : Promise.resolve(subCommands)
    }
  }

  const findSimilarsToCommand = (elem: NodeSingular): ui.Command => {
    const entity = grapholscape.ontology.getEntity(elem.data().iri)
    return {
      content: 'Find Similars in Catalog',
      description: 'Look for similar entities in the Entity Catalog',
      icon: ui.icons.search,
      disabled: !sparqlEndpointConnection || !entity,
      select: () => entity && setFindSimilarsTo(entity)
    }
  }

  return <div id="cxt-menu-wrapper">

    {<FormContext.Provider value={{
      ...formContext,
      entityToEdit: entityToEdit,
      referenceEntity: referenceEntity,
    }}>
      {createIsa && <CreateClassAndIndividualModal
        entityType={TypesEnum.CLASS}
        formType="isa"
        onDone={() => {
          setReferenceEntity(undefined)
          setCreateIsa(false)
        }}
      />}

      {createIndividual && <CreateClassAndIndividualModal
        entityType={TypesEnum.INDIVIDUAL}
        onDone={() => {
          setReferenceEntity(undefined)
          setCreateIndividual(false)
        }}
      />}

      {(editClass || editIndividual) && entityToEdit &&
        <EditClassAndIndividual
          entityType={editClass ? TypesEnum.CLASS : TypesEnum.INDIVIDUAL}
          onDone={() => {
            setEntityToEdit(undefined)
            setEditClass(false)
            setEditIndividual(false)
          }} />
      }
      {createDataProperty && referenceEntity && <CreateDataPropertyModal
        onDone={() => {
          setReferenceEntity(undefined)
          setCreateDataProperty(false)
        }}
      />
      }
      {editDataProperty && entityToEdit &&
        <EditDataProperty
          onDone={() => {
            setEntityToEdit(undefined)
            setEditDataProperty(false)
          }} />
      }
      {createObjectProperty && referenceEntity && <CreateObjectPropertyModal
        sourceIRI={sourceIRI}
        targetIRI={targetIRI}
        sourceType={sourceType}
        targetType={targetType}
        onDone={() => {
          setReferenceEntity(undefined)
          setCreateObjectProperty(false)
          setSourceIRI(undefined)
          setTargetIRI(undefined)
          setSourceType(undefined)
          setTargetType(undefined)
        }}
      />
      }
      {
        editObjectProperty && entityToEdit &&
        <EditObjectProperty
          onDone={() => {
            setEntityToEdit(undefined)
            setEditObjectProperty(false)
          }} />
      }

      {createHierarchy && referenceEntity && <CreateClassAndIndividualModal
        entityType={TypesEnum.CLASS}
        formType="hierarchy"
        onDone={() => {
          setReferenceEntity(undefined)
          setCreateHierarchy(false)
        }}
      />}

      {editAnnotations && referenceEntity && <Modal
        open={editAnnotations}
        footer={null}
        width={'fit-content'}
        title={<span>
          Edit Annotations of <EntityIcon type={referenceEntity.types[0]} />
          {referenceEntity.getDisplayedName(grapholscape.entityNameType)}
        </span>}
        onCancel={() => {
          setEditAnnotations(false)
          setReferenceEntity(undefined)
        }}
      >
        <AnnotationTable annotatedElement={referenceEntity} />
      </Modal>}

      {mutlipleRemove && <ElemRemover
        elems={elemsToRemove}
        onDone={() => {
          setMultipleRemove(false)
          setElemsToRemove(undefined)
        }} />}

      {newAIDescription && referenceEntity && <CreateAnnotationModal
        onDone={() => {
          setNewAIDescription(undefined) // close modal
          setReferenceEntity(undefined)
        }}
        defaultInput={{
          property: DefaultAnnotationProperties.comment.fullIri,
          language: formContext.advancedValues.language,
          range: newAIDescription,
          hasIRIRange: false,
          datatype: 'rdf:PlainLiteral',
        }}
        annotatedElement={referenceEntity}
      />}

      <OWLDrawer
        open={!!classesForDataExamples}
        onClose={() => setClassesForDataExamples(undefined)}
        formats={[FormatEnum.TURTLE]}
        fileName="data-examples"
        getOwl={(_) => {
          return RAGApi.postOntologyRDFExamples({
            postOntologyRDFExamplesRequest: {
              classes: classesForDataExamples,
              currentRdfGraph: grapholscape.exportToRdfGraph()
            }
          })
        }}
      />

      <Drawer
        title="Entity Catalog"
        placement="right"
        open={!!findSimilarsTo}
        onClose={() => setFindSimilarsTo(undefined)}
        width={'40%'}
      >
        <EntityCatalog findSimilarTo={findSimilarsTo} />
      </Drawer>

    </FormContext.Provider>}

  </div>
}