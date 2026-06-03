import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Popover, Table } from "antd";
import { ColumnsType } from "antd/lib/table";
import { AnnotatedElement, Annotation, GrapholEntity } from "grapholscape";
import { useContext, useEffect, useState } from "react";
import { RDFGraphConfigEntityNameTypeEnum } from "src/gen";
import { message } from "src/store/store";
import { getAnnotationPropertyDisplayName, getColumnSearchProps, isGrapholEntity } from "src/utils/utils";
import { AnnotationRecord, getEditDeleteButtons } from "../settings/OntologyManager";
import { ToolbarContext } from "../ToolbarContext";
import CreateAnnotationModal from "./CreateAnnotationModal";
import { EditAnnotationModal } from "./EditAnnotationModal";

export default function AnnotationTable({ annotatedElement, loading }: { annotatedElement?: AnnotatedElement, loading?: boolean }) {

  const { grapholscape } = useContext(ToolbarContext)
  const [annotationData, setAnnotationData] = useState<AnnotationRecord[]>()
  const [createAnnotation, setCreateAnnotation] = useState(false)
  const [annotationRecordToEdit, setAnnotationRecordToEdit] = useState(undefined)

  const entityAnnotationColumns: ColumnsType<AnnotationRecord> = [
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      width: 300,
      render: text => text,
      ...getColumnSearchProps('property'),
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      width: 120,
      render: text => text && `@${text}`,
      ...getColumnSearchProps('language'),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      // minWidth: 400,
      render: text => text,
      ...getColumnSearchProps('value'),
    },
    {
      title: '',
      key: 'key',
      dataIndex: 'key',
      width: 90,
      render: (_, record, i) => (
        getEditDeleteButtons(
          () => setAnnotationRecordToEdit(record), // onEdit
          () => deleteAnnotation(record, i), // onDelete
        )
      ),
    }
  ]

  const assertionsColumns: ColumnsType<AnnotationRecord> = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      // width: 250,
      render: (text, record) => <Popover title={(record.annotatedElement as GrapholEntity).fullIri}>{text}</Popover>,
      ...getColumnSearchProps('subject'),
    },
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      // width: 200,
      render: text => text,
      ...getColumnSearchProps('property'),
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
      width: 120,
      align: 'left',
      render: text => text && `@${text}`,
      ...getColumnSearchProps('language'),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      // width: 800,
      render: text => text,
      ...getColumnSearchProps('value'),
    },
    {
      title: '',
      key: 'key',
      dataIndex: 'key',
      width: 90,
      render: (_, record: AnnotationRecord, i) => (
        getEditDeleteButtons(
          () => setAnnotationRecordToEdit(record), // onEdit
          () => deleteAnnotation(record, i) // onDelete
        )
      ),
    }
  ]

  useEffect(() => {
    if (annotatedElement) { // get annotations from a single entity or ontology
      setAnnotationData(
        annotatedElement.getAnnotations()
          .map((annotation, index) => getAnnotationRecord(annotatedElement, annotation, index.toString()))
      )
    } else { // get annotations from all entities
      let assertionData: AnnotationRecord[] = []
      grapholscape.ontology.entities.forEach((entity, i) => {
        assertionData = [
          ...assertionData,
          ...entity.getAnnotations().map((annotation, j) => getAnnotationRecord(entity, annotation, `${i}-${j}`))
        ]
      })
      setAnnotationData(assertionData)
    }
  }, [annotatedElement])

  /**
   * Removes an annotation from the annotatedElement owning the annotation
   * the annotatedElement can be the ontology or an entity
   * @param record 
   * @param recordIndex 
   */
  const deleteAnnotation = (record: AnnotationRecord, recordIndex: number) => {
    record.annotatedElement.removeAnnotation(record.annotation)
    annotationData.splice(recordIndex, 1) // in place edit of the array
    setAnnotationData([...annotationData]) // set a copy or no update!
    // if (isGrapholEntity(record.annotatedElement)) {
    // } else {
    //   ontologyAnnotationsData.splice(recordIndex, 1)
    //   setOntologyAnnotationsData([...ontologyAnnotationsData])
    // }

    message.success('Annotation Deleted')
  }

  return <>
    <Table
      virtual
      style={{ height: '100%', minWidth: '50vw' }}
      loading={loading}
      size='small'
      columns={annotatedElement ? entityAnnotationColumns : assertionsColumns}
      dataSource={annotationData}
      pagination={false}
      scroll={{ x: '100%', y: '100%' }} />

    {annotatedElement && <Flex justify="end" style={{ marginTop: 24 }}>
      <Button
        key="add"
        onClick={() => setCreateAnnotation(true)}
        icon={<PlusOutlined />}
        type="primary">
        Add
      </Button>
    </Flex>}

    {createAnnotation && <CreateAnnotationModal
      annotatedElement={annotatedElement}
      onDone={(newAnnotation) => {
        if (newAnnotation) {
          // update table with new annotation
          setAnnotationData([
            ...annotationData,
            getAnnotationRecord(annotatedElement, newAnnotation, Date.now().toString())
          ])
        }
        setCreateAnnotation(false) // close modal
      }}
    />}

    {annotationRecordToEdit && <EditAnnotationModal
      onDone={(newAnnotation?: Annotation) => {
        if (newAnnotation) {
          // editing the record updates the table => just for view (cannot reassign record, edit it)
          const newRecord = getAnnotationRecord(annotationRecordToEdit.annotatedElement, newAnnotation, '0')
          annotationRecordToEdit.annotation = newAnnotation
          annotationRecordToEdit.language = newRecord.language
          annotationRecordToEdit.property = newRecord.property
          annotationRecordToEdit.value = newRecord.value
        }
        setAnnotationRecordToEdit(undefined) // close modal
      }}
      annotationToEdit={annotationRecordToEdit.annotation}
      entity={annotationRecordToEdit.annotatedElement}
    />}
  </>
}

export function getAnnotationRecord(annotatedElement: AnnotatedElement, annotation: Annotation, key: string): AnnotationRecord {
  return {
    subject: isGrapholEntity(annotatedElement) ? annotatedElement.getDisplayedName(RDFGraphConfigEntityNameTypeEnum.PREFIXED_IRI) : undefined,
    property: getAnnotationPropertyDisplayName(annotation.propertyIri),
    language: annotation.language,
    value: annotation.value,
    annotatedElement: annotatedElement,
    annotation: annotation,
    key: key
  }
}