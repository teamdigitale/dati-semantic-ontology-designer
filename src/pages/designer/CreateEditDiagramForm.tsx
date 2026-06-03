import { Button, Flex, Form, Input, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import { useContext } from "react";
import OntologyBuilder from "src/builder/ontology-builder";
import { ToolbarContext } from "./ToolbarContext";

export default function CreateEditDiagramForm({ diagramName, onDone }: { diagramName?: string, onDone?: () => void }) {

  const { grapholscape } = useContext(ToolbarContext)
  const [form] = useForm()

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (values.diagramName !== diagramName) {
        const ontologyBuilder = new OntologyBuilder(grapholscape)
        if (diagramName) {
          ontologyBuilder.renameDiagram(values.diagramName)
          message.success(`Diagram renamed`)
        } else {
          ontologyBuilder.addDiagram(values.diagramName)
          message.success(`Diagram ${values.diagramName} created`)
        }
      }

      onDone && onDone()
    })
  }

  return <>
    <Form layout="vertical" initialValues={{ diagramName }} form={form} onFinish={handleSubmit}>
      <Form.Item
        rules={[{ required: true, message: 'Please input the diagram name!' }]}
        name="diagramName"
        label="Diagram Name"
      >
        <Input autoFocus minLength={2} placeholder="Diagram Name" />
      </Form.Item>
    </Form>
    <Flex justify="end" gap={8}>
      <Button onClick={() => onDone && onDone()} >Cancel</Button>
      <Button type="primary" onClick={handleSubmit} >Ok</Button>
    </Flex>
  </>
}