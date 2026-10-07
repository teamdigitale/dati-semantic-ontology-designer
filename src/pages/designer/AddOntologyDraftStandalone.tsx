import { DownloadOutlined } from '@ant-design/icons';
import {
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  Popover,
  Tag,
  Typography
} from 'antd';
import { DefaultAnnotationProperties, DefaultNamespaces, EntityNameType, Language } from 'grapholscape';
import { useEffect, useRef, useState } from 'react';
import { GrapholscapeDesigner } from 'src/builder';
import { RDFGraph, RDFGraphModelTypeEnum } from 'src/gen';
import { ConvertApi, message, MetadataApi } from 'src/store/store';
import { ApiContext } from './ApiContext';
import RDFGraphImporter from './RDFGraphImporter';
import removeDiagramsFromRDFGraph from './RemoveDiagramsFromRDFGraph';
import OntologyMetadataForm from './settings/metadata/OntologyMetadataForm';
import { ToolbarContext } from './ToolbarContext';
import { downloadTextFile } from 'src/utils/utils';
import { FormatEnum } from 'src/model';

var rdfGraph: RDFGraph | undefined
let grapholscape: GrapholscapeDesigner | undefined

function AddOntologyDraft(props: {
  open: (rdfGraph: RDFGraph) => void,
}) {
  const [form] = Form.useForm()
  const iriInputRef = useRef<any>(null)
  const [versionIriTouched, setVersionIriTouched] = useState(false)
  const [endpointURL, setEndpointURL] = useState('https://schema.gov.it/sparql')
  const [editMetadata, setEditMetadata] = useState(false)
  const [importedFile, setImportedFile] = useState<File | undefined>(undefined)

  let endpointInputTimeout: NodeJS.Timeout | undefined = undefined

  useEffect(() => {
    // Focus on the IRI input after component mounts
    setTimeout(() => {
      iriInputRef.current?.focus()
    }, 0)
  }, [])

  const submit = async (mode: 'design' | 'metadata') => {
    const values = await form.validateFields()
    if (!rdfGraph) {
      rdfGraph = {
        diagrams: [{
          id: 0,
          name: "Ontology",
          nodes: [],
          edges: []
        }],
        metadata: {
          namespaces: [{
            prefixes: ['onto'],
            value: 'https://w3id.org/italia/onto/'
          }],
          annotationProperties: [],
          languages: [],
        },
        entities: [],
        modelType: RDFGraphModelTypeEnum.ONTOLOGY
      }
    }

    rdfGraph.metadata.iri = values.iri
    rdfGraph.metadata.version = values.versionIri

    // rdfGraph.metadata.name = rdfGraph.metadata.name ?? values.name
    if (!rdfGraph.metadata.namespaces.find(ns => ns.value === values.iri)) {
      rdfGraph.metadata.namespaces.push({ prefixes: [''], value: values.iri }) // default namespace: empty prefix and ontology iri
    }

    Object.values(DefaultNamespaces).forEach(defaultNamespace => {
      if (defaultNamespace !== DefaultNamespaces.OBDA && !rdfGraph.metadata.namespaces.find(ns => ns.value === defaultNamespace.value)) {
        rdfGraph.metadata.namespaces.push({ prefixes: [...defaultNamespace.prefixes], value: defaultNamespace.value })
      }
    })

    rdfGraph.metadata.annotationProperties = Array.from(
      new Set([...(rdfGraph.metadata.annotationProperties || []), ...Object.values(DefaultAnnotationProperties).map(a => a.fullIri)])
    )
    rdfGraph.metadata.languages = Array.from(new Set([...(rdfGraph.metadata.languages || []), ...Object.values(Language)]))
    rdfGraph.metadata.defaultLanguage = rdfGraph.metadata.defaultLanguage || Language.EN

    rdfGraph.config = {
      ...(rdfGraph.config || {}),
      entityNameType: rdfGraph.config?.entityNameType || EntityNameType.LABEL,
      selectedTheme: rdfGraph.config?.selectedTheme || 'grapholscape',
      language: rdfGraph.config?.language || 'it',
    }

    rdfGraph.selectedDiagramId = rdfGraph.selectedDiagramId || rdfGraph.diagrams[0].id
    rdfGraph.creator = ''

    const diagramsToImport = form.getFieldValue('diagrams')
    if (diagramsToImport) {
      rdfGraph = removeDiagramsFromRDFGraph(rdfGraph, diagramsToImport)
    }

    if (mode === 'metadata') {
      grapholscape = new GrapholscapeDesigner(rdfGraph, document.createElement('div'))
      setEditMetadata(true)
    }

    if (mode === 'design') {
      props.open(rdfGraph)
    }
  }

  const iri = "https://w3id.org/italia/onto/example/"
  return <Form
    form={form}
    layout="vertical"
    // onFinish={(values) => submit(values, mode)}
    initialValues={{ iri, versionIri: iri + '1.0' }}>
    <Form.Item
      label="Ontology IRI"
      name='iri'
      hasFeedback
      rules={[
        { required: true, message: 'Please enter ontology IRI' },
        { type: 'url' },
        { pattern: /^.*[/#]$/, message: `It's preferable to use a separator ("/" or "#") to end the ontology IRI`, warningOnly: true },
      ]}>
      <Input ref={iriInputRef} placeholder="Please enter ontology name" autoComplete='off' onChange={(evt) => {
        if (!versionIriTouched) {
          form.validateFields()
            .then(() => form.setFieldValue('versionIri', evt.target.value + '1.0'))
            .catch(() => form.setFieldValue('versionIri', iri + '1.0'))
        }
      }} />
    </Form.Item>
    <Form.Item
      label="Ontology Version IRI"
      name='versionIri'
      hasFeedback
      rules={[
        { required: true, message: 'Please enter Ontology Version IRI' },
        { type: 'url' },
      ]}>
      <Input
        suffix={!versionIriTouched && <Typography.Text type='secondary'>auto</Typography.Text>}
        placeholder="Please enter ontology name"
        autoComplete='off'
        onChange={() => !versionIriTouched && setVersionIriTouched(true)}
      />
    </Form.Item>
    <ApiContext.Provider value={{
      convertOWLToRDFGraph: (owlFile) => ConvertApi.postOntologyDraftAIConvertOWL({ file: owlFile }),
      getRejectedAxiomsOntology: (file, format) => ConvertApi.getOntologyDraftAIDownloadRejectedAxioms({ file, format }),
      sparqlEndpointConnection: { endpointUrl: endpointURL }
    }}>
      {!editMetadata && <RDFGraphImporter
        onRDFGraphReady={function (_rdfGraph?: RDFGraph, _importedFile?: File): void {
          rdfGraph = _rdfGraph;
          setImportedFile(_importedFile)
          form.setFieldsValue({
            iri: rdfGraph?.metadata.iri || iri,
            versionIri: rdfGraph?.metadata.version || iri + '1.0'
          })
        }}
      />}
      <ToolbarContext.Provider value={{
        grapholscape: grapholscape as GrapholscapeDesigner,
        remoteCatalogEntities: [],
        setRemoteCatalogEntities: () => { },
        designerAssistantSettings: {
          iriStyle: true,
          simpleNameLanguage: 'it',
        },
        setDesignerAssistantSettings: () => { }
      }}>
        <Drawer
          title="Edit Ontology Metadata"
          width={'60vw'}
          open={editMetadata}
          maskClosable={false}
          onClose={() => {
            rdfGraph = undefined
            setImportedFile(undefined)
            form.setFieldsValue({
              iri: iri,
              versionIri: iri + '1.0'
            })
            setEditMetadata(false)
          }}
          extra={
            <Input prefix={<Tag>SPARQL Endpoint:</Tag>} style={{ minWidth: 350 }} defaultValue={endpointURL} onChange={(e) => {
              if (endpointInputTimeout) {
                clearTimeout(endpointInputTimeout)
              }
              endpointInputTimeout = setTimeout(() => {
                setEndpointURL(e.target.value)
                message.info('SPARQL endpoint URL updated.')
              }, 500)
            }} />}>


          <OntologyMetadataForm
            disabled={false}
            importedFile={importedFile}
            standalone
            saveButtonText='Ontology With Metadata'
            saveButtonProps={{ icon: <DownloadOutlined /> }}
          />
        </Drawer>
      </ToolbarContext.Provider>
    </ApiContext.Provider>

    <Flex justify="center" gap={16} align="center" style={{ marginTop: 32 }}>
      <Popover content="Import an ontology to edit metadata.">
        <Button onClick={() => submit('metadata')} disabled={!importedFile}>
          Edit Metadata
        </Button>
      </Popover>
      <Button type="primary" onClick={() => submit('design')}>
        Start Editing
      </Button>
    </Flex>
  </Form>
}

export default AddOntologyDraft;