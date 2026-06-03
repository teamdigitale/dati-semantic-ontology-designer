import { ImportOutlined, SearchOutlined } from "@ant-design/icons"
import { Button, Checkbox, Empty, Flex, Form, Input, message, Modal, Popover, Select, Skeleton, Space, Tree, Typography } from "antd"
import { DataNode } from "antd/es/tree"
import { DiagramBuilder, DiagramColorManager, GrapholElement, GrapholEntity } from "grapholscape"
import React, { useContext, useEffect, useState } from "react"
import EntityIcon from "src/components/EntityIcon"
import { TypesEnum } from "src/gen"
import { ApiContext } from "../ApiContext"
import { FormContext } from "../FormContext"
import { ToolbarContext } from "../ToolbarContext"
import EntityCatalogMetadataPreview from "./EntityCatalogMetadataPreview"
import EntityCatalogQueryManager from "./EntityCatalogQueryManager"

const searchModes = [
  { key: 'label', label: 'Label or IRI' },
  { key: 'comment', label: 'Comment' },
  { key: 'ontology', label: 'Defined By' }
]

type EntityCatalogProps = {
  findSimilarTo?: GrapholEntity
}

export default function EntityCatalog(props: EntityCatalogProps) {

  const { remoteCatalogEntities, setRemoteCatalogEntities, grapholscape } = useContext(ToolbarContext)
  const language = useContext(FormContext).advancedValues.language

  const [loading, setLoading] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string | undefined>()
  const [searchMode, setSearchMode] = useState<string>(searchModes[0].key)
  const [selectedEntities, setSelectedEntities] = useState(new Set<number>())
  const [checkedEntityTypes, setCheckedEntityTypes] = useState<TypesEnum[]>([])
  const [showDomainRangeSelector, setShowDomainRangeSelector] = useState<boolean>(false)
  const entityTypeOptions = [
    { label: <><EntityIcon type={TypesEnum.CLASS} />Classes</>, value: TypesEnum.CLASS, },
    { label: <><EntityIcon type={TypesEnum.OBJECT_PROPERTY} /> Object Properties</>, value: TypesEnum.OBJECT_PROPERTY },
    { label: <><EntityIcon type={TypesEnum.DATA_PROPERTY} /> Data Properties</>, value: TypesEnum.DATA_PROPERTY },
    { label: <><EntityIcon type={TypesEnum.INDIVIDUAL} /> Individuals</>, value: TypesEnum.INDIVIDUAL },
  ]
  const sparqlEndpointConnection = useContext(ApiContext).sparqlEndpointConnection

  const entityCatalogQueryManager = new EntityCatalogQueryManager(sparqlEndpointConnection, grapholscape)

  useEffect(() => {
    if (sparqlEndpointConnection && !loading) {
      setLoading(true)
      // Perform query on sparqlEndpoint
      entityCatalogQueryManager.fetchEntityCatalog({
        entityTypesFilter: checkedEntityTypes,
        searchValue: props.findSimilarTo?.iri.remainder || searchValue,
        searchMode: props.findSimilarTo
          ? 'label'
          : searchMode as ('label' | 'comment' | 'ontology'),
      }).then((entities) => {
        setRemoteCatalogEntities(entities)
      }).finally(() => setLoading(false))
    }
  }, [sparqlEndpointConnection, checkedEntityTypes, searchValue, language, props.findSimilarTo])

  const treeData: (DataNode & { entity: GrapholEntity })[] = remoteCatalogEntities.map((e, i) => ({
    key: i,
    title: <Popover placement="left" content={<EntityCatalogMetadataPreview entity={e} language={language} />} >
      <EntityIcon type={e.types[0] || Array.from(e.manualTypes)[0]} /> {e.getDisplayedName(grapholscape.entityNameType, language)}
    </Popover>,
    entity: e,
  }))

  let searchTimeout = setTimeout(() => { }, 0)

  const onImport = () => {
    if (selectedEntities.size === 1 && treeData[Array.from(selectedEntities)[0]].entity.types[0] === TypesEnum.OBJECT_PROPERTY) {
      setShowDomainRangeSelector(true)
      return
    }
    const diagramBuilder = new DiagramBuilder(grapholscape.renderer.diagram, grapholscape.renderState);
    const diagramColorManager = new DiagramColorManager(diagramBuilder.diagramRepresentation)
    Array.from(selectedEntities).map(key => treeData[key].entity).forEach((entity: GrapholEntity, i) => {
      /**
       * create a copy, we don't want to import annotations.
       */
      const e = new GrapholEntity(entity.iri)
      e.manualTypes = new Set(entity.types)
      grapholscape.ontology.addEntity(e)
      let addedElem: GrapholElement | undefined
      switch (e.types[0]) {
        case TypesEnum.CLASS:
          addedElem = diagramBuilder.addClass(e)
          break
        case TypesEnum.INDIVIDUAL:
          addedElem = diagramBuilder.addIndividual(e)
          break
        case TypesEnum.DATA_PROPERTY:
          addedElem = diagramBuilder.addDataProperty(e)
          break
      }

      if (i === selectedEntities.size - 1) {
        if (addedElem) {
          grapholscape.selectElement(addedElem.id, addedElem.diagramId)
          grapholscape.centerOnElement(addedElem.id, addedElem.diagramId, 1.5)
        }
        diagramColorManager.colorDiagram()
      }
    })

    setSelectedEntities(new Set())
  }

  const onImportObjectProperty = (formValues: { domainEntityIri: string, rangeEntityIri: string }) => {
    /**
     * create a copy, we don't want to import annotations.
     */
    const originOpEntity = treeData[Array.from(selectedEntities)[0]].entity
    const copiedOpEntity = new GrapholEntity(originOpEntity.iri)
    copiedOpEntity.manualTypes = new Set(originOpEntity.types)
    const domainEntity = grapholscape.ontology.getEntity(formValues.domainEntityIri)
    const rangeEntity = grapholscape.ontology.getEntity(formValues.rangeEntityIri)
    if (!copiedOpEntity.is(TypesEnum.OBJECT_PROPERTY) || !domainEntity || !rangeEntity) {
      message.error('Error importing object property. Please try again.')
      return
    }
    grapholscape.ontology.addEntity(copiedOpEntity)
    const diagramBuilder = new DiagramBuilder(grapholscape.renderer.diagram, grapholscape.renderState)
    const addedElem = diagramBuilder.addObjectProperty(copiedOpEntity, domainEntity, rangeEntity, [TypesEnum.CLASS])
    setShowDomainRangeSelector(false)

    new DiagramColorManager(diagramBuilder.diagramRepresentation).colorDiagram()
    if (addedElem) {
      grapholscape.selectElement(addedElem.id, addedElem.diagramId)
      grapholscape.centerOnElement(addedElem.id, addedElem.diagramId, 1.5)
    }

    setSelectedEntities(new Set())
  }

  const domainRangeOptions = grapholscape.ontology.getEntitiesByType(TypesEnum.CLASS).map(e => ({
    label: <><EntityIcon type={TypesEnum.CLASS} /> {e.getDisplayedName(grapholscape.entityNameType, language)}</>,
    value: e.iri.fullIri,
  }))

  return <Flex vertical gap={16} style={{ height: "100%" }}>
    {!props.findSimilarTo && <>
      <Space.Compact>
        <Select
          style={{ width: 120 }}
          defaultValue={searchModes[0].key}
          options={searchModes.map(s => ({ label: s.label, value: s.key }))}
          onChange={(value) => setSearchMode(value)}
        />
        <Input
          onChange={(evt) => {
            clearTimeout(searchTimeout)
            searchTimeout = setTimeout(() => setSearchValue(evt.currentTarget.value), 500)
          }}
          allowClear
          placeholder="Search..."
          suffix={<SearchOutlined />}
        />
      </Space.Compact>
      <Checkbox.Group
        options={entityTypeOptions}
        value={checkedEntityTypes}
        onChange={(checkedEntityTypes) => setCheckedEntityTypes(checkedEntityTypes)}
      />
    </>}
    {props.findSimilarTo && <Flex gap={8} align="center">
      <Typography.Title style={{ margin: 0 }} level={5}>Similar Entities to:</Typography.Title>
      <Flex gap={8} align="center">
        <EntityIcon type={props.findSimilarTo.types[0]} />
        <Typography.Title style={{ margin: 0 }} level={5}>
          {props.findSimilarTo.getDisplayedName(grapholscape.entityNameType, grapholscape.language)}
        </Typography.Title>
      </Flex>
    </Flex>}
    {loading
      ? <Skeleton active />
      : treeData.length === 0
        ? <Empty description="No entities found" />
        : <Flex vertical style={{ height: "100%" }} gap={16}>
          <Tree
            onCheck={(_, checkInfo) => {
              // setSelectedEntities(new Set())
              if (treeData[checkInfo.node.key as number].entity.types[0] === TypesEnum.OBJECT_PROPERTY && checkInfo.checked) {
                setSelectedEntities(new Set([checkInfo.node.key as number]))
              } else {
                setSelectedEntities(new Set(checkInfo.checkedNodes.filter(n => n.entity.types[0] !== TypesEnum.OBJECT_PROPERTY).map(n => n.key as number)))
              }
            }}
            checkedKeys={Array.from(selectedEntities)}
            checkable
            height={window.innerHeight - 235}
            treeData={treeData}
          />
          <Flex gap={16} justify="center">
            <Button
              onClick={() => setSelectedEntities(new Set())}
            >
              Reset
            </Button>
            <Popover content={selectedEntities.size > 0 && <Flex vertical>
              {Array.from(selectedEntities).map(key => treeData[key].title as React.ReactNode)}
            </Flex>}>
              <Button
                type="primary"
                onClick={onImport}
                style={{ flexShrink: 0 }}
                disabled={selectedEntities.size === 0}
                icon={<ImportOutlined />}
              >
                Import ({selectedEntities.size})
              </Button>
            </Popover>
          </Flex>
          <Modal
            title="Object Property Import: Domain and Range Selection"
            open={showDomainRangeSelector}
            onCancel={() => setShowDomainRangeSelector(false)}
            footer={null}
          >
            <Form onFinish={onImportObjectProperty} layout="horizontal" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} style={{ paddingTop: 16 }}>
              <Form.Item label="Domain" name="domainEntityIri" rules={[{ required: true, message: 'Please select a domain entity!' }]}>
                <Select showSearch options={domainRangeOptions} />
              </Form.Item>
              <Form.Item label="Range" name="rangeEntityIri" rules={[{ required: true, message: 'Please select a range entity!' }]}>
                <Select showSearch options={domainRangeOptions} />
              </Form.Item>
              <Flex justify="end">
                <Button type="primary" htmlType="submit">Ok</Button>
              </Flex>
            </Form>
          </Modal>
        </Flex>
    }
  </Flex>
}
