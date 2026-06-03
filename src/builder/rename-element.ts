import { GrapholElement, GrapholEntity, Grapholscape, RendererStatesEnum } from "grapholscape"

export function renameElement(elem: GrapholElement, entity: GrapholEntity | undefined, grapholscape: Grapholscape) {

        const diagramRepresentation = grapholscape.ontology.getDiagram(elem.diagramId)?.representations.get(RendererStatesEnum.FLOATY)
        const cyElem = diagramRepresentation?.cy.$id(elem.id)
        if (!entity) return
        elem.displayedName = entity.getDisplayedName(grapholscape.entityNameType)
        diagramRepresentation?.updateElement(elem, entity, false)
        // updateElement non cambia la iri
        elem.iri = entity.iri.fullIri
        cyElem?.data('iri', entity.iri.fullIri)
}