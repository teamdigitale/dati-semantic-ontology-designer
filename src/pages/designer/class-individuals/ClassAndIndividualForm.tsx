import { CheckCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { AutoComplete, Button, Col, Flex, Form, Modal, Popover, Radio, Row, Switch, Tooltip } from "antd"
import { useForm } from 'antd/lib/form/Form'
import { EntityNameType, GrapholEntity } from "grapholscape"
import { useContext, useEffect, useState } from "react"
import { RiSparkling2Line } from 'react-icons/ri'
import { aiDarkColor, aiLightColor } from 'src/css/ai-style'
import { TypesEnum } from 'src/gen'
import { FormContext } from 'src/pages/designer/FormContext'
import { ToolbarContext } from 'src/pages/designer/ToolbarContext'
import { PromptApi, message } from 'src/store/store'
import { formItemStyle, getAutoCompleteFormOptions, getEntityInput, simpleNameRegex } from 'src/utils/utils'
import AdvancedForm from "../AdvancedForm"
import { ApiContext } from '../ApiContext'
import EntityCatalogQueryManager from '../entity-catalog/EntityCatalogQueryManager'
import { BaseEntityInfo, EntityFormProps, HierarchyInfo, ISAInfo } from "../entity-form-props"

export default function ClassAndIndividualForm(props: EntityFormProps & {
  entityType: TypesEnum.CLASS | TypesEnum.INDIVIDUAL,
  formType?: 'isa' | 'hierarchy',
  complete?: boolean,
  disjoint?: boolean,
}) {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, referenceEntity, entityToEdit } = useContext(FormContext)
  const { sparqlEndpointConnection } = useContext(ApiContext)

  const entityCatalogQueryManager = sparqlEndpointConnection ?
    new EntityCatalogQueryManager(
      sparqlEndpointConnection,
      grapholscape
    ) : undefined
  if (entityCatalogQueryManager) {
    entityCatalogQueryManager.limit = undefined // no limit
  }
  const entities = grapholscape.ontology.getEntitiesByType(props.entityType)
  const [remoteEntities, setRemoteEntities] = useState<GrapholEntity[]>([])
  const [loadingRemoteEntities, setLoadingRemoteEntities] = useState(false)
  const [selectedEntities, setSelectedEntities] = useState<{ [x: string]: GrapholEntity | undefined }>(undefined)

  const defaultInputValue: BaseEntityInfo | ISAInfo = {
    name: '',
    isaDirection: 'subclass'
  }

  const editMode = entityToEdit !== undefined
  const inputs: BaseEntityInfo[] = editMode
    ? [{
      name: entityToEdit.entity.iri.remainder,
    }]
    : props.formType === 'hierarchy' ? [defaultInputValue, defaultInputValue] : [defaultInputValue]

  const complete = props.complete !== undefined ? props.complete : true
  const disjoint = props.disjoint !== undefined ? props.disjoint : true

  const [advancedFormValid, setAdvancedFormValid] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [loadingAI, setLoadingAI] = useState(false)

  const form = useForm()[0]

  let addExternal: (defaultValue?: any, insertIndex?: number | undefined) => void

  useEffect(() => {
    setLoadingRemoteEntities(true)
    const fetchPromise = entityCatalogQueryManager
      ? entityCatalogQueryManager.getClasses()
      : Promise.resolve<GrapholEntity[]>([])

    fetchPromise
      .then(setRemoteEntities)
      .finally(() => setLoadingRemoteEntities(false))
  }, [sparqlEndpointConnection, editMode])

  function handleAdvancedFormSubmit() {
    setAdvancedFormValid(true)
  }

  const handleSubmit = () => {
    const fieldsValue = form.getFieldsValue()
    form.validateFields()
      .then(() => {
        if (props.onOk) {
          fieldsValue.inputs = fieldsValue.inputs.map((i, key) => {
            const entity = selectedEntities ? selectedEntities[key] : undefined
            return {
              ...i,
              name: i.name.trim(),
              entity: entity && new GrapholEntity(entity.iri),
            }
          })
          if (props.formType === 'hierarchy')
            props.onOk(fieldsValue)
          else
            props.onOk(fieldsValue.inputs)
        }
      }).catch((e) => console.error(e))
  }

  const handleAskAI = () => {
    if (referenceEntity) {
      setLoadingAI(true)
      const className = referenceEntity.getDisplayedName(EntityNameType.LABEL)
      PromptApi.suggestClassSubclasses({
        suggestClassDataPropertiesRequest: {
          className: className,
          context: grapholscape.ontology.name,
          language: 'en',
          numberResults: 5,
        }
      }).then(response => {
        if (response.length > 0 && response.every(i => typeof i === 'string')) {
          const currentInputs: BaseEntityInfo[] = form.getFieldValue('inputs')
          form.setFieldValue('inputs', [
            ...currentInputs,
            ...response.filter(i => !currentInputs.find(ci => ci.name === i)).map(i => ({
              name: i
            }))
          ].filter(i => i.name.length > 0))
        } else {
          throw new Error()
        }
      }).catch(e => {
        message.info("AI: sorry, I was not able to provide no valid result")
      }).finally(() => {
        setLoadingAI(false)
      })
    }
  }

  return (
    <>
      <Form
        form={form}
        name="class-individual-hierarchy-form"
        // size="small"
        initialValues={{ inputs: inputs, complete, disjoint }}
        wrapperCol={{ span: 24 }}
        colon={false}
        onFinish={handleSubmit}
      >
        <Row gutter={8}>
          <Col flex="auto">
            <Form.Item label="Name" style={{ ...formItemStyle }} />
          </Col>
          <Col flex="200px"><Form.Item style={{ ...formItemStyle }} /></Col>
          <Col flex="26px"><Form.Item style={{ ...formItemStyle }} /></Col>
        </Row>

        <Form.List name="inputs">
          {(fields, { add, remove }) => {
            addExternal = add
            return <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
              {fields.map((field, i) => {
                const selectedEntity = selectedEntities ? selectedEntities[field.key] : undefined

                return <Form.Item key={field.key} style={{ ...formItemStyle, paddingRight: 4 }}>
                  <Row gutter={8} wrap={false}>
                    <Col flex="auto">
                      <Form.Item
                        style={formItemStyle}
                        name={[field.name, 'name']}
                        rules={[
                          { required: true, message: 'Name is required.' },
                          {
                            pattern: simpleNameRegex,
                            message: "Only the following characters are allowed: letters, numbers, '_', '-', '.', '‘~' and spaces.",
                          }]}
                      >
                        <AutoComplete
                          autoFocus
                          onChange={(value, option: any) => {
                            const _selectedEntities = {
                              ...selectedEntities,
                              [field.key]: option?.entity
                            }
                            setSelectedEntities(_selectedEntities)
                          }}
                          options={getAutoCompleteFormOptions({
                            entities,
                            grapholscape,
                            sparqlEndpointConnection,
                            loadingRemoteEntities,
                            remoteEntities
                          })}
                          filterOption={true}
                        >
                          {getEntityInput(advancedValues, {
                            onPrefixClick: () => !selectedEntity && setAdvancedMode(true),
                            onSuffixClick: () => !selectedEntity && !editMode && setAdvancedMode(true),
                            selectedEntity: {
                              value: selectedEntity,
                              source: grapholscape.ontology.getEntity(selectedEntity?.iri.fullIri || '') ? 'ontology' : 'catalog'
                            }
                          })}
                        </AutoComplete>
                      </Form.Item>
                    </Col>
                    {props.formType === 'isa' &&
                      <Col flex="200px">
                        <Form.Item name={[field.name, 'isaDirection']} style={formItemStyle}>
                          <Radio.Group
                            options={[
                              { label: 'Subclass', value: 'subclass' },
                              { label: 'Superclass', value: 'superclass' },
                            ]}
                            optionType="button"
                          />
                        </Form.Item>
                      </Col>
                    }
                    <Col flex="26px">
                      {// Hierarchies must have at least 2 inputs
                        ((props.formType === 'hierarchy' && field.key > 1) || (props.formType !== 'hierarchy' && field.key > 0)) &&
                        <Form.Item style={formItemStyle}>
                          <MinusCircleOutlined
                            className="delete-icon"
                            style={{ fontSize: '18px', top: 0 }}
                            onClick={() => remove(field.name)}
                          />
                        </Form.Item>
                      }
                    </Col>
                  </Row>
                  {editMode && <Flex gap={16}>
                    <Form.Item
                      name={[field.name, 'updateLabel']}
                      label="Update Label"
                      valuePropName='checked'
                      initialValue={true}
                      style={formItemStyle}
                    >
                      <Switch disabled={!!selectedEntity} />
                    </Form.Item>
                    <Popover content="If disabled, only the current node will be edited and a new entity will be created if necessary.">
                      <Form.Item
                        name={[field.name, 'isRefactor']}
                        label="Edit All Occurrences"
                        valuePropName='checked'
                        initialValue={true}
                        style={formItemStyle}
                      >
                        <Switch disabled={!!selectedEntity} />
                      </Form.Item>
                    </Popover>
                  </Flex>}
                </Form.Item>
              })}
            </div>
          }}
        </Form.List>

        {props.formType === 'hierarchy' &&
          <Row>
            <Tooltip
              title={
                <span>Created classes do not share any instance. <br />
                  Instances can't belong to two or more classes <br />
                  in this hierarchy at once.</span>
              }
            >
              <Form.Item
                name='disjoint'
                label='Disjoint'
                valuePropName='checked'
                style={{ marginRight: 6 }}
              >
                <Switch />
              </Form.Item>
            </Tooltip>
            <Tooltip
              title={<span>All instances of the superclass must be in this hierarchy.<br />
                There won't be any instance of the superclass not belonging <br />
                to any of created classes in this hierarchy.</span>
              }
            >
              <Form.Item
                name='complete'
                label='Complete'
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </Tooltip>
          </Row>
        }
      </Form >
      <Modal
        open={advancedMode}
        onCancel={() => setAdvancedMode(false)}
        footer={null}
        title="Advanced Settings">
        <AdvancedForm
          editMode={editMode}
          onSubmit={handleAdvancedFormSubmit}
        />
      </Modal>
      <Form.Item style={{ ...formItemStyle, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <Button type="dashed" onClick={() => setAdvancedMode(true)}>
              {advancedFormValid && <CheckCircleOutlined style={{ color: 'var(--success)' }} />}
              Advanced Settings
            </Button>
            {!editMode &&
              <Button
                type="dashed"
                onClick={() => addExternal(defaultInputValue)}
                icon={<PlusOutlined />}
              >Add</Button>
            }
            {referenceEntity && window["aiConfig"] && <Button
              style={{
                background: `linear-gradient(135deg, ${aiDarkColor}, ${aiLightColor})`
              }}
              icon={<i>{RiSparkling2Line({})}</i>}
              onClick={() => handleAskAI()}
              loading={loadingAI}
            >Ask AI</Button>}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <Button onClick={props.onCancel} >Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>Ok</Button>
          </div>
        </div>
      </Form.Item>
    </>
  )
}

function isHierarchyInfo(value: any): value is HierarchyInfo {
  return value.complete !== undefined && value.disjoint !== undefined && value.inputs !== undefined
}