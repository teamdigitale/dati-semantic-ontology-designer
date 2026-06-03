import { TypesEnum, GrapholEntity, Iri, Annotation, DefaultAnnotationProperties, AnnotationProperty } from "grapholscape"
import { ParsingClient } from "sparql-http-client"
import { showError } from "src/store/store"
import { escapeRegExp } from "src/utils/utils"
import { SPARQLEndpointConnection } from "../ApiContext"
import DesignerCore from "src/builder/core"

const entityTypesByIris = {
  'http://www.w3.org/2002/07/owl#Class': TypesEnum.CLASS,
  'http://www.w3.org/2002/07/owl#ObjectProperty': TypesEnum.OBJECT_PROPERTY,
  'http://www.w3.org/2002/07/owl#DatatypeProperty': TypesEnum.DATA_PROPERTY,
  'http://www.w3.org/2002/07/owl#NamedIndividual': TypesEnum.INDIVIDUAL,
}

export const ontologyLabelAnnProp = new AnnotationProperty('OntologyLabel', [])

export default class EntityCatalogQueryManager {

  private entityTypes = [
    TypesEnum.CLASS,
    TypesEnum.OBJECT_PROPERTY,
    TypesEnum.DATA_PROPERTY,
    TypesEnum.INDIVIDUAL
  ]

  private _limit?: number = 1000
  get limit() {
    return this._limit
  }
  set limit(newLimit: number | undefined) {
    if (newLimit !== undefined && newLimit > 0) {
      this._limit = newLimit
    }

    if (newLimit === undefined) {
      this._limit = undefined
    }
  }

  constructor(
    private sparqlEndpointConnection: SPARQLEndpointConnection,
    private grapholscape: DesignerCore,
  ) { }

  getClasses(): Promise<GrapholEntity[]> {
    return this.fetchEntityCatalog({
      entityTypesFilter: [TypesEnum.CLASS]
    })
  }

  getDataProperties(): Promise<GrapholEntity[]> {
    return this.fetchEntityCatalog({
      entityTypesFilter: [TypesEnum.DATA_PROPERTY]
    })
  }

  getObjectProperties(): Promise<GrapholEntity[]> {
    return this.fetchEntityCatalog({
      entityTypesFilter: [TypesEnum.OBJECT_PROPERTY]
    })
  }

  getIndividuals(): Promise<GrapholEntity[]> {
    return this.fetchEntityCatalog({
      entityTypesFilter: [TypesEnum.INDIVIDUAL]
    })
  }

  fetchEntityCatalog(fetchParams: {
    entityTypesFilter: TypesEnum[],
    searchValue?: string,
    searchMode?: 'label' | 'comment' | 'ontology',
  }): Promise<GrapholEntity[]> {

    const { entityTypesFilter: checkedEntityTypes, searchValue, searchMode } = fetchParams
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        showError('Request Timeout Reached')
        // setLoading(false)
        reject()
      }, 30000)
      let types = 'FILTER(';
      (checkedEntityTypes.length > 0 ? checkedEntityTypes : this.entityTypes)
        .forEach((checkedEntityType, index) => {
          if (index !== 0 && index !== checkedEntityType.length) {
            types += ' || '
          }
          if (checkedEntityType === TypesEnum.CLASS) {
            types += '?type = owl:Class'
          }
          if (checkedEntityType === TypesEnum.OBJECT_PROPERTY) {
            types += '?type = owl:ObjectProperty'
          }
          if (checkedEntityType === TypesEnum.DATA_PROPERTY) {
            types += '?type = owl:DatatypeProperty'
          }
          if (checkedEntityType === TypesEnum.INDIVIDUAL) {
            types += '?type = owl:NamedIndividual'
          }

        })
      types += ')'

      let regex = ''
      if (searchValue) {
        switch (searchMode) {
          case 'comment':
            regex = `FILTER(regex(str(?comment), '${escapeRegExp(searchValue)}', 'i')`
            break
          case 'ontology':
            regex = `FILTER(regex(str(?ontology), '${escapeRegExp(searchValue)}', 'i') || regex(?ontologyLabel, '${escapeRegExp(searchValue)}', 'i'))`
            break
          default:
            regex = `FILTER(regex(str(?x), '${escapeRegExp(searchValue)}', 'i') || regex(?label, '${escapeRegExp(searchValue)}', 'i'))`
            break
        }
      }

      // Function to fetch entity catalog from the SPARQL endpoint
      const parsingClient = new ParsingClient(this.sparqlEndpointConnection)
      parsingClient.query.select(`
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT DISTINCT ?x ?type ?label ?comment ?ontology ?ontologyLabel {
          ?x a ?type.
          OPTIONAL {
            ?x rdfs:label ?label.
            FILTER(lang(?label)='${this.grapholscape.language}')
          }
          OPTIONAL {
            ?x rdfs:comment ?comment.
            FILTER(lang(?comment)='${this.grapholscape.language}')
          }
          OPTIONAL {
            ?x rdfs:isDefinedBy ?ontology.
            OPTIONAL {
              ?ontology rdfs:label ?ontologyLabel.
              FILTER(lang(?ontologyLabel)='${this.grapholscape.language}')
            }
          }
          ${types}
          ${regex}
          FILTER(!ISBLANK(?x))
        }
        ${this.limit !== undefined ? `LIMIT ${this.limit}` : ''}
      `).then((bindings) => {
        const entityMap = new Map<string, GrapholEntity>()
        let grapholEntity: GrapholEntity
        for (const binding of bindings) {
          if (!binding['x']?.value) {
            return
          }
          grapholEntity = entityMap.get(binding['x'].value) || new GrapholEntity(new Iri(binding['x'].value, this.grapholscape.ontology.namespaces))
          if (!entityMap.has(binding['x'].value)) {
            entityMap.set(binding['x'].value, grapholEntity)
          }
          const label = binding['label']
          if (label?.value && label.termType === "Literal") {
            grapholEntity.addAnnotation(new Annotation(DefaultAnnotationProperties.label, label.value, label.language))
          }

          const comment = binding['comment']
          if (comment?.value && comment.termType === "Literal") {
            grapholEntity.addAnnotation(new Annotation(DefaultAnnotationProperties.comment, comment.value, comment.language))
          }

          if (binding['ontology']?.value) {
            grapholEntity.addAnnotation(new Annotation(DefaultAnnotationProperties.isDefinedBy, binding['ontology'].value))
          }

          if (binding['ontologyLabel']?.value) {
            grapholEntity.addAnnotation(new Annotation(ontologyLabelAnnProp, binding['ontologyLabel'].value))
          }

          grapholEntity.manualTypes = new Set([entityTypesByIris[binding['type'].value]])
        }
        resolve(Array.from(entityMap.values()).sort((a, b) => {
          const aLabel = a.getDisplayedName(this.grapholscape.entityNameType, this.grapholscape.language)
          const bLabel = b.getDisplayedName(this.grapholscape.entityNameType, this.grapholscape.language)
          return aLabel.localeCompare(bLabel)
        }))
      }).catch((error) => {
        showError('Error fetching entity catalog. ' + error.message)
        console.error('Error fetching entity catalog:', error)
        reject()
      }).finally(() => {
        clearTimeout(timeout)
        // setLoading(false)
      })
    })
  }
}