import { DownloadOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Radio, Switch } from "antd"
import { useForm } from 'antd/lib/form/Form'
import { TypesEnum } from "grapholscape"
import { useContext } from "react"
import { ToolbarContext } from "src/pages/designer/ToolbarContext"
import { AnnotationsDownloadInfo } from "../entity-form-props"
import AnnotationsExporter from "./AnnotationsExporter"


export default function AnnotationsDownloadForm({ onCancel }: { onCancel: () => void }) {

  const { grapholscape } = useContext(ToolbarContext)

  const defaultFormValues = {
    diagrams: grapholscape.ontology.diagrams.map(d => d.id.toString()),
    entityTypes: [TypesEnum.CLASS, TypesEnum.DATA_PROPERTY, TypesEnum.OBJECT_PROPERTY, TypesEnum.INDIVIDUAL],
    includeAllEntities: true,
    fileFormat: 'csv'
  }

  const form = useForm()[0]

  function handleSubmit() {
    const values: AnnotationsDownloadInfo = form.getFieldsValue()
    form.validateFields()
      .then(() => {
        const exporter = new AnnotationsExporter(
          grapholscape.ontology,
          values.diagrams,
          values.entityTypes,
          values.includeAllEntities)
        if (values.fileFormat === 'csv')
          exporter.generateAnnotationsDataCsv()
        else
          exporter.generateAnnotationsDataXlsx()
      })
  }

  function handleTemplate() {
    const downloadInfo: AnnotationsDownloadInfo = form.getFieldsValue()

    form.validateFields()
      .then(() => {
        const exporter = new AnnotationsExporter(
          grapholscape.ontology,
          downloadInfo.diagrams,
          downloadInfo.entityTypes,
          downloadInfo.includeAllEntities)
        if (downloadInfo.fileFormat === 'csv')
          exporter.generateTemplateDataCsv()
        else
          exporter.generateTemplateDataXlsx()
      })
  }


  return (
    <>
      <Form
        form={form}
        name="ann-download-form"
        // size="small"
        initialValues={defaultFormValues}
        wrapperCol={{ span: 24 }}
        //labelCol={{ span: 12 }}
        style={{ maxWidth: 700 }}
        colon={false}
      >
        <Form.Item
          name='diagrams'
          label="Diagrams:"
        >
          <Checkbox.Group options={grapholscape.ontology.diagrams.map(d => ({ value: d.id.toString(), label: d.name })) || []} />
        </Form.Item>
        <Form.Item label="Entity Types:" name="entityTypes">
          <Checkbox.Group options={defaultFormValues.entityTypes.map(et => ({ value: et, label: et })) || []} />
        </Form.Item>

        <Form.Item
          name='includeAllEntities'
          label="Include Entities Without Annotations"
        >
          <Switch defaultChecked />
        </Form.Item>
        <Form.Item
          name='fileFormat'
          label="File Format:"
        >
          <Radio.Group >
            <Radio value={'csv'}>Csv</Radio>
            <Radio value={'xlsx'}>Excel</Radio>
          </Radio.Group>
        </Form.Item>

      </Form >
      <Form.Item style={{ marginTop: 32, marginBottom: 0 }}>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'end' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={handleTemplate} icon={<VerticalAlignBottomOutlined />}>Generate Template</Button>
          <Button type="primary" onClick={handleSubmit} icon={<DownloadOutlined />}>Download</Button>
        </div>
      </Form.Item>
    </>
  )
}