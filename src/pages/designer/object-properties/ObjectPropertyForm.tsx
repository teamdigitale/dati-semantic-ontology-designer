import { CheckCircleOutlined } from '@ant-design/icons'
import { AutoComplete, Button, Checkbox, Col, Flex, Form, Input, InputNumber, Modal, Popover, Row, Switch, Tooltip, Typography } from "antd"
import { useForm } from 'antd/lib/form/Form'
import { EntityNameType, FunctionalityEnum, GrapholEntity, GrapholObjectPropertyEdge, TypesEnum } from "grapholscape"
import { useContext, useEffect, useState } from "react"
import { RiSparkling2Line } from 'react-icons/ri'
import { aiDarkColor, aiLightColor } from 'src/css/ai-style'
import { formItemStyle, getEntityInput, simpleNameRegex, getAutoCompleteFormOptions } from 'src/utils/utils'
import { ApiContext } from '../ApiContext'
import EntityCatalogQueryManager from '../entity-catalog/EntityCatalogQueryManager'
import { SHACLShape, SHACLShapeTypeEnum } from '../../../gen'
import AdvancedForm from "../AdvancedForm"
import { EntityFormProps, OPInfo } from "../entity-form-props"
import { FormContext } from '../FormContext'
import { ToolbarContext } from '../ToolbarContext'
import TypedOrMandatorySlider from '../TypedOrMandatorySlider'

export default function ObjectPropertyForm(props: EntityFormProps & { domainClass?: GrapholEntity, rangeClass?: GrapholEntity }) {

  const { grapholscape } = useContext(ToolbarContext)
  const { advancedValues, referenceEntity, entityToEdit } = useContext(FormContext)

  const editMode = entityToEdit !== undefined

  const entities = grapholscape.ontology.getEntitiesByType(TypesEnum.OBJECT_PROPERTY)
  const defaultInputValue: OPInfo = {
    name: entityToEdit?.entity.iri.remainder || '',
    functionProperties: entityToEdit?.entity.functionProperties || [],
    domainTypedOrMandatory: 0,
    rangeTypedOrMandatory: 0,
    //domainMinCard: -1,
    //domainMaxCard: -1,
    //rangeMinCard: -1,
    //rangeMaxCard: -1.
  }
  if (editMode) {
    const edge = entityToEdit.element as GrapholObjectPropertyEdge
    defaultInputValue.domainTypedOrMandatory =
      edge.domainMandatory && edge.domainTyped
        ? 1 // both
        : edge.domainMandatory
          ? 2 // only mandatory
          : 0 // only typed

    defaultInputValue.rangeTypedOrMandatory =
      edge.rangeMandatory && edge.rangeTyped
        ? 1 // both
        : edge.rangeMandatory
          ? 2 // only mandatory
          : 0 // only typed
  }

  const [advancedFormValid, setAdvancedFormValid] = useState(false)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [AIloading, setLoadingAI] = useState(false)
  const [renameEnabled, setRenameEnabled] = useState(false)


  const form = useForm()[0]

  const { sparqlEndpointConnection } = useContext(ApiContext)

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
  const [selectedEntity, setSelectedEntity] = useState<GrapholEntity | undefined>(undefined)

  const constraintsValues = getDPConstraintValues()

  useEffect(() => {
    setLoadingRemoteEntities(true)
    const fetchPromise = entityCatalogQueryManager
      ? entityCatalogQueryManager.getObjectProperties()
      : Promise.resolve<GrapholEntity[]>([])

    fetchPromise
      .then(setRemoteEntities)
      .finally(() => setLoadingRemoteEntities(false))
  }, [sparqlEndpointConnection])


  function getDPConstraintValues() {
    const initialValues = { domainMinCard: '', domainMaxCard: '', rangeMinCard: '', rangeMaxCard: '' }
    if (editMode && props.domainClass && props.rangeClass) {
      const domain = props.domainClass.fullIri
      const domainConstraints = grapholscape?.ontology.shaclConstraints.get(domain)?.filter(s => s.path === entityToEdit?.entity.fullIri) ?? []
      const range = props.rangeClass.fullIri
      const rangeConstraints = grapholscape?.ontology.shaclConstraints.get(range)?.filter(s => s.path === entityToEdit?.entity.fullIri) ?? []
      domainConstraints?.forEach(c => {
        switch (c.type) {
          case SHACLShapeTypeEnum.MIN_COUNT:
            initialValues.domainMinCard = c.constraintValue ? c.constraintValue[0] : ''
            break
          case SHACLShapeTypeEnum.MAX_COUNT:
            initialValues.domainMaxCard = c.constraintValue ? c.constraintValue[0] : ''
            break
        }
      })
      rangeConstraints?.forEach(c => {
        switch (c.type) {
          case SHACLShapeTypeEnum.MIN_COUNT:
            initialValues.rangeMinCard = c.constraintValue ? c.constraintValue[0] : ''
            break
          case SHACLShapeTypeEnum.MAX_COUNT:
            initialValues.rangeMaxCard = c.constraintValue ? c.constraintValue[0] : ''
            break
        }
      })

    }
    return initialValues

  }

  function getOPConstraints() {
    const constraints: SHACLShape[] = []
    const domainMinCard = form.getFieldsValue().domainMinCard
    const domainMaxCard = form.getFieldsValue().domainMaxCard
    const rangeMinCard = form.getFieldsValue().rangeMinCard
    const rangeMaxCard = form.getFieldsValue().rangeMaxCard
    if (domainMinCard && domainMinCard > -1) {
      const constraint = {
        type: SHACLShapeTypeEnum.MIN_COUNT,
        targetClass: 'domain',
        constraintValue: domainMinCard,
        path: ''
      }
      constraints.push(constraint)
    }
    if (domainMaxCard && domainMaxCard > -1) {
      const constraint = {
        type: SHACLShapeTypeEnum.MAX_COUNT,
        targetClass: 'domain',
        constraintValue: domainMaxCard,
        path: ''
      }
      constraints.push(constraint)
    }
    if (rangeMinCard && rangeMinCard > -1) {
      const constraint = {
        type: SHACLShapeTypeEnum.MIN_COUNT,
        targetClass: 'range',
        constraintValue: rangeMinCard,
        path: ''
      }
      constraints.push(constraint)
    }
    if (rangeMaxCard && rangeMaxCard > -1) {
      const constraint = {
        type: SHACLShapeTypeEnum.MAX_COUNT,
        targetClass: 'range',
        constraintValue: rangeMaxCard,
        path: ''
      }
      constraints.push(constraint)
    }
    return constraints
  }

  function handleAdvancedFormSubmit() {
    setAdvancedFormValid(true)
  }

  function handleSubmit() {
    const constraints = getOPConstraints()
    let fieldsValue = form.getFieldsValue()
    form.validateFields()
      .then(() => {
        fieldsValue.name = fieldsValue.name.trim()
        props.onOk?.([{ ...fieldsValue, entity: selectedEntity }], constraints)
      })
      .catch(() => { })
  }

  function handleAskAI(): void {
    throw new Error('Function not implemented.')
  }

  return (
    <>
      <Form
        name="object-property-form"
        form={form}
        colon={false}
        initialValues={defaultInputValue}
      >
        <Row gutter={8}>
          <Col flex="auto">
            <Form.Item label="Name" style={formItemStyle} />
          </Col>

        </Row>
        <Row style={{ alignItems: 'center', marginBottom: 24 }}>
          <Col flex="auto">
            <Form.Item
              name='name'
              rules={[
                { required: true, },
                {
                  pattern: simpleNameRegex,
                  message: "Only the following characters are allowed: letters, numbers, '_', '-', '.', '‘~' and spaces.",
                }
              ]}
              labelCol={{ span: 5 }}
              style={formItemStyle}
            >
              <AutoComplete
                autoFocus
                options={getAutoCompleteFormOptions({
                  entities,
                  grapholscape,
                  sparqlEndpointConnection,
                  loadingRemoteEntities,
                  remoteEntities,
                })}
                filterOption={true}
                onChange={(value, option: any) => {
                  setSelectedEntity(option?.entity)
                  setRenameEnabled(value.trim() !== entityToEdit?.entity.iri.remainder)
                }}
              >{getEntityInput(advancedValues, {
                onPrefixClick: () => setAdvancedMode(true),
                onSuffixClick: () => !editMode && setAdvancedMode(true),
                selectedEntity: selectedEntity && {
                  source: grapholscape.ontology.getEntity(selectedEntity.iri) ? 'ontology' : 'catalog',
                  value: selectedEntity
                }
              })}</AutoComplete>
            </Form.Item>
          </Col>

        </Row>
        {!selectedEntity && <>
          <Row>
            <Col flex="200px" style={{ marginLeft: '54px' }}>
              <Row wrap={false}>
                <Col flex="60px"><Form.Item label={<Tooltip title='Typed'>Typed</Tooltip>} style={formItemStyle} /></Col>
                <Col><Form.Item label={<Tooltip title='Both Typed and Mandatory'>Both</Tooltip>} style={formItemStyle} /></Col>
                <Col><Form.Item label={<Tooltip title='Mandatory'>Mandatory</Tooltip>} style={formItemStyle} /></Col>
              </Row>
            </Col>
            <Col flex={'120px'}>
              <Form.Item label={<Tooltip title='Min. Card.'>Min. Card.</Tooltip>} style={formItemStyle} />
            </Col>
            <Col flex={'120px'}>
              <Form.Item label={<Tooltip title='Max. Card.'>Max. Card.</Tooltip>} style={formItemStyle} />
            </Col>
          </Row>
          <Row style={{ marginBottom: '24px' }}>
            <Col flex="180px" style={{ margin: '0 28px 0 12px' }}>
              <Form.Item name="domainTypedOrMandatory" style={formItemStyle} label="Source:" labelCol={{ span: 8 }}>
                {TypedOrMandatorySlider()}
              </Form.Item>
              <Form.Item name="rangeTypedOrMandatory" style={formItemStyle} label="Target:" labelCol={{ span: 8 }}>
                {TypedOrMandatorySlider()}
              </Form.Item>
            </Col>
            <Col flex={'120px'} style={{ marginLeft: '24px' }}>
              <Form.Item name="domainMinCard" style={formItemStyle} initialValue={constraintsValues.domainMinCard}>
                <InputNumber min={-1} max={1000} /*defaultValue={3}*/ />
              </Form.Item>
              <Form.Item name="rangeMinCard" style={formItemStyle} initialValue={constraintsValues.rangeMinCard}>
                <InputNumber min={-1} max={1000} /*defaultValue={3}*/ />
              </Form.Item>
            </Col>
            <Col flex={'120px'}>
              <Form.Item name="domainMaxCard" style={formItemStyle} initialValue={constraintsValues.domainMaxCard}>
                <InputNumber min={-1} max={1000} /*defaultValue={3}*/ />
              </Form.Item>
              <Form.Item name="rangeMaxCard" style={formItemStyle} initialValue={constraintsValues.rangeMaxCard}>
                <InputNumber min={-1} max={1000} /*defaultValue={3}*/ />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name='functionProperties'>
            <Checkbox.Group style={{ width: '100%' }}>
              <Row>
                {Object.values(FunctionalityEnum).map(functionProp => (
                  <Col key={functionProp}>
                    <Checkbox
                      value={functionProp}
                    >
                      {functionProp}
                    </Checkbox>
                  </Col>
                ))}
              </Row>
            </Checkbox.Group>
          </Form.Item>
          {editMode && <Flex gap={8}>
            <Form.Item name="updateLabel" label="Update Label" valuePropName='checked' initialValue={true}>
              <Switch />
            </Form.Item>
            <Popover content="If disabled, only the current node will be edited and a new entity will be created if necessary.">
              <Form.Item
                name={'isRefactor'}
                label="Edit All Occurrences"
                valuePropName='checked'
                initialValue={true}
                style={formItemStyle}
              >
                <Switch disabled={!renameEnabled} />
              </Form.Item>
            </Popover>
          </Flex>
          }
        </>}
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
        <Flex justify='space-between'>
          <Flex gap={8}>
            <Button type="dashed" onClick={() => setAdvancedMode(true)}>
              {advancedFormValid && <CheckCircleOutlined style={{ color: 'var(--success)' }} />}
              Advanced Settings
            </Button>
            {referenceEntity && window["aiConfig"] && <Button
              style={{
                background: `linear-gradient(135deg, ${aiDarkColor}, ${aiLightColor})`
              }}
              icon={<i>{RiSparkling2Line({})}</i>}
              onClick={() => handleAskAI()}
              loading={AIloading}
            >Ask AI</Button>}
          </Flex>
          <Flex gap={8}>
            <Button onClick={props.onCancel} >Cancel</Button>
            <Button type="primary" onClick={handleSubmit}>Ok</Button>
          </Flex>
        </Flex>
      </Form.Item >
    </>
  )
}