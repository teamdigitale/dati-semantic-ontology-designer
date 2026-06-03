import {
  Button,
  Form,
  Input,
  Typography
} from 'antd';
import { DefaultAnnotationProperties, DefaultNamespaces, EntityNameType, Language } from 'grapholscape';
import { useEffect, useRef, useState } from 'react';
import { RDFGraph, RDFGraphModelTypeEnum } from 'src/gen';
import { ConvertApi } from 'src/store/store';
import { ApiContext } from './ApiContext';
import RDFGraphImporter from './RDFGraphImporter';
import removeDiagramsFromRDFGraph from './RemoveDiagramsFromRDFGraph';

var rdfGraph: RDFGraph | undefined

function AddOntologyDraft(props: {
  open: Function
}) {
  const [form] = Form.useForm()
  const iriInputRef = useRef<any>(null)
  const [versionIriTouched, setVersionIriTouched] = useState(false)

  useEffect(() => {
    // Focus on the IRI input after component mounts
    setTimeout(() => {
      iriInputRef.current?.focus()
    }, 0)
  }, [])

  const submit = async (values) => {
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

    props.open(rdfGraph)
  }

  const iri = "https://w3id.org/italia/onto/example/"
  return <Form
    form={form}
    layout="vertical"
    onFinish={submit}
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
      convertOWLToRDFGraph: (owlFile) => ConvertApi.postOntologyDraftAIConvertOWL({ file: owlFile })
    }}>
      <RDFGraphImporter
        onRDFGraphReady={function (_rdfGraph?: RDFGraph): void {
          rdfGraph = _rdfGraph;
          form.setFieldsValue({ iri: rdfGraph?.metadata.iri || '', versionIri: rdfGraph?.metadata.version || '' })
        }}
      />
    </ApiContext.Provider>
    <Form.Item style={{ textAlign: 'center', marginTop: 48 }}>
      <Button htmlType='submit' type="primary">
        Ok
      </Button>
    </Form.Item>
  </Form>
}

export default AddOntologyDraft;