import Icon, { EyeOutlined, GlobalOutlined, ImportOutlined, RollbackOutlined, SaveOutlined, ToolOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, Modal, Tabs, Typography } from "antd";
import { useForm } from 'antd/lib/form/Form';
import { useContext, useState } from 'react';
import { MdFormatAlignLeft, MdLabelOutline } from "react-icons/md";
import { message } from 'src/store/store';
import AdvancedForm from '../AdvancedForm';
import { ApiContext } from '../ApiContext';
import GraphSettings from './GraphSettings';
import OntologyImporter from './OntologyImporter';
import OntologyManager from './OntologyManager';
import OntologyMetadataForm from './metadata/OntologyMetadataForm';
import AiAssistantSettings from './AiAssistantSettings';
import { VscSparkle } from 'react-icons/vsc';

const Settings = () => {

  const { sparqlEndpointConnection, setSparqlEndpointURL, resetSparqlEndpointConnection } = useContext(ApiContext)
  const [showImportNamespacesModal, setShowImportNamespacesModal] = useState(false)
  const [isSparqlEndpointURLNew, setIsSparqlEndpointURLNew] = useState(false)

  const form = useForm()[0]
  const advancedForm = useForm()[0]

  const handleSaveCatalogURL = (importNamespaces: boolean) => {
    if (setSparqlEndpointURL) {
      form.validateFields().then((fields) => {
        setSparqlEndpointURL(fields.sparqlEndpointURL, importNamespaces)
        message.success('Entity Catalog URL saved successfully.')
      })
    }
  }

  const onSaveCatalogURLClick = () => setShowImportNamespacesModal(true)
  const tabs = [
    {
      key: '1',
      label: 'Ontology Manager',
      children: <OntologyManager />,
      icon: <ToolOutlined />,
    },
    {
      key: '6',
      label: 'Entity Names',
      children: <Flex vertical gap={8}>
        <Typography.Text type='secondary'>
          Default namespace used for new entities' IRIs.
        </Typography.Text>
        <AdvancedForm allowChangeLanguage={false} />
      </Flex>,
      icon: MdLabelOutline({
        size: "1.2em",
        style: { position: "relative", top: "3px" }
      })
    },
    {
      key: '2',
      label: 'Rendering',
      children: <GraphSettings />,
      icon: <EyeOutlined />,
    },
    {
      key: '3',
      label: 'Import Ontology',
      children: <OntologyImporter />,
      icon: <ImportOutlined />,
    },
    {
      key: '4',
      label: 'Entity Catalog',
      children: <Form style={{ height: 363 }} form={form} initialValues={{ sparqlEndpointURL: sparqlEndpointConnection?.endpointUrl }} onFinish={onSaveCatalogURLClick}>
        <Flex vertical justify='space-between' style={{ height: '100%' }}>
          <div>
            <Form.Item label="SPARQL Endpoint URL:" name="sparqlEndpointURL">
              <Input placeholder='URL' type='url' onChange={(e) => setIsSparqlEndpointURLNew(e.target.value !== sparqlEndpointConnection?.endpointUrl)} />
            </Form.Item>
            <Typography.Text type='secondary'>
              The Entity Catalog allows you to specify a SPARQL endpoint from which entities can be easily reused in the current ontology.
            </Typography.Text>
          </div>
          <Flex gap={8} justify='end'>
            <Button icon={<RollbackOutlined />} onClick={() => {
              const defaultConnection = resetSparqlEndpointConnection()
              form.setFieldValue('sparqlEndpointURL', defaultConnection.endpointUrl)
              onSaveCatalogURLClick()
            }}>
              Reset Default
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              icon={<SaveOutlined />}
              disabled={!isSparqlEndpointURLNew}
            >Save</Button>
          </Flex>
        </Flex>
        {showImportNamespacesModal && <Modal
          title="Import Namespaces"
          open={showImportNamespacesModal}
          closable={false}
          okText="Yes"
          cancelText="No"
          onCancel={() => {
            handleSaveCatalogURL(false)
            setShowImportNamespacesModal(false)
            setIsSparqlEndpointURLNew(false)
          }}
          onOk={() => {
            handleSaveCatalogURL(true)
            setShowImportNamespacesModal(false)
            setIsSparqlEndpointURLNew(false)
          }}
        >Do you want to import namespaces from the new Entity Catalog?</Modal>}
      </Form>,
      icon: <GlobalOutlined />,
    },
    {
      key: '5',
      label: 'ADMS-AP_IT Metadata',
      children: <div style={{ width: 'calc(80vw - 200px)' }}>
        <OntologyMetadataForm disabled={false} height='80vh' />
      </div>,
      icon: MdFormatAlignLeft({}),
    },
    {
      key: '7',
      label: 'AI Assistant',
      children: <AiAssistantSettings />,
      icon: VscSparkle({}),
    },
  ]

  return <Tabs
    destroyOnHidden={true}
    tabPosition='left'
    items={tabs}
    style={{ maxHeight: '75vh' }}
  />
}

export default Settings