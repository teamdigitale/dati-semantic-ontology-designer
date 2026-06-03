import { Form, Popover, Select, Switch } from "antd";
import { useContext } from "react";
import { FormContext } from "../FormContext";
import { ToolbarContext } from "../ToolbarContext";

export default function AiAssistantSettings() {

  const mainContext = useContext(ToolbarContext)
  const languages = useContext(FormContext).advancedValues.languageList


  return <>
    <Form.Item label="Entities' name case:">
      <Popover content="Whether to use camel or snake case for entities' names">
        <Switch
          checked={mainContext.designerAssistantSettings.iriStyle}
          checkedChildren="camel"
          unCheckedChildren="snake"
          onChange={(checked) => mainContext.setDesignerAssistantSettings({
            ...mainContext.designerAssistantSettings,
            iriStyle: checked,
          })}
          style={{ backgroundColor: 'var(--color-primary)' }}
        />
      </Popover>
    </Form.Item>
    <Form.Item label="Simple Name Language">
      <Popover content="">

        <Select
          value={mainContext.designerAssistantSettings.simpleNameLanguage}
          options={languages.map(l => ({ value: l, key: l, label: l }))}
          onSelect={(value) => mainContext.setDesignerAssistantSettings({
            ...mainContext.designerAssistantSettings,
            simpleNameLanguage: value,
          })}
        />
      </Popover>
    </Form.Item>
  </>
}