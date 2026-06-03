import { AutoComplete, Form, Popover, Select, Switch, Tag } from "antd";
import { useContext, useState } from "react";
import { FormContext } from "src/pages/designer/FormContext";
import { ToolbarContext } from "src/pages/designer/ToolbarContext";
import { formItemStyle } from "src/utils/utils";
import { AdvancedFormProps } from "./entity-form-props";
import { message } from "src/store/store";


export default function AdvancedForm({
  onSubmit,
  editMode = false,
  allowChangeLanguage = true,
}: { onSubmit?: () => void, editMode?: boolean, allowChangeLanguage?: boolean }) {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, setAdvancedValues } = useContext(FormContext)

  const [labelEnabled, setLabelEnabled] = useState(true)
  const formRef = Form.useForm()[0]

  const fieldNames = {
    "namespace": "Namespace",
    "deriveLabel": "Label generation",
    "convertCamel": "Camel case conversion",
    "convertSnake": "Snake case conversion",
  }

  const handleOk = async (changedFields: { name: string[], value: string }[]) => {
    formRef.validateFields()
      .then((values: AdvancedFormProps) => {
        const newAdvancedValues = {
          ...advancedValues,
          ...values,
        }
        if (!grapholscape.ontology.languages.includes(newAdvancedValues.language)) {
          grapholscape.ontology.languages.push(newAdvancedValues.language)
          newAdvancedValues.languageList = grapholscape.ontology.languages
        }
        setAdvancedValues(newAdvancedValues)
        onSubmit && onSubmit()
        message.success(`${changedFields.map(f => fieldNames[f.name[0]] || f.name[0]).join(', ')} updated successfully.`)
      })
      .catch((e) => console.log(e))
  }

  return <Form
    form={formRef}
    name="advanced-form"
    initialValues={advancedValues}
    onFinish={handleOk}
    onFieldsChange={handleOk}
  >
    <Form.Item
      name='namespace'
      label="Namespace"
    // rules={[
    //   { required: true, message: 'Namespace is required.' },
    //   { type: "url", message: "Namespace must be a valid IRI." },
    //   {
    //     pattern: new RegExp(/^[A-Za-z0-9-_.~:@/#]+$/), message: "Namespace only admits A-Za-z0-9-_.~:@/# characters"
    //   }
    // ]}
    >
      <Select
        options={grapholscape.ontology.namespaces.map(ns => ({
          value: ns.value,
          label: <>{ns.prefixes.map(prefix => <Tag>{prefix || ':'}</Tag>)} {ns.value}</>
        }))}
        // placeholder="Input a valid namespace"
        // children={<Input type="url"></Input>}
        filterOption={(inputValue, option) => (
          grapholscape.ontology.namespaces.find(ns => inputValue === ns.value) !== undefined || // if option selected shows all suggestions
          option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
        )}
      />
    </Form.Item>
    {!editMode && <fieldset>
      <legend style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Form.Item
          style={{ display: "inline-block", ...formItemStyle, margin: 6 }}
          name="deriveLabel"
          label="Label Generation"
          valuePropName="checked"
        >
          <Switch size="small" onChange={v => setLabelEnabled(v)} />
        </Form.Item>
      </legend>
      {allowChangeLanguage && <Form.Item
        style={formItemStyle}
        labelCol={{ span: 12 }}
        name="language"
        label="Language">
        <AutoComplete
          disabled={!labelEnabled}
          options={grapholscape.ontology.languages.map((l, i) => ({ value: l, label: l, key: i })) || []}
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1 || option!.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1}
        />
      </Form.Item>
      }
      <Popover content="If enabled, camelCase names will be converted to space separated words in the label. Example: 'myProperty' will become 'My Property'">
        <Form.Item
          style={formItemStyle}
          labelCol={{ span: 12 }}
          name="convertCamel"
          label="Convert from camelCase Name"
          valuePropName="checked">
          <Switch size="small" disabled={!labelEnabled} />
        </Form.Item>
      </Popover>
      <Popover content="If enabled, snake_case names will be converted to space separated words in the label. Example: 'my_property' will become 'My Property'">
        <Form.Item
          style={formItemStyle}
          labelCol={{ span: 12 }}
          name="convertSnake"
          label="Convert from snake_case Name"
          valuePropName="checked">
          <Switch size="small" disabled={!labelEnabled} />
        </Form.Item>
      </Popover>
    </fieldset>}
  </Form>
}