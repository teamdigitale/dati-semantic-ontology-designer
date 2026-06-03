import { DiagramColorManager, LifecycleEvent, RendererStatesEnum, TypesEnum, ui as UI } from 'grapholscape';
import DesignerCore from '../core';
import edgeEditing, { refreshAnchorsOnEdge } from '../edge-editing';
import OntologyBuilder from '../ontology-builder';
import GscapeDesignerInfobar from '../../pages/designer/Infobar';
import { setDesignerStyle } from './style';

const { GscapeContextMenu } = UI

export default function initBuilderUI(grapholscape: DesignerCore) {
  // const commandsWidget = new GscapeContextMenu()
  // const toolboxWidget = new GscapeDesignerToolbar()
  // toolboxWidget.grapholscape = grapholscape
  // const infobox = new GscapeDesignerInfobar()

  if (grapholscape.renderer.cy && !grapholscape.renderer.cy.scratch('designer-listeners-set')) {
    setDesignerStyle(grapholscape.renderer.cy, grapholscape.theme)
    edgeEditing(grapholscape)
    // set true in the scratch so it won't add new listeners
    // if it has already been added
    grapholscape.renderer.cy.scratch('designer-listeners-set', true)
  }

  if (grapholscape.renderState === RendererStatesEnum.FLOATY) {
    // grapholscape.uiContainer?.appendChild(toolboxWidget)
    // grapholscape.uiContainer?.appendChild(infobox)

    // grapholscape.widgets.set('designer-toolbar', toolboxWidget)
  }

  grapholscape.on(LifecycleEvent.NodeSelection, n => {
    const elem = grapholscape.renderer.cy?.$id(n.id)
    // toolboxWidget.lastSelectedElement = elem
  })

  grapholscape.on(LifecycleEvent.EdgeSelection, e => {
    const elem = grapholscape.renderer.cy?.$id(e.id)
    // toolboxWidget.lastSelectedElement = elem;
  })

  grapholscape.on(LifecycleEvent.BackgroundClick, () => {
    // toolboxWidget.lastSelectedElement = undefined
  })

  grapholscape.on(LifecycleEvent.DiagramChange, () => {
    // toolboxWidget.removeDiagramDisabled = grapholscape.ontology.diagrams.length === 1
    let currentCy = grapholscape.renderer.cy as any

    if (!currentCy.scratch('designer-listeners-set')) {

      setDesignerStyle(currentCy, grapholscape.theme)
      edgeEditing(grapholscape)

      // set true in the scratch so it won't add new listeners
      // if it has already been added
      currentCy.scratch('designer-listeners-set', true)
    }
  })

  grapholscape.on(LifecycleEvent.DoubleTap, (evt) => {
    const elem = evt.target
    if (grapholscape.renderState !== RendererStatesEnum.FLOATY) {
      return
    }
    const ontologyBuilder = new OntologyBuilder(grapholscape)
    switch (elem.data('type')) {
      case TypesEnum.DATA_PROPERTY:
        ontologyBuilder.toggleFunctionality(elem.data('iri'))
        break

      case TypesEnum.DISJOINT_UNION:
      case TypesEnum.UNION:
      case TypesEnum.COMPLETE_UNION:
      case TypesEnum.COMPLETE_DISJOINT_UNION:
        if (elem.isNode())
          ontologyBuilder.toggleUnion(elem)
        else
          ontologyBuilder.toggleComplete(elem)
        break

      case TypesEnum.OBJECT_PROPERTY:
      case TypesEnum.INCLUSION:
        ontologyBuilder.swapEdge(elem)
        refreshAnchorsOnEdge(elem)
        break

      default:
        return
    }
  })

  // grapholscape.on(LifecycleEvent.ContextClick, (evt) => {
  //   // toolboxWidget.lastSelectedElement = undefined
  //   if (evt.target === grapholscape.renderer.cy) {
  //     return
  //   }
  //   let elem = evt.target

  //   if (grapholscape.renderState === RendererStatesEnum.FLOATY) {
  //     const commandsByType = getCommandsByType()
  //     // get commands for this elem type
  //     let commandsFunctions = commandsByType.get(elem.data('type')) || []
  //     const selectedElems = grapholscape.renderer.cy && grapholscape.renderer.cy.$(':selected')
  //     if (selectedElems && selectedElems.size() > 1 && selectedElems.contains(evt.target)) {
  //       elem = selectedElems
  //       commandsFunctions = [removeMultiple]
  //     } else if (elem.data().iri) {
  //       const entity = grapholscape.ontology.getEntity(elem.data().iri)
  //       if (entity && !entity.types.includes(TypesEnum.ANNOTATION_PROPERTY)) {
  //         commandsFunctions.push(...(commandsByType.get('Entity') || []))
  //       }
  //     } else {
  //       const grapholElement = grapholscape.renderer.diagram?.representations.get(RendererStatesEnum.FLOATY)?.grapholElements.get(elem.id())
  //       if (grapholElement && grapholElement.isHierarchy()) {
  //         // For hierarchies there can be edges or nodes, manually add specific commands
  //         if (elem.isNode()) {
  //           commandsFunctions.push(addHierarchySuperClassEdge)
  //           commandsFunctions.push(addInputEdge)
  //         }
  //         commandsFunctions.push(removeMultiple)
  //       }
  //       else if (elem.data('type') === TypesEnum.INPUT && (elem.connectedNodes(`[type = "${TypesEnum.UNION}"]`).nonempty() || elem.connectedNodes(`[type = "${TypesEnum.DISJOINT_UNION}"]`).nonempty())) {
  //         commandsFunctions.push(removeMultiple)
  //       }
  //     }

  //     try {
  //       const htmlNodeReference = (elem as any).popperRef()
  //       if (htmlNodeReference && commandsFunctions.length > 0) {
  //         // each command function is a function taking grapholscape and the selected element
  //         // use map to get array of commands calling the command function
  //         const commands = grapholscape.aiDirtyState
  //           ? [{ content: "Accept or Reject AI edits first. ", icon: aiIcon }]
  //           : commandsFunctions.map(cf => cf(grapholscape, elem))
  //         if (elem.size() === 1 && elem.isNode()) {
  //           commandsWidget.attachTo(htmlNodeReference, commands)
  //         } else {
  //           commandsWidget.attachToPosition(evt.renderedPosition, grapholscape.container, commands)
  //         }

  //         /**
  //          * Set AI command background
  //          */
  //         commandsWidget.updateComplete.then(() => {
  //           const aiCmdComponent = commandsWidget.shadowRoot?.querySelector('.command-entry') as HTMLElement
  //           if (aiCmdComponent?.querySelector('.command-text')?.innerHTML.includes('AI Generate')) {
  //             aiCmdComponent.style.backgroundImage = `linear-gradient(135deg, ${aiDarkColor} 10%, ${aiLightColor} 100%)`
  //           } else {
  //             aiCmdComponent.style.backgroundImage = ''
  //           }
  //         })
  //       }
  //     } catch (e) { console.error(e) }
  //   }
  // })

  // grapholscape.on(LifecycleEvent.MouseOver, (evt) => {
  //   const elem = evt.target
  //   if (grapholscape.renderState === RendererStatesEnum.FLOATY) {

  //     if (elem.data('anchorPosition')) {
  //       infobox.content = 'Drag anchor to edit edge'
  //     }
  //     else if (elem.data('type') === TypesEnum.DATA_PROPERTY) {
  //       infobox.content = 'Double click to toggle functionality'
  //     }
  //     else if (elem.data('type') === TypesEnum.UNION || elem.data('type') === TypesEnum.DISJOINT_UNION) {
  //       if (elem.isNode())
  //         infobox.content = elem.data('type') === TypesEnum.UNION ? 'Double click to add disjointness' : 'Double click to remove disjointness'
  //       else {
  //         infobox.content = elem.data('targetLabel') === 'C' ? 'Double click to remove completeness' : 'Double click to add completeness'
  //       }
  //     }
  //     else if ((elem.data('type') === TypesEnum.OBJECT_PROPERTY || (elem.data('type') === TypesEnum.INCLUSION && elem.source().data('type') === TypesEnum.CLASS && elem.target().data('type') === TypesEnum.CLASS) || (elem.data('type') === TypesEnum.INCLUSION && elem.source().data('type') === TypesEnum.DATA_PROPERTY && elem.target().data('type') === TypesEnum.DATA_PROPERTY))) {
  //       infobox.content = 'Double click to swap edge'
  //     }
  //   }
  // })

  // grapholscape.on(LifecycleEvent.MouseOut, (evt) => {

  //   if (grapholscape.renderState === RendererStatesEnum.FLOATY) {
  //     infobox.content = ''
  //   }

  // })

  /**
   * Override callback for color button.
   * Activating color button in designer generate new colors every time.
   * This way it's up to the user whether to update colors or not.
   */
  const colorButton = grapholscape.widgets.get(UI.WidgetEnum.COLOR_BUTTON) as UI.GscapeButton
  if (colorButton) {
    const previousCallback = colorButton.onclick as any
    colorButton.onclick = (e) => {
      if (colorButton.active) {
        const repr = grapholscape.renderer.diagram?.representations.get(RendererStatesEnum.FLOATY)
        if (repr)
          new DiagramColorManager(repr).colorDiagram(true)
      }

      if (previousCallback)
        previousCallback(e)
    }
  }
}
