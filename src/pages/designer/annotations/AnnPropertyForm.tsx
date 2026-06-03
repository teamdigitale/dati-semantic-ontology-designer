import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Button, Form, Input, Popover, Select } from "antd"
import { Space } from "antd/lib"
import { useForm } from 'antd/lib/form/Form'
import { AnnotationProperty, Namespace } from "grapholscape"
import { formItemStyle } from 'src/utils/utils'
import { AnnPropertyInfo, FormProps } from "../entity-form-props"

export default function AnnPropertyForm(props: FormProps & { namespaces: Namespace[], referenceProperty?: AnnotationProperty }) {

  const defaultInputValue: AnnPropertyInfo = {
    namespace: '',
    input: '',
  }
  const editMode = props.referenceProperty !== undefined
  const inputs: AnnPropertyInfo[] = editMode
    ? [{
      namespace: props.referenceProperty?.namespace?.value,
      input: props.referenceProperty?.remainder,
    }]
    : [defaultInputValue]

  const form = useForm()[0]

  function handleSubmit() {
    const propertyInfo: AnnPropertyInfo[] = form.getFieldValue('properties')
    form.validateFields()
      .then(() => props.onOk && props.onOk(propertyInfo))
      .catch(() => { console.log('error on annotation property edit') })
  }


  return (
    <>
      <Form
        form={form}
        name="ann-property-form"
        // size="small"
        initialValues={{ 'properties': inputs }}
        labelCol={{ span: 8 }}
        style={{ maxWidth: 600 }}
        colon={false}
      >
        <Form.List name="properties">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, i) => (
                <Space key={field.key} align="baseline" {...{ span: 24 }} style={{ margin: 0 }}>
                  <Form.Item
                    {...field}
                    label="Namespace:"
                    name={[field.name, 'namespace']}
                    style={{ margin: 0, width: '280px' }}
                    rules={[
                      { required: true, message: 'Namespace is required.' },
                      { type: "url", message: "Namespace must be a valid IRI." },
                    ]}
                  >
                    <Select
                      showSearch
                      options={props.namespaces?.sort((a, b) => (
                        a.prefixes.join(' - ').localeCompare(b.prefixes.join(' - '))
                      )).map(ns => ({ value: ns.value, label: ns.prefixes.join(' - ') })) || []}
                      placeholder="Input a valid namespace"
                      //children={<Input type="url"></Input>}
                      filterOption={(inputValue, option) => (
                        props.namespaces?.find(ns => inputValue === ns.value) !== undefined || // if option selected shows all suggestions
                        option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      )}
                      labelRender={(option) => (option.label || '').toString().length > 0 ? option.label : option.value}
                    />
                  </Form.Item>
                  <Form.Item
                    {...field}
                    label="Input:"
                    name={[field.name, 'input']}
                    style={{ margin: 4, width: '240px' }}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  {fields.length > 1 &&
                    <Popover content="Remove"><MinusCircleOutlined onClick={() => remove(field.name)} /></Popover>}
                  {!editMode && i === fields.length - 1 &&
                    <Popover content="Add">
                      <PlusCircleOutlined onClick={() => add()} />
                    </Popover>}
                </Space>
              ))}
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