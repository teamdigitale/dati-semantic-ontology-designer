import { CheckCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import { AutoComplete, Button, Checkbox, Col, Form, Input, Modal, Popover, Row, Select, Switch, Tooltip, Typography } from "antd"
import { useForm } from 'antd/lib/form/Form'
import { EntityNameType, GrapholEntity, TypesEnum } from "grapholscape"
import { useContext, useEffect, useState } from "react"
import { RiSparkling2Line } from 'react-icons/ri'
import { aiDarkColor, aiLightColor } from 'src/css/ai-style'
import { PromptApi, message } from 'src/store/store'
import { datatypes, formItemStyle, getAutoCompleteFormOptions, getEntityInput, simpleNameRegex } from 'src/utils/utils'
import { SHACLShapeTypeEnum } from '../../../gen/models/SHACLShape'
import AdvancedForm from "../AdvancedForm"
import { DPInfo, EntityFormProps, TypedOrMandatory } from "../entity-form-props"
import { FormContext } from '../FormContext'
import { ToolbarContext } from '../ToolbarContext'
import TypedOrMandatorySlider from '../TypedOrMandatorySlider'
import getValueConstraints, { getAdvancedConstraints, getValueEnumConstraint, isNumeric } from './DataPropertyValueConstraints'
import { ApiContext } from '../ApiContext'
import EntityCatalogQueryManager from '../entity-catalog/EntityCatalogQueryManager'

export default function DataPropertyForm(props: EntityFormProps) {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, referenceEntity, entityToEdit } = useContext(FormContext)
  const { sparqlEndpointConnection } = useContext(ApiContext)

  const entities = grapholscape.ontology.getEntitiesByType(TypesEnum.DATA_PROPERTY)
  const defaultInputValue: DPInfo = {
    name: '',
    datatype: 'rdfs:Literal',
    isFunctional: true,
    typedOrMandatory: referenceEntity && 0,
  }
  const editMode = entityToEdit !== undefined
  const inputs: DPInfo[] = editMode
    ? [{
      name: entityToEdit!.entity.iri.remainder,
      datatype: entityToEdit!.entity.datatype,
      isFunctional: entityToEdit!.entity.isDataPropertyFunctional,
    }]
    : [defaultInputValue]

  if (editMode && props.propertyInfoToEdit) {
    inputs[0].typedOrMandatory = props.propertyInfoToEdit.domainMandatory && props.propertyInfoToEdit.domainTyped
      ? 1
      : props.propertyInfoToEdit.domainMandatory
        ? 2
        : 0
  }


  const [advancedFormValid, setAdvancedFormValid] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [AIloading, setLoadingAI] = useState(false)
  const [renameEnabled, setRenameEnabled] = useState(false)

  const form = useForm()[0]
  const [multipleInputs, setMultipleInputs] = useState(false)
  const dt = editMode ? entityToEdit!.entity.datatype : defaultInputValue.datatype
  const [firstDatatype, setFirstDatatype] = useState(dt)
  const initialShow = !multipleInputs && datatypeWithConstraints(dt)
  const [showConstraints, setShowConstraints] = useState(initialShow)

  // Entity Catalog States
  const entityCatalogQueryManager = sparqlEndpointConnection ?
    new EntityCatalogQueryManager(
      sparqlEndpointConnection,
      grapholscape
    ) : undefined
  if (entityCatalogQueryManager) {
    entityCatalogQueryManager.limit = undefined // no limit
  }
  const [remoteEntities, setRemoteEntities] = useState<GrapholEntity[]>([])
  const [loadingRemoteEntities, setLoadingRemoteEntities] = useState(false)
  const [selectedEntities, setSelectedEntities] = useState<{ [x: string]: GrapholEntity | undefined }>(undefined)

  let addExternal: (defaultValue?: any, insertIndex?: number | undefined) => void

  useEffect(() => {
    setLoadingRemoteEntities(true)
    const fetchPromise = entityCatalogQueryManager
      ? entityCatalogQueryManager.getDataProperties()
      : Promise.resolve<GrapholEntity[]>([])

    fetchPromise
      .then(setRemoteEntities)
      .finally(() => setLoadingRemoteEntities(false))
  }, [sparqlEndpointConnection])

  function datatypeWithConstraints(datatype: string) {
    return isNumeric(datatype) || datatype === 'xsd:string' || false
  }

  let constraintsValues = getDPConstraintValues()
  function getDPConstraintValues() {
    let equalProps: string[] = []
    let differentProps: string[] = []
    let lessProps: string[] = []
    let enums: string[] = []
    let initialValues = { minLengthValue: '', maxLengthValue: '', regex: '', equalToProp: equalProps, differentFromProp: differentProps, minValueType: '>', minValue: '', maxValueType: '<', maxValue: '', lessThanProp: lessProps, enum: enums }
    if (editMode) {
      const domainIri = referenceEntity ? referenceEntity.fullIri : 'http://www.w3.org/2002/07/owl#Thing'
      const constraints = grapholscape?.ontology.shaclConstraints.get(domainIri)?.filter(s => s.path === entityToEdit?.entity.fullIri)
      constraints?.forEach(c => {
        switch (c.type) {
          case SHACLShapeTypeEnum.MIN_LENGTH:
            initialValues.minLengthValue = c.constraintValue ? c.constraintValue[0] : ''
            break;
          case SHACLShapeTypeEnum.MAX_LENGTH:
            initialValues.maxLengthValue = c.constraintValue ? c.constraintValue[0] : ''
            break;
          case SHACLShapeTypeEnum.PATTERN:
            initialValues.regex = c.constraintValue ? c.constraintValue[0] : ''
            break;
          case SHACLShapeTypeEnum.EQUALS:
            let equalProp = c.property ? c.property : ''
            initialValues.equalToProp.push(equalProp)
            break;
          case SHACLShapeTypeEnum.DISJOINT:
            let differentProp = c.property ? c.property : ''
            initialValues.differentFromProp.push(differentProp)
            break;
          case SHACLShapeTypeEnum.MIN_EXCLUSIVE:
            initialValues.minValueType = '>'
            initialValues.minValue = c.constraintValue ? c.constraintValue[0] : ''
            break;
          case SHACLShapeTypeEnum.MAX_EXCLUSIVE:
            initialValues.maxValueType = '<'
            initialValues.maxValue = c.constraintValue ? c.constraintValue[0] : ''
            break;
          case SHACLShapeTypeEnum.MIN_INCLUSIVE:
            initialValues.minValueType = '>='
            initialValues.minValue = c.constraintValue ? c.constraintValue[0] : ''
            break;
          case SHACLShapeTypeEnum.MAX_INCLUSIVE:
            initialValues.maxValueType = '<='
            initialValues.maxValue = c.constraintValue ? c.constraintValue[0] : ''
            break;
          case SHACLShapeTypeEnum.LESS_THAN:
            let lessProp = c.property ? c.property : ''
            initialValues.lessThanProp.push(lessProp)
            break;
          case SHACLShapeTypeEnum.IN:
            initialValues.enum = c.constraintValue ?? []
            break;
        }
      })
    }
    return initialValues

  }

  function getDPConstraints() {
    let constraints: any[] = []
    if (form.getFieldsValue().inputs.length === 1) {
      const datatype = form.getFieldsValue().inputs[0].datatype
      if (datatype === 'xsd:string') {
        let minLength = form.getFieldsValue().minLengthValue
        let maxLength = form.getFieldsValue().maxLengthValue
        let regex = form.getFieldsValue().regex
        let equalProps = form.getFieldsValue().equalToProp
        let differentProps = form.getFieldsValue().differentFromProp
        if (minLength !== '') {
          const constraint = {
            type: SHACLShapeTypeEnum.MIN_LENGTH,
            constraintValue: [minLength]
          }
          constraints.push(constraint)
        }
        if (maxLength !== '') {
          const constraint = {
            type: SHACLShapeTypeEnum.MAX_LENGTH,
            constraintValue: [maxLength]
          }
          constraints.push(constraint)
        }
        if (regex) {
          const constraint = {
            type: SHACLShapeTypeEnum.PATTERN,
            constraintValue: [regex]
          }
          constraints.push(constraint)
        }
        if (equalProps) {
          equalProps.forEach(p => {
            const constraint = {
              type: SHACLShapeTypeEnum.EQUALS,
              property: p
            }
            constraints.push(constraint)
          })
        } if (differentProps) {
          differentProps.forEach(p => {
            const constraint = {
              type: SHACLShapeTypeEnum.DISJOINT,
              property: p
            }
            constraints.push(constraint)
          })
        }
      } else if (isNumeric(datatype)) {
        let minType = form.getFieldsValue().minValueType
        let minValue = form.getFieldsValue().minValue
        let maxType = form.getFieldsValue().maxValueType
        let maxValue = form.getFieldsValue().maxValue
        let lessThanProps = form.getFieldsValue().lessThanProp
        if (minValue !== '') {
          const constraint = {
            type: !minType || minType === '>' ? SHACLShapeTypeEnum.MIN_EXCLUSIVE : SHACLShapeTypeEnum.MIN_INCLUSIVE,
            constraintValue: [minValue]
          }
          constraints.push(constraint)
        }
        if (maxValue !== '') {
          const constraint = {
            type: !maxType || maxType === '<' ? SHACLShapeTypeEnum.MAX_EXCLUSIVE : SHACLShapeTypeEnum.MAX_INCLUSIVE,
            constraintValue: [maxValue]
          }
          constraints.push(constraint)
        }
        if (lessThanProps) {
          lessThanProps.forEach(p => {
            const constraint = {
              type: SHACLShapeTypeEnum.LESS_THAN,
              property: p
            }
            constraints.push(constraint)
          })
        }
      }
      let possibleValues = form.getFieldsValue().enum
      if (possibleValues && possibleValues.length > 0) {
        const constraint = {
          type: SHACLShapeTypeEnum.IN,
          constraintValue: possibleValues
        }
        constraints.push(constraint)
      }
    }
    return constraints
  }

  function handleAdvancedFormSubmit() {
    setAdvancedFormValid(true)
  }

  function handleSubmit() {
    const constraints = getDPConstraints()
    let fieldsValueInputs = form.getFieldsValue().inputs
    form.validateFields()
      .then(() => {
        fieldsValueInputs = fieldsValueInputs.map((i, key) => {
          const entity = selectedEntities ? selectedEntities[key] : undefined
          return {
            ...i,
            name: i.name.trim(),
            entity: entity && new GrapholEntity(entity.iri),
          }
        })
        props.onOk && props.onOk(fieldsValueInputs, constraints)
      })
      .catch(() => { })
  }

  function handleAskAI() {
    if (referenceEntity) {
      setLoadingAI(true)
      const className = referenceEntity.getDisplayedName(EntityNameType.LABEL)

      PromptApi.suggestClassDataProperties({
        suggestClassDataPropertiesRequest: {
          className: className,
          context: grapholscape.ontology.name,
          language: 'en',
          numberResults: 5,
        }
      }).then(response => {
        if (response.length > 0 && response.every(i => typeof i === 'string')) {
          const currentInputs: DPInfo[] = form.getFieldValue('inputs')
          form.setFieldValue('inputs', [
            ...currentInputs,
            ...response.filter(i => !currentInputs.find(ci => ci.name === i)).map(i => ({
              name: i,
              datatype: defaultInputValue.datatype,
              isFunctional: defaultInputValue.isFunctional,
              typedOrMandatory: referenceEntity ? 0 as TypedOrMandatory : undefined,
            }))
          ].filter(i => i.name.length > 0))
        } else throw (new Error())
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
        name="data-property-form"
        // size="small"
        initialValues={{ inputs: inputs }}
        wrapperCol={{ span: 24 }}
        colon={false}
        onFinish={handleSubmit}
      >
        <Row gutter={8}>
          <Col flex="auto">
            <Form.Item label="Name" style={{ ...formItemStyle }} />
          </Col>
          <Col flex="200px">
            <Form.Item label="Datatype" style={{ ...formItemStyle }} />
          </Col>
          <Col flex="24px">
            <Form.Item label={<Tooltip title='Functional'>F</Tooltip>} style={{ ...formItemStyle }} />
          </Col>
          {referenceEntity && <Col flex="200px">
            <Row wrap={false}>
              <Form.Item label={<Tooltip title='Typed'>Typed</Tooltip>} style={{ ...formItemStyle }} />
              <Form.Item label={<Tooltip title='Both Typed and Mandatory'>Both</Tooltip>} style={{ ...formItemStyle, marginLeft: 6 }} />
              <Form.Item label={<Tooltip title='Mandatory'>Mandatory</Tooltip>} style={{ ...formItemStyle }} />
            </Row>
          </Col>}
          <Col flex="26px">
          </Col>
        </Row>

        <Form.List name="inputs">
          {(fields, { add, remove }) => {
            addExternal = add
            return <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
              {fields.map(field => {
                const selectedEntity = selectedEntities ? selectedEntities[field.key] : undefined
                return <Form.Item key={field.key} style={{ ...formItemStyle, paddingRight: 4 }}>
                  <Row gutter={8} wrap={false}>
                    <Col flex="auto">
                      <Form.Item
                        style={formItemStyle}
                        name={[field.name, 'name']}
                        rules={[
                          { required: true, message: 'Name is required' },
                          {
                            pattern: simpleNameRegex,
                            message: "Only the following characters are allowed: letters, numbers, '_', '-', '.', '‘~' and spaces.",
                          }
                        ]}
                      >
                        <AutoComplete
                          autoFocus
                          onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
                          onChange={(value, option: any) => {
                            const _selectedEntities = {
                              ...selectedEntities,
                              [field.key]: option?.entity
                            }
                            setSelectedEntities(_selectedEntities)
                            setRenameEnabled(value.trim() !== entityToEdit?.entity.iri.remainder)
                          }}
                          options={getAutoCompleteFormOptions({
                            entities,
                            grapholscape,
                            loadingRemoteEntities,
                            remoteEntities,
                            sparqlEndpointConnection,
                          })}
                          filterOption={true}
                        >
                          {getEntityInput(advancedValues, {
                            onPrefixClick: () => setAdvancedMode(true),
                            onSuffixClick: () => !editMode && setAdvancedMode(true),
                            selectedEntity: selectedEntity && {
                              source: grapholscape.ontology.getEntity(selectedEntity.iri) ? 'ontology' : 'catalog',
                              value: selectedEntity
                            }
                          })}
                        </AutoComplete>
                      </Form.Item>
                    </Col>

                    <Col flex="200px">
                      <Form.Item
                        name={[field.name, 'datatype']}
                        style={formItemStyle}
                      >
                        <Select options={datatypes.sort((a, b) => a.localeCompare(b)).map(d => ({ label: d, value: d }))} onChange={v => {
                          if (field.key === 0) {
                            setFirstDatatype(v)
                          }
                          setShowConstraints(!multipleInputs && datatypeWithConstraints(v))
                        }} />
                      </Form.Item>
                    </Col>

                    <Col flex="24px">
                      <Tooltip title="Functional">
                        <Form.Item
                          name={[field.name, 'isFunctional']}
                          style={formItemStyle}
                          valuePropName='checked'
                        >
                          <Checkbox />
                        </Form.Item>
                      </Tooltip>
                    </Col>

                    {referenceEntity && <Col flex="200px">
                      <div style={{ width: 110, marginLeft: 30 }}>
                        <Form.Item name={[field.name, 'typedOrMandatory']} style={formItemStyle}>
                          {TypedOrMandatorySlider()}
                        </Form.Item>
                      </div>
                    </Col>}

                    <Col flex="26px">
                      {field.key > 0 && <Form.Item style={formItemStyle}>
                        <MinusCircleOutlined
                          className="delete-icon"
                          style={{ fontSize: '18px', marginTop: 4 }}
                          onClick={() => {
                            remove(field.name)
                            const mInputs = fields.length > 2
                            setMultipleInputs(mInputs)
                            setShowConstraints(!mInputs && datatypeWithConstraints(firstDatatype))
                          }}
                        />
                      </Form.Item>}
                    </Col>
                  </Row>
                  {editMode && <Row>
                    <Form.Item name={[field.name, 'updateLabel']} label="Update Label" valuePropName='checked' initialValue={true}>
                      <Switch />
                    </Form.Item>
                    <Popover content="If disabled, only the current node will be edited and a new entity will be created if necessary.">
                      <Form.Item
                        name={[field.name, 'isRefactor']}
                        label="Edit All Occurrences"
                        valuePropName='checked'
                        initialValue={true}
                        style={formItemStyle}
                      >
                        <Switch disabled={!renameEnabled} />
                      </Form.Item>
                    </Popover>
                  </Row>}
                </Form.Item>
              })}
            </div>
          }}
        </Form.List>
        {!multipleInputs ?
          <>
            <Form.Item label="Value Constraints" style={{ ...formItemStyle }} />
            {showConstraints ?
              <Form.Item noStyle>
                {getValueConstraints(firstDatatype, constraintsValues)}
                {referenceEntity && grapholscape ?
                  getAdvancedConstraints(firstDatatype, referenceEntity, grapholscape, constraintsValues)
                  : null
                }
              </Form.Item>
              : null}
            <Form.Item name="enum" style={formItemStyle} label="Possible values:" labelCol={{ span: 6 }} initialValue={constraintsValues.enum}>
              {getValueEnumConstraint()}
            </Form.Item>
          </> : null
        }
      </Form>
      <Modal
        open={advancedMode}
        onCancel={() => setAdvancedMode(false)}
        footer={null}
        title="Advanced Settings">
        <AdvancedForm
          onSubmit={handleAdvancedFormSubmit}
          editMode={editMode}
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
                onClick={() => {
                  addExternal(defaultInputValue)
                  setMultipleInputs(true)
                  setShowConstraints(false)
                }}
                icon={<PlusOutlined />}
              >Add</Button>
            }
            {referenceEntity && window["aiConfig"] && <Button
              style={{
                background: `linear-gradient(135deg, ${aiDarkColor}, ${aiLightColor})`
              }}
              icon={<i>{RiSparkling2Line({})}</i>}
              onClick={() => handleAskAI()}
              loading={AIloading}
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