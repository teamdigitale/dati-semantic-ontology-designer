import { DeleteOutlined, DownloadOutlined, EditOutlined, ImportOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons"
import { Button, Flex, Form, Input, Modal, Popconfirm, Popover, Switch, Table, Tabs, Upload } from "antd"
import { ColumnsType } from "antd/es/table"
import { AnnotatedElement, Annotation, DefaultAnnotationProperties, DefaultNamespaces, Iri, Namespace } from "grapholscape"
import { useContext, useEffect, useRef, useState } from "react"
import AnnotationsDownloadForm from "src/pages/designer/assertions/AnnotationsDownloadForm"
import AnnotationsImporter from "src/pages/designer/assertions/AnnotationsImporter"
import { message } from "src/store/store"
import AnnotationTable from "../annotations/AnnotationsTable"
import CreateAnnotationPropertyModal from "../annotations/CreateAnnotationPropertyModal"
import EditAnnotationPropertyModal from "../annotations/EditAnnotationPropertyModal"
import { FormContext } from "../FormContext"
import CreateNamespaceModal from "../namespaces/CreateNamespaceModal"
import EditNamespaceModal from "../namespaces/EditNamespaceModal"
import { ToolbarContext } from "../ToolbarContext"
import { getColumnSearchProps, getNamespaces } from "src/utils/utils"
import { ApiContext } from "../ApiContext"

export type AnnotationRecord = {
  subject?: string,
  property: string,
  language: string,
  value: string,
  annotatedElement: AnnotatedElement,
  annotation: Annotation,
  key: string,
}

export type IriRecord = {
  property: string,
  prefix: string,
  iri: Iri,
  key: string,
}

export type NamespaceRecord = {
  namespace: Namespace,
  prefix: string,
  value: string,
  key: string,
}

export default function OntologyManager() {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, setAdvancedValues } = useContext(FormContext)
  const sparqlEndpointURL = useContext(ApiContext).sparqlEndpointConnection?.endpointUrl

  const ontologyIriFormRef = useRef(null)

  const [forceEntityAnnotationsUpdate, setForceEntityAnnotationsUpdate] = useState(false)
  // ANNOTATION PROPERTIES
  const [annotationPropertiesData, setAnnotationPropertiesData] = useState<IriRecord[]>([])
  const [annotationPropertyRecordToEdit, setAnnotationPropertyRecordToEdit] = useState<IriRecord | undefined>()
  const [createAnnotationProperty, setCreateAnnotationProperty] = useState(false)
  // NAMESPACES
  const [namespacesData, setNamespacesData] = useState<NamespaceRecord[]>([])
  const [namespaceRecordToEdit, setNamespaceRecordToEdit] = useState<NamespaceRecord | undefined>()
  const [createNamespace, setCreateNamespace] = useState(false)
  const [importNamespaceLoading, setImportNamespaceLoading] = useState(false)

  const [downloadAnnotations, setDownloadAnnotations] = useState(false)

  useEffect(() => {
    updateData()
  }, [setAnnotationPropertiesData, setNamespacesData])

  const updateData = () => {
    setAnnotationPropertiesData(
      grapholscape.ontology.getAnnotationProperties()
        .map((property, i) => getIriRecord(property, i.toString()))
    )
    updateNamespaces()
  }

  const updateNamespaces = () => {
    setNamespacesData(
      grapholscape.ontology.getNamespaces().flatMap((namespace, i) => (
        namespace.prefixes.map((prefix, j) => ({ ...getNamespaceRecord(namespace, prefix, `${i.toString()}-${j.toString()}`) }))
      ))
    )
  }

  const updateAssertions = () => {
    /**
     * HACKY:
     * Setting the value to true will remove the component with
     * the list of assertions from the DOM.
     * Setting the value to false will add it back and create a new
     * one taking fresh values for the annotations.
     */
    setForceEntityAnnotationsUpdate(true)
    setTimeout(() => setForceEntityAnnotationsUpdate(false), 100)
  }

  const annotationPropertiesColumns: ColumnsType<IriRecord> = [
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      width: 300,
      render: (text, record) => <Popover content={record.iri.fullIri}>{text}</Popover>,
      ...getColumnSearchProps('property'),
    },
    {
      title: '',
      key: 'key',
      width: 90,
      dataIndex: 'key',
      render: (_, record, i) => getEditDeleteButtons(
        () => setAnnotationPropertyRecordToEdit(record), // onEdit
        () => deleteAnnotationProperty(record, i) // onDelete
      ),
    }
  ]

  const namespacesColumns: ColumnsType<NamespaceRecord> = [
    {
      title: 'Prefix',
      dataIndex: 'prefix',
      key: 'prefix',
      width: 120,
      render: text => text,
      ...getColumnSearchProps('prefix')
    }, {
      title: 'Namespace',
      dataIndex: 'value',
      width: 300,
      key: 'namespace',
      render: text => text,
      ...getColumnSearchProps('value')
    },
    {
      title: '',
      key: 'key',
      width: 90,
      dataIndex: 'key',
      render: (_, record, i) => {
        const isDefaultNamespace =
          Object.values(DefaultNamespaces).map(n => n.value).includes(record.value)
          || grapholscape.ontology.iri === record.value

        if (!isDefaultNamespace) {
          return getEditDeleteButtons(
            () => setNamespaceRecordToEdit(record), // onEdit
            () => deleteNamespace(record, i), // onDelete
          )
        }
      },
    }
  ]


  /**
   * Removes an annotation property from the ontology
   * @param record 
   * @param recordIndex 
   */
  const deleteAnnotationProperty = (record: IriRecord, recordIndex: number) => {
    grapholscape.ontology.annProperties = grapholscape.ontology.annProperties.filter(p => !p.equals(record.iri))
    annotationPropertiesData.splice(recordIndex, 1)
    setAnnotationPropertiesData([...annotationPropertiesData])
  }

  /**
   * Removes a namespace from the ontology
   * @param record 
   * @param recordIndex 
   */
  const deleteNamespace = (record: NamespaceRecord, recordIndex: number) => {
    record.namespace.prefixes = record.namespace.prefixes.filter(p => p !== record.prefix)
    if (record.namespace.prefixes.length === 0) {
      grapholscape.ontology.namespaces = grapholscape.ontology.namespaces.filter(n => n.value !== record.namespace.value)
    }
    namespacesData.splice(recordIndex, 1)
    setNamespacesData([...namespacesData])
  }

  const editOntologyIRI = () => {
    if (ontologyIriFormRef.current) {
      const iri = ontologyIriFormRef.current.getFieldValue('Ontology IRI') ?? grapholscape.ontology.iri;
      const versionIri = ontologyIriFormRef.current.getFieldValue('Ontology Version IRI') ?? grapholscape.ontology.version;
      const oldIri = grapholscape.ontology.iri;
      grapholscape.ontology.iri = iri;
      grapholscape.ontology.version = versionIri;
      const refactorIris = ontologyIriFormRef.current.getFieldValue('refactorIris') ?? true;
      editOntologyNamespace(oldIri, iri);
      if (refactorIris) {
        refactorEntitiesIris(oldIri, iri);
      }
      message.success(`Ontology IRI updated successfully`);
    }
  }

  const editOntologyNamespace = (oldIri: string, iri: string) => {
    const namespace = grapholscape.ontology.getNamespace(oldIri)
    const prefixes = namespace.prefixes
    // Remove old namespace if exists
    if (namespace) {
      grapholscape.ontology.namespaces = grapholscape.ontology.namespaces.filter(n => n.value !== namespace.value)
    }
    // Add new namespace
    const newNamespace = new Namespace(prefixes, iri)
    grapholscape.ontology.addNamespace(newNamespace)
    updateNamespaces()
    // if the old namespace was being used as default namespace for new entities, 
    // update it. Otherwise keep the currently used one.
    const selectedDefaultNamespace = advancedValues.namespace === oldIri ? iri : advancedValues.namespace
    setAdvancedValues({
      ...advancedValues,
      namespace: selectedDefaultNamespace,
      namespaceList: grapholscape.ontology.namespaces
    })
  }

  const refactorEntitiesIris = (oldIri: string, iri: string) => {
    const newNamespace = grapholscape.ontology.getNamespace(iri)
    grapholscape.ontology.entities.forEach(e => {
      if (e.iri.namespace.value === oldIri) {
        const newIri = new Iri(iri + e.iri.remainder, [newNamespace], e.iri.remainder)
        e.iri = newIri
      }
    })
  }

  const getAddButton = (onClick: () => void) => {
    return <Button
      key="add"
      onClick={onClick}
      icon={<PlusOutlined />}
      type="primary"
      style={{ marginTop: '24px', float: "right" }}>
      Add
    </Button>
  }

  const onFileSelection = (file) => {
    const selectedFile = file
    const format = file.name.endsWith('.csv') ? 'csv' : 'excel'
    const updateFunc = () => {
      updateAssertions()
      message.success(`${file.name} file uploaded successfully`);
    }
    const importer = new AnnotationsImporter(grapholscape.ontology, updateFunc)
    if (format === 'csv') {
      Array.from(grapholscape.ontology.entities).at(0)[1].addAnnotation(new Annotation(DefaultAnnotationProperties.label, 'ciao'))
      updateFunc()
      // importer.importAnnotationsDataCsv(selectedFile)
    } else {
      importer.importAnnotationsDataXlsx(selectedFile)
    }
    return false
  }

  return <div>
    <Tabs items={[
      {
        label: 'Ontology IRI',
        key: 'OntologyIRI',
        children: <>
          <Form
            ref={ontologyIriFormRef}
            layout="horizontal"
            labelCol={{ span: 6 }}
          >
            <Form.Item label="Ontology IRI" name="Ontology IRI" initialValue={grapholscape.ontology.iri}>
              <Input />
            </Form.Item>
            <Form.Item label="Ontology Version IRI" name="Ontology Version IRI" initialValue={grapholscape.ontology.version}>
              <Input />
            </Form.Item>
            <Form.Item label="Refactor IRIs" name="refactorIris">
              <Popover content="If enabled, all entities IRIs equal to the ontology IRI will be changed as well">
                <Switch defaultChecked />
              </Popover>
            </Form.Item>
          </Form>
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={editOntologyIRI}
            style={{ float: "right" }}>
            Save
          </Button>
        </>
      },
      {
        label: 'Ontology Annotations',
        key: 'Annotations',
        children: <AnnotationTable annotatedElement={grapholscape.ontology} />
      },
      {
        label: 'Annotation Properties',
        key: 'Properties',
        children: <>
          <Table size='small'
            virtual
            columns={annotationPropertiesColumns}
            dataSource={annotationPropertiesData}
            pagination={false}
            scroll={{ y: '100%', x: '100%' }}
          />
          {getAddButton(() => setCreateAnnotationProperty(true))}
        </>
      },
      {
        label: 'Namespaces',
        key: 'Namespaces',
        children: <>
          <Table size='small'
            virtual
            columns={namespacesColumns}
            dataSource={namespacesData}
            pagination={false}
            scroll={{ y: '100%', x: '100%' }}
          />
          <Flex justify="end" align="center" gap={8}>
            <Popover content={sparqlEndpointURL ? `Import from SPARQL Endpoint: ${sparqlEndpointURL}` : `No Entity Catalog URL Available`}>
              <Button
                disabled={!sparqlEndpointURL}
                loading={importNamespaceLoading}
                onClick={() => {
                  setImportNamespaceLoading(true)
                  getNamespaces(sparqlEndpointURL).then((namespaces) => {
                    namespaces.forEach(n => grapholscape.ontology.addNamespace(n))
                  }).finally(() => {
                    setImportNamespaceLoading(false)
                    updateNamespaces()
                  })
                }}
                style={{ marginTop: '24px' }}
                icon={<ImportOutlined />}
              >Import</Button>
            </Popover>
            {getAddButton(() => setCreateNamespace(true))}
          </Flex>
        </>
      },
      {
        label: 'Entity Annotations',
        key: 'Assertions',
        children: <>
          {forceEntityAnnotationsUpdate
            ? <Table loading={true} />
            : <AnnotationTable />
          }
          <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'end' }}>
            <Button
              key="download"
              onClick={() => setDownloadAnnotations(true)}
              icon={<DownloadOutlined />}>
              Download
            </Button>
            <Upload
              beforeUpload={(info) => onFileSelection(info)}
              accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" showUploadList={false}>
              <Button
                key="import-assertions"
                icon={<PlusOutlined />}
                type="primary">
                Import Annotations
              </Button>
            </Upload>
          </ div>
        </>
      }
    ]} />

    {annotationPropertyRecordToEdit && <EditAnnotationPropertyModal
      propertyToEdit={annotationPropertyRecordToEdit.iri}
      onDone={(newAnnotationProperty) => {
        if (newAnnotationProperty) {
          // update table record
          const newRecord = getIriRecord(newAnnotationProperty, '') // temp object, doesn't need a key
          annotationPropertyRecordToEdit.iri = newRecord.iri
          annotationPropertyRecordToEdit.property = newRecord.property
          annotationPropertyRecordToEdit.prefix = newRecord.prefix
        }

        setAnnotationPropertyRecordToEdit(undefined) // close modal
      }}
    />}
    {createAnnotationProperty && <CreateAnnotationPropertyModal
      onDone={(newAnnotationProperties) => {
        if (newAnnotationProperties) {
          // update table
          setAnnotationPropertiesData([
            ...annotationPropertiesData,
            ...newAnnotationProperties.map((annotationProperty, i) => getIriRecord(annotationProperty, i.toString()))
          ])
        }

        setCreateAnnotationProperty(false) // close modal
      }}
    />}

    {createNamespace && <CreateNamespaceModal
      onDone={(newNamespaces) => {
        if (newNamespaces) {
          // update table
          setNamespacesData([
            ...namespacesData,
            ...newNamespaces.flatMap((namespace, i) => (
              namespace.prefixes.map((prefix, j) => getNamespaceRecord(namespace, prefix, `${i.toString()}-${j.toString()}`))
            )),
          ])
        }
        setCreateNamespace(false) // close modal
      }}
    />}

    {namespaceRecordToEdit && <EditNamespaceModal
      namespaceToEdit={namespaceRecordToEdit.namespace}
      prefixToEdit={namespaceRecordToEdit.prefix}
      onDone={(newNamespace, newPrefix) => {
        if (newNamespace) {
          // update table
          const newRecord = getNamespaceRecord(newNamespace, newPrefix, '') // temp object, doesn't need a key
          namespaceRecordToEdit.namespace = newNamespace
          namespaceRecordToEdit.prefix = newRecord.prefix
          namespaceRecordToEdit.value = newRecord.value
        }
        setNamespaceRecordToEdit(undefined) // close modal
      }}
    />}

    {downloadAnnotations && <Modal
      open={downloadAnnotations}
      title="Download Entities Annotations"
      onCancel={() => setDownloadAnnotations(false)}
      footer={null}>
      <AnnotationsDownloadForm onCancel={() => setDownloadAnnotations(false)} />
    </Modal>}
  </div>
}

function getIriRecord(property: Iri, key: string): IriRecord {
  return {
    iri: property,
    property: property.prefixed,
    prefix: property.prefix,
    key,
  }
}

function getNamespaceRecord(namespace: Namespace, prefix: string, key: string): NamespaceRecord {
  return {
    namespace: namespace,
    value: namespace.value,
    prefix: prefix,
    key,
  }
}

export const getEditDeleteButtons = (onEdit: () => void, onDelete: () => void, hideEdit = false, hideDelete = false) => {
  return <Flex gap={8} justify="end">
    {!hideEdit && <Button icon={<EditOutlined />} onClick={() => onEdit()} />}
    {!hideDelete &&
      <Popconfirm onConfirm={() => onDelete()} title={"Are you sure?"}>
        <Button danger icon={<DeleteOutlined />} />
      </Popconfirm>
    }
  </Flex>
}