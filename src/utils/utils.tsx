import { SearchOutlined } from "@ant-design/icons";
import { Button, Flex, Input, Popover, Space, Spin, TableColumnType, Tag, Typography } from "antd";
import { AnnotationProperty, GrapholEntity, Grapholscape, Iri, Namespace, TypesEnum } from "grapholscape";
import { OntologyEntity } from "src/gen";
import { FormatEnum } from "src/model";
import { SPARQLEndpointConnection } from "src/pages/designer/ApiContext";
import EntityCatalogMetadataPreview from "src/pages/designer/entity-catalog/EntityCatalogMetadataPreview";
import { AdvancedFormProps } from "src/pages/designer/entity-form-props";

export function getBase64(file, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const result = reader.result as string
    let index = result.indexOf('base64,')
    let base64 = result.substring(index + 'base64,'.length)
    callback(base64)
  });
  reader.readAsDataURL(file);
}

export const predicateTypes = {
  c: "class",
  op: "objectProperty",
  dp: "dataProperty",
  i: "individual",
  a: "annotationProperty"
}

export const predicateTypesFromTypesEnum = {
  [TypesEnum.CLASS]: predicateTypes.c,
  [TypesEnum.OBJECT_PROPERTY]: predicateTypes.op,
  [TypesEnum.DATA_PROPERTY]: predicateTypes.dp,
  [TypesEnum.INDIVIDUAL]: predicateTypes.i,
  [TypesEnum.ANNOTATION_PROPERTY]: predicateTypes.a,
}

export function renderEntity(entity: OntologyEntity) {
  return entity.entityPrefixIRI || entity.entityIRI;
}

export function renderAnnotation(iri) {
  return iri.replace('http://www.w3.org/2000/01/rdf-schema#', 'rdfs:').replace('http://www.w3.org/2002/07/owl#', 'owl:')
}
export function getPredicateType(entity) {
  if (entity) {
    switch (entity.entityType) {
      case 'CLASS':
        return predicateTypes.c
      case 'OBJECT_PROPERTY':
        return predicateTypes.op
      case 'DATA_PROPERTY':
        return predicateTypes.dp
      case 'NAMED_INDIVIDUAL':
        return predicateTypes.i
      case 'ANNOTATION_PROPERTY':
        return predicateTypes.a
      default:
        return entity.entityType
    }
  }

}

export function getAnnotationPropertyDisplayName(annotation: AnnotationProperty) {
  if (annotation.remainder !== annotation.fullIri) {
    return annotation.remainder.charAt(0).toUpperCase() + annotation.remainder.slice(1)
  } else {
    return annotation.fullIri
  }
}

export function isGrapholEntity(entity: any): entity is GrapholEntity {
  return entity['getDisplayedName'] !== undefined
}

export const datatypes = ['owl:real', 'owl:rational', 'xsd:decimal', 'xsd:integer',
  'xsd:nonNegativeInteger', 'xsd:nonPositiveInteger',
  'xsd:positiveInteger', 'xsd:negativeInteger', 'xsd:long',
  'xsd:int', 'xsd:short', 'xsd:byte', 'xsd:unsignedLong',
  'xsd:unsignedInt', 'xsd:unsignedShort', 'xsd:unsignedByte',
  'xsd:double', 'xsd:float', 'xsd:string',
  'xsd:normalizedString', 'xsd:token', 'xsd:language', 'xsd:Name',
  'xsd:NCName', 'xsd:NMTOKEN', 'xsd:boolean', 'xsd:hexBinary',
  'xsd:base64Binary',
  'xsd:dateTime', 'xsd:dateTimeStamp', 'rdf:XMLLiteral',
  'rdf:PlainLiteral', 'rdfs:Literal', 'xsd:anyURI']

export const formItemStyle = {
  marginBottom: 4
}

export const dataTypes = {
  plainLiteral: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#PlainLiteral',
  dateTime: 'http://www.w3.org/2001/XMLSchema#dateTime',
  anyURI: 'http://www.w3.org/2001/XMLSchema#anyURI'
}

export const rdfType = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'

export const dateFormatRDF = 'YYYY-MM-DDT00:00:00+00:00'


export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\\\$&').replace("'", "\\'"); // $& means the whole matched string
}

export async function getNamespaces(endpointUrl: string): Promise<Namespace[]> {
  const result: Namespace[] = []
  const response = await fetch(`${endpointUrl}?nsdecl`)
  if (response) {
    const document = new DOMParser().parseFromString(await response.text(), 'text/xml')

    let ns: Namespace | undefined
    let prefix: string | undefined
    let value: string | undefined | null
    document.querySelectorAll('tr').forEach(tableRow => {

      tableRow.querySelectorAll('td').forEach((tableCol, i) => {
        if (i === 0) {
          prefix = tableCol.innerHTML
        }

        if (i === 1) {
          value = tableCol.querySelector('a')?.getAttribute('href')
        }
      })

      if (prefix && value) {
        ns = result.find(v => v.value === value)
        if (!ns) {
          ns = new Namespace([prefix], value)
        } else {
          ns.addPrefix(prefix)
        }

        result.push(ns)
      }
    })
  }

  return result
}

export function getColumnSearchProps(column: string): TableColumnType<any> {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`Search ${column}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: 'block' }}
          autoFocus
        />
        <Space>
          <Button
            onClick={() => {
              clearFilters()
              confirm()
            }}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="primary"
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      return record[column]
        ?.toString()
        .toLowerCase()
        .includes((value as string).toLowerCase())
    },
    sorter: (recordA, recordB) => {
      return recordA[column]?.toString().localeCompare(recordB[column]?.toString()) || -1
    },
  }
}

export function getOntologyExtension(format: FormatEnum) {
  switch (format) {
    case FormatEnum.FUNCTIONAL_SYNTAX: return '.ofn'
    case FormatEnum.RDF_XML: return '.owx'
    case FormatEnum.TURTLE: return '.ttl'
    case FormatEnum.GSCAPE: return '.gscape'
    default: '.owl'
  }
}

export const simpleNameRegex = new RegExp(/^[\s\p{Letter}0-9._~-]+$/u)

/**
 * Refactor entities' namespaces upon namespace edit.
 * - entity had a namespace whose value has been changed
 * - entity IRI has an unknown namespace but it starts 
 *   with the new namespace => assign it
 * @param grapholscape 
 * @param oldNamespace 
 * @param newNamespace 
 */
export function refactorEntitiesNamespace(grapholscape: Grapholscape, oldNamespace: Namespace, newNamespace?: Namespace) {
  // create an array from the map cause changing the map in place would otherwise
  // generate infinite loop if we iterate over the map entries.
  Array.from(grapholscape.ontology.entities.values()).forEach(entity => {
    if (
      (newNamespace && !grapholscape.ontology.getNamespace(entity.iri.namespace.value) && entity.iri.fullIri.startsWith(newNamespace.value))
      || entity.iri.namespace.value === oldNamespace.value) {
      grapholscape.ontology.entities.delete(entity.iri.fullIri)
      entity.iri = new Iri(newNamespace + entity.iri.remainder, [newNamespace])
      entity.occurrences.get(grapholscape.renderState)?.forEach(occ => {
        occ.iri = entity.iri.fullIri
        occ.displayedName = entity.getDisplayedName(grapholscape.entityNameType, grapholscape.language)
        grapholscape.ontology.getDiagram(occ.diagramId)
          ?.representations
          .get(grapholscape.renderState)
          ?.updateElement(occ, entity, false)
      })
      grapholscape.ontology.addEntity(entity)
    }
  })
}

export const getEntityInput = (advancedValues: AdvancedFormProps, opts: {
  onPrefixClick?: () => void,
  onSuffixClick?: () => void,
  selectedEntity?: {
    value: GrapholEntity
    source: 'ontology' | 'catalog'
  }
}) => {

  const selectedEntity = opts.selectedEntity?.value
  const prefix = selectedEntity
    ? selectedEntity.iri.namespace?.prefixes[0] !== undefined
      ? selectedEntity.iri.namespace?.prefixes[0]
      : selectedEntity.iri.namespaceValue
    : advancedValues.namespaceList.find(ns => ns.value === advancedValues.namespace)?.prefixes[0]

  return <Input
    placeholder="Name"
    style={{ minWidth: 100 }}
    width='fit-content'
    prefix={<Popover
      content={`Namespace: ${selectedEntity
        ? selectedEntity.iri.namespaceValue
        : advancedValues.namespace}`}
    >
      <Typography.Text type='secondary' onClick={opts.onPrefixClick}>
        <Tag style={{ textOverflow: 'ellipsis', maxWidth: 200, overflow: 'clip', direction: 'rtl', margin: '0 8px 0 0' }}>
          :{prefix !== undefined ? prefix : advancedValues.namespace}
        </Tag>
      </Typography.Text>
    </Popover>}
    suffix={<>
      {selectedEntity &&
        <Popover content={opts.selectedEntity.source === 'ontology'
          ? 'Reusing entity from ontology - Advanced settings won\'t be applied'
          : 'Importing entity from catalog - Advanced settings won\'t be applied'}>
          <Tag color='blue'>From {opts.selectedEntity?.source}</Tag>
        </Popover>}
      <Popover content="Language of the label.">
        <Typography.Text type='secondary' onClick={opts.onSuffixClick}>{advancedValues.language}</Typography.Text>
      </Popover>
    </>}
  />
}

export const getAutoCompleteFormOptions = (params: {
  entities: GrapholEntity[],
  remoteEntities: GrapholEntity[]
  loadingRemoteEntities: boolean,
  grapholscape: Grapholscape,
  sparqlEndpointConnection: SPARQLEndpointConnection,
}) => {
  const { entities, grapholscape, sparqlEndpointConnection, loadingRemoteEntities, remoteEntities } = params
  return [
    {
      label: 'Ontology Entities',
      options: entities.map(e => ({
        key: e.iri.fullIri,
        value: e.iri.remainder,
        label: e.getDisplayedName(grapholscape.entityNameType, grapholscape.language),
        entity: e,
      }))
    },
    {
      label: <Flex align="center" gap={4} justify='space-between'>
        <>
          Entity Catalog
          ({sparqlEndpointConnection
            ? sparqlEndpointConnection.endpointUrl
            : "Connect to a SPARQL endpoint to see suggestions from the remote ontology."})
        </>
        {loadingRemoteEntities && <Spin size='small' />}
      </Flex>,
      options: remoteEntities.map((e, i) => ({
        key: `remote-${i}`,
        value: e.iri.remainder,
        label: <Popover placement="left" content={<EntityCatalogMetadataPreview entity={e} language={grapholscape.language} />} >
          {e.getDisplayedName(grapholscape.entityNameType, grapholscape.language)}
          <Tag style={{ marginLeft: 8 }} color="blue">Catalog</Tag>
        </Popover>,
        entity: e,
      }))
    }
  ]
}

export const downloadTextFile = (text: string, fileName: string) => {
  const downloadUrl = window.URL.createObjectURL(new Blob([text]));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl)
}