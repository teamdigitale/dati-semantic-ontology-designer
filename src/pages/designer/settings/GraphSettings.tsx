import { Form, Switch } from "antd"
import { BaseOptionType } from "antd/es/select"
import { Select } from "antd/lib"
import { useContext, useState } from "react"
import { RDFGraphConfigEntityNameTypeEnum } from "src/gen"
import { ToolbarContext } from "../ToolbarContext"
import { setDesignerStyle } from "src/builder/ui/style"

export default function GraphSettings() {

  const { grapholscape } = useContext(ToolbarContext)

  const [entityNameTypeLoading, setEntityNameTypeLoading] = useState(false)
  // const [languageLoading, setLanguageLoading] = useState(false)
  const [themeLoading, setThemeLoading] = useState(false)

  let languageChangeTimeout: NodeJS.Timeout

  const onFieldChange = (fieldKey: string, fieldValue: any) => {
    if (fieldValue !== undefined) {
      clearTimeout(languageChangeTimeout)
      switch (fieldKey) {
        case 'entityNameType':
          setEntityNameTypeLoading(true)
          grapholscape.setEntityNameType(fieldValue)
          setTimeout(() => setEntityNameTypeLoading(false), 100)
          break

        // case 'language':
        //   setLanguageLoading(true)
        //   languageChangeTimeout = setTimeout(() => {
        //     grapholscape.setLanguage(fieldValue)
        //     setLanguageLoading(false)
        //   }, 500)
        //   break

        case 'theme':
          setThemeLoading(true)
          grapholscape.setTheme(fieldValue)
          setTimeout(() => setThemeLoading(false), 100)
          break

        case 'highlightAIGenerated':
          grapholscape.ontology.diagrams.forEach(d => {
            const cy = d.representations.get(grapholscape.renderState)?.cy
            if (cy) {
              cy.scratch('_highlightAIGenerated', fieldValue)
              setDesignerStyle(cy, grapholscape.theme)
            }
          })
      }
    }
  }

  return <Form
    labelCol={{ span: 7 }}
    // wrapperCol={{ span: 14 }}
    layout="horizontal"
    initialValues={{
      entityNameType: grapholscape.entityNameType,
      language: grapholscape.language,
      theme: grapholscape.theme.id,
      highlightAIGenerated: grapholscape.ontology.diagrams[0]
        ?.representations.get(grapholscape.renderState)
        ?.cy.scratch('_highlightAIGenerated'),
    }}
    onFieldsChange={(changedFields) => changedFields.forEach(c => onFieldChange(c.name[0], c.value))}
  >
    <Form.Item name='entityNameType' label="Entity Name Type">
      <Select
        loading={entityNameTypeLoading}
        style={{ width: '100%' }}
        options={Object.values(RDFGraphConfigEntityNameTypeEnum).map(entry => ({
          label: entry.charAt(0).toUpperCase() + entry.replace('_', ' ').substring(1),
          value: entry,
          title: entry,
        } as BaseOptionType))} />
    </Form.Item>

    {/* <Form.Item name='language' label="Language">
      <Input.Search
        enterButton={null}
        placeholder="Language"
        loading={languageLoading}
        // options={grapholscape.ontology.languages.map(l => ({ value: l }))}
      />
    </Form.Item> */}

    <Form.Item name='theme' label="Theme">
      <Select
        loading={themeLoading}
        style={{ width: '100%' }}
        placeholder="Language"
        options={grapholscape.themeList.map(t => ({ value: t.id, label: t.name } as BaseOptionType))}
      />
    </Form.Item>

    {window['aiConfig'] && <Form.Item name="highlightAIGenerated" label="Highlight AI Generated" valuePropName="checked">
      <Switch />
    </Form.Item>}
  </Form>
}