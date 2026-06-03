import { Form, FormInstance, Select } from "antd"
import { useContext } from "react"
import { ToolbarContext } from "src/pages/designer/ToolbarContext"
import OntologyTemplateExporter from "./OntologyTemplateExporter"


export default function OntologyUploadForm({ form }: { form: FormInstance }) {

  const { grapholscape } = useContext(ToolbarContext)

  let diagram = grapholscape.ontology.diagrams[0].id
  let namespace = grapholscape.ontology.namespaces[0].value
  let language = 'it'

  return <Form
    form={form}
    name="import-settings"
    initialValues={{ diagram, namespace, language }}
    layout="vertical">
    <Form.Item name='diagram' label='Select destination Diagram' style={{ marginBottom: 16 }}>
      <Select
        options={grapholscape.ontology.diagrams.map(d => { return { value: d.id, label: d.name } })}
      />
    </Form.Item>
    <Form.Item name='namespace' label='Select Namespace' style={{ marginBottom: 16 }}>
      <Select
        options={grapholscape.ontology.namespaces.map(n => { return { value: n.value, label: n.toString() } })}
      />
    </Form.Item>
    <Form.Item name='language' label='Select Label Language' style={{ marginBottom: 16 }}>
      <Select
        options={[{ value: 'it', label: 'it' }, { value: 'en', label: 'en' },]}
      />
    </Form.Item>
  </Form>
}