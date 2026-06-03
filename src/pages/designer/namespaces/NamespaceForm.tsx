import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Button, Flex, Form, Input, Popover, Space, Switch } from "antd"
import { useForm } from 'antd/lib/form/Form'
import { Namespace } from "grapholscape"
import { formItemStyle } from 'src/utils/utils'
import { FormProps, NamespaceInfo } from "../entity-form-props"


export default function NamespaceForm(props: FormProps & { referenceNamespace?: Namespace, prefix?: string, prefixes?: string[] }) {
  const defaultInputValue: NamespaceInfo = {
    prefix: '',
    namespace: '',
  }
  const editMode = props.referenceNamespace !== undefined
  const inputs: NamespaceInfo[] = editMode
    ? [{
      prefix: props.prefix,
      namespace: props.referenceNamespace?.value,
      refactor: true,
    }]
    : [defaultInputValue]

  const form = useForm()[0]

  function handleSubmit() {
    let namespaceInfo: NamespaceInfo[] = form.getFieldValue('namespaces')
    form.validateFields()
      .then(() => {
        namespaceInfo = namespaceInfo.map(n => ({ ...n, namespace: n.namespace?.trim() } as NamespaceInfo))
        props.onOk && props.onOk(namespaceInfo)
      })
      .catch(() => { console.warn('error on namespace edit') })
  }

  return (
    <>
      <Form
        form={form}
        name="namespace-form"
        initialValues={{ 'namespaces': inputs }}
        // labelCol={{ span: 8 }}
        style={{ maxWidth: 600 }}
        colon={false}
      >
        <Form.List name="namespaces">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, i) => <>
                <Flex key={i} align='baseline' wrap>
                  <Form.Item
                    key={`prefix${i}`}
                    {...field}
                    label="Prefix:"
                    name={[field.name, 'prefix']}
                    style={{ margin: 0, width: 150 }}
                    rules={[{ required: true, message: 'Missing prefix' }, {
                      validator: async (_, value) => {
                        if (props.prefixes && props.prefixes.includes(value) && (!editMode || value !== props.prefix)) {
                          return Promise.reject(new Error('Prefix already exists'))
                        }
                      }
                    }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    key={`namespace${i}`}
                    label="Namespace:"
                    name={[field.name, 'namespace']}
                    style={{ margin: 4 }}
                    rules={[{ required: true, message: 'Missing namespace' }]}
                  >
                    <Input style={{ width: 'max-content' }} />
                  </Form.Item>
                  {fields.length > 1 &&
                    <Popover content="Remove">
                      <MinusCircleOutlined onClick={() => remove(field.name)} />
                    </Popover>
                  }
                  {!editMode && i === fields.length - 1 && <Popover content="Add">
                    <PlusCircleOutlined onClick={() => add()} />
                  </Popover>}
                </Flex>
                {editMode && <Popover content="If enabled, entities IRIs starting with the previous namespace will be updated with the new one.">
                  <Form.Item
                    name={[field.name, 'refactor']}
                    label="Refactor Entities IRI"
                    valuePropName='checked'
                    style={{ margin: "16px 0 0 0", display: 'inline-block' }}
                  >
                    <Switch />
                  </Form.Item>
                </Popover>
                }
              </>)}
            </>
          )}
        </Form.List>

      </Form >
      <Form.Item style={{ ...formItemStyle, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'end' }}>
          <Button onClick={props.onCancel} >Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>Ok</Button>
        </div>
      </Form.Item>
    </>
  )
}