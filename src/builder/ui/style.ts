import { Core, Css, StylesheetJson } from "cytoscape";
import { ColoursNames, GrapholscapeTheme, TypesEnum, getFloatyStyle } from "grapholscape";
import { svg } from 'lit'


export function setDesignerStyle(cy: Core, theme: GrapholscapeTheme) {
  const edgeCreationType = cy.scratch('edge-creation-type')
  const edgeCreationLabel = cy.scratch('edge-creation-label')
  const edgeCreationReversed = cy.scratch('edge-creation-reversed')
  let edgeHandlingStyle: StylesheetJson = []
  if(edgeCreationType !== undefined) {
    edgeHandlingStyle = getEdgeHandlingStyle(theme, edgeCreationType as TypesEnum, edgeCreationLabel, edgeCreationReversed)
  }
  /**
   * Update style to change ghost edge styling based on edge-creation-type.
   * Could be done assigning here the type field to the ghost edge
   * but this event is fired before the creation of such edge, should use
   * a long enough timeout but trying it results in a poor UX.
   * So just update style with new values for .eh-ghost-edge.
   */
  (cy as any).style().resetToDefault().fromJson([
    ...getFloatyStyle(theme),
    ...getDesignerBaseStyle(theme, () => cy.scratch('_highlightAIGenerated')),
    ...edgeHandlingStyle,
  ]).update()
}

export function getDesignerBaseStyle(theme: GrapholscapeTheme, isHighlightAIGenerated: () => boolean): StylesheetJson {
  const designerBaseStyle: StylesheetJson = [
    {
      selector: '.anchor-node',
      style: {
        height: 10,
        width: 10,
      }
    },
    {
      selector: 'edge.editing',
      style: {
        display: 'none',
      }
    },
    {
      selector: `[?aiGenerated.isNew]`,
      style: {
        'underlay-color': theme.getColour(ColoursNames.success_subtle),
        'underlay-opacity': 0.8,
        'underlay-shape': 'ellipse',
        'underlay-padding': 6,
      },
    },
    {
      selector: `[?aiGenerated][!aiGenerated.isNew]`,
      style: {
        'underlay-color': () => isHighlightAIGenerated() ? theme.getColour(ColoursNames.attention_muted) : undefined,
        'underlay-opacity': () => isHighlightAIGenerated() ? 1 : undefined,
        'underlay-shape': 'ellipse',
        'underlay-padding': 6,
      }
    },
  ]


  return designerBaseStyle
}

/**
 * Apply stylesheet for edge handling during edge drawing in builder
 * @param cy cytoscape instance
 * @param theme current grapholscape's theme
 * @param creationEdgeType the kind of edge that is going to be shown
 * @param creationEdgeLabel the label to apply to the ghost edge
 */
export function getEdgeHandlingStyle(theme: GrapholscapeTheme, creationEdgeType: TypesEnum, creationEdgeLabel?: string, creationEdgeReversed = false) {
  const ehGhostEdgeStyles: { [x in TypesEnum]?: Css.Edge } = {
    [TypesEnum.INCLUSION]: {
      'target-arrow-shape': 'triangle',
    },
    [TypesEnum.OBJECT_PROPERTY]: {
      'line-color': theme.getColour(ColoursNames.object_property_contrast),
      'source-arrow-color': theme.getColour(ColoursNames.object_property_contrast),
      'target-arrow-color': theme.getColour(ColoursNames.object_property_contrast),
      'target-arrow-shape': 'triangle',
      'target-arrow-fill': 'filled',
      'source-arrow-shape': 'square',
      'source-arrow-fill': 'hollow',
      'width': 4,
    },
    [TypesEnum.INPUT]: {
      'line-style': 'solid',
      'target-arrow-shape': 'none',
    },
    [TypesEnum.INSTANCE_OF]: {
      "target-arrow-shape": 'triangle',
      'target-arrow-fill': 'filled',
      'line-color': theme.getColour(ColoursNames.individual),
      'target-arrow-color': theme.getColour(ColoursNames.individual_contrast),
      'line-opacity': 0.4,
    },
    [TypesEnum.UNION]: {
      'width': 6,
      'line-style': 'solid',
      'target-arrow-shape': 'triangle',
      'target-arrow-fill': 'hollow',
    },
    [TypesEnum.COMPLETE_UNION]: {
      'width': 6,
      'line-style': 'solid',
      'target-arrow-shape': 'triangle',
      'target-arrow-fill': 'hollow',
      'target-label': "C",
      'text-background-color': theme.getColour(ColoursNames.bg_graph),
      'text-background-opacity': 1,
      'text-background-shape': 'roundrectangle',
      'text-background-padding': '2',
      'font-size': 15,
      'target-text-offset': 20,
    },
    [TypesEnum.DISJOINT_UNION]: {
      'width': 6,
      'line-style': 'solid',
      'target-arrow-shape': 'triangle',
      'target-arrow-fill': 'filled',
    },
    [TypesEnum.COMPLETE_DISJOINT_UNION]: {
      'width': 6,
      'line-style': 'solid',
      'target-arrow-shape': 'triangle',
      'target-arrow-fill': 'filled',
      'target-label': "C",
      'text-background-color': theme.getColour(ColoursNames.bg_graph),
      'text-background-opacity': 1,
      'text-background-shape': 'roundrectangle',
      'text-background-padding': '2',
      'font-size': 15,
      'target-text-offset': 20,
    },
  }

  // Base style valid for any kind of ghost edge
  const ehGhostEdgeStyle: Css.Edge = {
    'opacity': 0.8,
    'text-rotation': 'autorotate',
    'label': creationEdgeLabel
  }

  // apply styling based on ghost edge type
  const ehGhostStyleByType = ehGhostEdgeStyles[creationEdgeType]
  if (ehGhostStyleByType) {
    if (creationEdgeReversed) {
      // reverse style of arrows
      const copy = JSON.parse(JSON.stringify(ehGhostStyleByType))

      ehGhostStyleByType['source-arrow-color'] = ehGhostStyleByType['target-arrow-color']
      ehGhostStyleByType['source-arrow-fill'] = ehGhostStyleByType['target-arrow-fill']
      ehGhostStyleByType['source-arrow-shape'] = ehGhostStyleByType['target-arrow-shape']
      ehGhostStyleByType['source-label'] = ehGhostStyleByType['target-label']
      ehGhostStyleByType['source-text-offset'] = ehGhostStyleByType['target-text-offset']

      ehGhostStyleByType['target-arrow-color'] = copy['source-arrow-color']
      ehGhostStyleByType['target-arrow-fill'] = copy['source-arrow-fill']
      ehGhostStyleByType['target-arrow-shape'] = copy['source-arrow-shape']
      ehGhostStyleByType['target-label'] = copy['source-label']
      ehGhostStyleByType['target-text-offset'] = copy['source-text-offset']
    }
    Object.assign(ehGhostEdgeStyle, ehGhostStyleByType)
  }

  const ehStyle = [
    {
      selector: '.eh-ghost-edge',
      style: ehGhostEdgeStyle
    },

    {
      selector: 'edge.eh-preview',
      style: {
        label: creationEdgeLabel
      }
    },

    {
      selector: '.eh-ghost-edge.eh-preview-active',
      style: {
        'opacity': 0,
      }
    },

    {
      selector: '.eh-target, .eh-source',
      style: {
        'border-width': 4,
      }
    },

    {
      selector: '.eh-presumptive-target',
      style: {
        'opacity': 1,
      }
    },

    {
      selector: '.eh-not-target',
      style: {
        'opacity': 0.4,
      }
    },
  ];

  return ehStyle
}

export const editEntityIcon = svg`<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M454.5-152v-232.5h67v82.5h287v67h-287v83h-67ZM151-235v-67h236.5v67H151Zm145.5-129.5V-447H151v-67h145.5v-83h67v232.5h-67Zm134-82.5v-67h378v67h-378ZM572-577v-232.5h67v83h169.5v67H639v82.5h-67Zm-421-82.5v-67h378v67H151Z"/></svg>`
export const assertionsIcon = svg`<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M180-194.5q-13.8 0-23.65-9.789-9.85-9.79-9.85-23.5 0-13.711 9.85-23.711 9.85-10 23.65-10h384q13.8 0 23.65 9.789 9.85 9.79 9.85 23.5 0 13.711-9.85 23.711-9.85 10-23.65 10H180Zm528.263 0q-13.763 0-23.763-9.789-10-9.79-10-23.5 0-13.711 9.825-23.711 9.825-10 23.587-10h71.825q13.763 0 23.763 9.789 10 9.79 10 23.5 0 13.711-9.825 23.711-9.825 10-23.587 10h-71.825Zm-528-168q-13.763 0-23.763-9.789-10-9.79-10-23.5 0-13.711 9.825-23.711 9.825-10 23.587-10h71.825q13.763 0 23.763 9.789 10 9.79 10 23.5 0 13.711-9.825 23.711-9.825 10-23.587 10h-71.825Zm215.737 0q-13.8 0-23.65-9.789-9.85-9.79-9.85-23.5 0-13.711 9.85-23.711 9.85-10 23.65-10h384q13.8 0 23.65 9.789 9.85 9.79 9.85 23.5 0 13.711-9.85 23.711-9.85 10-23.65 10H396Zm-216-168q-13.8 0-23.65-9.789-9.85-9.79-9.85-23.5 0-13.711 9.85-23.711 9.85-10 23.65-10h432q13.8 0 23.65 9.789 9.85 9.79 9.85 23.5 0 13.711-9.85 23.711-9.85 10-23.65 10H180Zm576 0q-13.8 0-23.65-9.789-9.85-9.79-9.85-23.5 0-13.711 9.85-23.711 9.85-10 23.65-10h24q13.8 0 23.65 9.789 9.85 9.79 9.85 23.5 0 13.711-9.85 23.711-9.85 10-23.65 10h-24Zm-576-168q-13.8 0-23.65-9.789-9.85-9.79-9.85-23.5 0-13.711 9.85-23.711 9.85-10 23.65-10h168q13.8 0 23.65 9.789 9.85 9.79 9.85 23.5 0 13.711-9.85 23.711-9.85 10-23.65 10H180Zm312 0q-13.8 0-23.65-9.789-9.85-9.79-9.85-23.5 0-13.711 9.85-23.711 9.85-10 23.65-10h288q13.8 0 23.65 9.789 9.85 9.79 9.85 23.5 0 13.711-9.85 23.711-9.85 10-23.65 10H492Z"/></svg>`
export const downloadIcon = svg`<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M480-341 296.5-524.5l47-46 103 103V-806h67v338.5l103-103 47 46L480-341ZM268.717-202q-27.655 0-47.186-19.681Q202-241.363 202-269v-69.5h67v69.5h422v-69.5h67v69.5q0 27.637-19.693 47.319Q718.614-202 690.96-202H268.717Z"/></svg>`
export const downloadIcon2 = svg`<svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20"><path d="M445-108q-71.5-7-133.25-38.5t-107.5-81.25q-45.75-49.75-72-114.5T106-480q0-147 98-252.5T445-851v67q-115 14-193.5 99.75T173-480q0 118.5 78.5 204.75T445-175v67Zm35-185.5L293-480l47-47 107 107v-247.5h67V-421l106-106 47 46.5-187 187ZM515-108v-67q44.5-5 83.5-21.5T670-239l48 48q-43 35-93.75 56.5T515-108Zm155-611q-32.5-25.5-71.5-42.75T515-784v-67q58.5 5 109.75 26.5T719-768l-49 49Zm98 478-48-47.5q25.5-33 42.25-72T784-444h68q-5 58.5-27 109.25T768-241Zm16-273q-5-44.5-21.75-83T720-669.5l49-48.5q35 43 56.5 94.25T852-514h-68Z"/></svg>`