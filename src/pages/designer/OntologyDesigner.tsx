import { DownloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Drawer, Flex, Form, Input, Layout, Modal, Select, Spin, Typography } from 'antd';
import { FormInstance } from 'antd/lib';
import cytoscape, { NodeSingular } from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import { FunctionalityEnum, GrapholEntity, initFromResume, LifecycleEvent, loadConfig, Namespace, storeConfigEntry, ui } from 'grapholscape';
import { Base64 } from 'js-base64';
import mousetrap from 'mousetrap';
import React from 'react';
import { GoLinkExternal } from 'react-icons/go';
import drawNewEdge from 'src/builder/edge-creation/draw-new-edge';
import { computeIRI } from 'src/builder/iri-processing';
import DesignerToolbar from 'src/builder/ui/toolbar';
import { Namespace as NamespaceGen, RDFGraph, TypesEnum } from 'src/gen';
import { RequestHistoryItem } from 'src/model';
import { AdvancedFormProps } from 'src/pages/designer/entity-form-props';
import { ConvertApi, message } from 'src/store/store';
import { downloadTextFile, getNamespaces, getOntologyExtension } from 'src/utils/utils';
import { DesignerEvent, GrapholscapeDesigner, initBuilderUI } from '../../builder';
import OntologyBuilder from '../../builder/ontology-builder';
import { ApiContext, SPARQLEndpointConnection } from './ApiContext';
import AssistantContext from './assistant/AssistantContext';
import DesignerAssistant from './assistant/DesignerAssistant';
import ExplainerAssistant from './assistant/ExplainerAssistant';
import CreateClassAndIndividualModal from './class-individuals/CreateClassAndIndividual';
import { ContextualMenu } from './ContextualMenu';
import CreateEditDiagramForm from './CreateEditDiagramForm';
import CreateDataPropertyModal from './data-properties/CreateDataProperty';
import EntityCatalog from './entity-catalog/EntityCatalog';
import { FormContext } from './FormContext';
import InfoBar from './Infobar';
import CreateObjectPropertyModal from './object-properties/CreateObjectProperty';
import OWLDrawer from './OwlDrawer';
import removeDiagramsFromRDFGraph from './RemoveDiagramsFromRDFGraph';
import Settings from './settings/Settings';
import { ToolbarContext } from './ToolbarContext';

cytoscape.use(edgehandles);


export default class OntologyDesigner extends React.Component<{
  rdfGraph: RDFGraph,
  creator?: string,
  getOwl: (rdfGraph: RDFGraph, format: string) => Promise<string>
  saveDraft?: (rdfGraph: RDFGraph) => void
  saveVersion?: (rdfGraph: RDFGraph) => RDFGraph
  convertOWLToRDFGraph?: (owlFile: Blob) => Promise<RDFGraph>
  sparqlEndpointConnection?: SPARQLEndpointConnection
  defaultNamespaces?: NamespaceGen[]
  userManualURL?: string
}> {
  formImportOntology = React.createRef<FormInstance>()
  state = {
    loading: false,
    assistantVisible: undefined as 'explain' | 'design',
    rdfGraphToShow: undefined,
    settingsOpen: false,
    grapholscape: undefined as GrapholscapeDesigner,
    visibleOWLDrawer: false,
    // Advanced Values in forms
    advancedValues: { //default values
      convertCamel: true,
      deriveLabel: true,
      convertSnake: true,
      language: 'en',
      languageList: [],
      namespace: '',
      namespaceList: [],
    } as AdvancedFormProps,
    sparqlEndpointConnection: this.props.sparqlEndpointConnection as SPARQLEndpointConnection | undefined,
    // show/hide modals flags
    createClass: false,
    createIndividual: false,
    createDataProperty: false,
    createObjectProperty: undefined as {
      sourceIri: string,
      targetIri: string,
      sourceType: TypesEnum.CLASS | TypesEnum.INDIVIDUAL,
      targetType: TypesEnum.CLASS | TypesEnum.INDIVIDUAL,
    },
    createHierarchy: false,
    visibleNewDiagramModal: false,
    visibleRenameDiagramModal: false,
    visibleRemoveDiagramModal: false,
    modalOpen: false as boolean,
    rdfGraphToDownload: undefined as RDFGraph | undefined,
    diagramsToDownload: [] as number[],
    selectedFormat: 'Functional Syntax' as string,
    fileName: 'ontology' as string,
    isDownloading: false as boolean,
    remoteCatalogEntities: [] as GrapholEntity[],
    entityCatalogOpen: false as boolean,
    lastSelectedElement: undefined as NodeSingular | undefined,
    designerAssistantHistory: [] as RequestHistoryItem[],
    explainerAssistantHistory: [] as RequestHistoryItem[],
    designerAssistantSettings: {
      iriStyle: true as boolean,
      simpleNameLanguage: 'en' as string
    },
    isAssistantRequestPending: false as boolean,
    userManualVisible: false as boolean,
  }
  _rdfGraph?: RDFGraph
  rdfGraphToBeImported?: RDFGraph
  previousTheme = loadConfig().selectedTheme

  setAdvancedValues = (advancedValues: AdvancedFormProps) => {
    this.setState({ advancedValues })
  }

  setRemoteCatalogEntities = (entities: GrapholEntity[]) => {
    this.setState({ remoteCatalogEntities: entities })
  }

  componentWillUnmount() {
    if (this.previousTheme) {
      storeConfigEntry('selectedTheme', this.previousTheme)
    }
  }

  beforeUnloadListener = (event: BeforeUnloadEvent) => {
    event.preventDefault();
  }

  async componentDidMount() {
    window.addEventListener('beforeunload', this.beforeUnloadListener, { capture: true })
    const container = document.getElementById('grapholscape-container')
    if (!container) {
      return
    }
    const rdfGraph: RDFGraph = this.props.rdfGraph
    const grapholscape = new GrapholscapeDesigner(rdfGraph, container);
    (this.props.defaultNamespaces || []).forEach(ns => {
      grapholscape.ontology.addNamespace(new Namespace(ns.prefixes, ns.value))
    })
    initFromResume(grapholscape, rdfGraph)
    initBuilderUI(grapholscape)

    grapholscape.on(LifecycleEvent.NodeSelection, n => {
      const elem = grapholscape.renderer.cy?.$id(n.id)
      this.setState({ lastSelectedElement: elem })
    })

    grapholscape.on(LifecycleEvent.EdgeSelection, e => {
      const elem = grapholscape.renderer.cy?.$id(e.id)
      this.setState({ lastSelectedElement: elem })
    })

    grapholscape.on(LifecycleEvent.BackgroundClick, () => {
      this.setState({ lastSelectedElement: undefined })
    })

    if (!rdfGraph.diagrams[rdfGraph.selectedDiagramId!]?.lastViewportState) {
      grapholscape?.renderer.renderState?.runLayout()
    } else {
      grapholscape?.renderer.renderState?.stopLayout()
    }
    // setInterval(() => this.saveDraft(false), 100000)
    if (this.props.saveDraft) {
      grapholscape.on(DesignerEvent.SaveDraft, (rdfGraph) => {
        this.rdfGraph = rdfGraph
        this.props.saveDraft(this.rdfGraph || grapholscape.exportToRdfGraph())

      })
    }

    grapholscape.on(DesignerEvent.SaveVersion, (rdfGraph) => {
      this.rdfGraph = rdfGraph
      const newRDFGRaph: RDFGraph = this.props.saveVersion(this.rdfGraph || grapholscape.exportToRdfGraph())
      grapholscape.ontology.version = newRDFGRaph.metadata.version || ''
      grapholscape.ontology.iri = newRDFGRaph.metadata.iri;
      (grapholscape.widgets.get(ui.WidgetEnum.ONTOLOGY_INFO) as any)?.requestUpdate()
    })

    grapholscape.on(DesignerEvent.AssistantRequest, () => {
      this.setState({ assistantVisible: this.state.assistantVisible !== 'design' ? 'design' : undefined })
    })

    mousetrap.bind('mod+shift+c', (e) => {
      e.preventDefault()
      this.setState({ createClass: true })
    })

    mousetrap.bind('mod+shift+o', (e) => {
      e.preventDefault()
      this.onCreateObjectProperty()
    })

    mousetrap.bind('mod+shift+d', (e) => {
      e.preventDefault()
      this.setState({ createDataProperty: true })
    })

    mousetrap.bind('mod+shift+i', (e) => {
      e.preventDefault()
      this.setState({ createIndividual: true })
    })

    mousetrap.bind('mod+shift+h', (e) => {
      e.preventDefault()
      if (this.state.lastSelectedElement?.data().type === TypesEnum.CLASS) {
        this.setState({ createHierarchy: true })
      }
    })

    mousetrap.bind('esc', (e) => {
      grapholscape.unselect();
    })

    this.setState({ grapholscape })
    this.setAdvancedValues({
      ...this.state.advancedValues,
      namespace: grapholscape.ontology.iri,
      namespaceList: grapholscape.ontology.namespaces,
      language: grapholscape.language,
      languageList: grapholscape.ontology.languages,
    })
  }

  error = () => {
    this.setState({ loading: false, error: true })
  }

  editEntity = (editInfo: {
    name: string,
    entity: GrapholEntity,
    namespace: string,
    updateLabel: boolean,
    datatype?: string,
    isDataPropertyFunctional?: boolean,
    functionProperties?: FunctionalityEnum[],
    domainTypedOrMandatory?: number,
    rangeTypedOrMandatory?: number,
    rename?: { elemId: string },
    constraints: any[]
  }) => {
    if (!editInfo.rename) {
      new OntologyBuilder(this.state.grapholscape).refactorEntity(
        editInfo.entity,
        computeIRI(editInfo.namespace, editInfo.name),
        editInfo.updateLabel,
        this.state.advancedValues,
        editInfo.datatype,
        editInfo.isDataPropertyFunctional,
        editInfo.functionProperties,
        editInfo.domainTypedOrMandatory,
        editInfo.rangeTypedOrMandatory,
        editInfo.constraints
      )
    } else {
      new OntologyBuilder(this.state.grapholscape).renameEntity(
        editInfo.entity.iri,
        editInfo.rename.elemId,
        computeIRI(editInfo.namespace, editInfo.name),
        editInfo.updateLabel,
        this.state.advancedValues,
        editInfo.datatype,
        editInfo.isDataPropertyFunctional,
        editInfo.functionProperties,
        editInfo.domainTypedOrMandatory,
        editInfo.rangeTypedOrMandatory,
        editInfo.constraints
      )
    }
  }

  get currentDiagram() {
    return this.state.grapholscape.ontology.getDiagram(this.state.grapholscape.diagramId)
  }

  get rdfGraph() {
    let rdfGraph = this._rdfGraph || this.state.grapholscape?.exportToRdfGraph();
    if (this.props.creator && rdfGraph) rdfGraph.creator = this.props.creator;
    return rdfGraph
  }

  set rdfGraph(rdfGraph: RDFGraph | undefined) {
    this._rdfGraph = rdfGraph;
  }

  openFormatModal = () => {
    this.setState({ rdfGraphToDownload: this.rdfGraph, modalOpen: true, selectedFormat: 'Functional Syntax' });
  }

  cancelDownload = () => {
    this.setState({ modalOpen: false, rdfGraphToDownload: undefined, fileName: "ontology", diagramsToDownload: [], selectedFormat: 'Functional Syntax' });
  }

  confirmDownload = async () => {
    let { rdfGraphToDownload, selectedFormat, fileName, diagramsToDownload } = this.state as any;
    if (!rdfGraphToDownload) return this.cancelDownload();
    if (diagramsToDownload.length > 0) rdfGraphToDownload = removeDiagramsFromRDFGraph(rdfGraphToDownload, diagramsToDownload);
    this.setState({ isDownloading: true });

    try {
      let owlText = selectedFormat === 'gscape' ? JSON.stringify(rdfGraphToDownload) : await this.props.getOwl(rdfGraphToDownload, selectedFormat);
      if (owlText['content']) {
        owlText = Base64.decode(owlText['content'])
      }
      downloadTextFile(owlText, fileName + getOntologyExtension(selectedFormat))

      message.success('Download completato');
      this.setState({ modalOpen: false, rdfGraphToDownload: undefined, fileName: 'ontology', diagramsToDownload: [], selectedFormat: 'Functional Syntax' });
    } catch (e) {
      message.error('Errore durante il download dell\'ontologia: ' + (e as Error).toString());
    } finally {
      this.setState({ isDownloading: false });
    }
  }

  /**
   * Resets the sparql endpoint to the one passed as config prop 
   */
  resetSPARQLEndpointConnection = () => {
    this.setState({ sparqlEndpointConnection: this.props.sparqlEndpointConnection })
    return this.props.sparqlEndpointConnection
  }

  onCreateObjectProperty = () => {
    if (this.state.grapholscape?.renderer.cy && this.state.lastSelectedElement?.data().type === TypesEnum.CLASS) {
      drawNewEdge(
        this.state.grapholscape.renderer.cy,
        TypesEnum.OBJECT_PROPERTY,
        this.state.lastSelectedElement,
        this.state.grapholscape.theme,
        (_, sourceNode, targetNode, addedEdge) => { // ehcomplete
          addedEdge.remove()
          this.setState({
            createObjectProperty: {
              sourceIri: this.state.lastSelectedElement?.data().iri,
              targetIri: targetNode.data().iri,
              sourceType: sourceNode.data().type,
              targetType: targetNode.data().type,
            }
          })
        })
    }
  }

  render() {
    return (
      <ApiContext.Provider value={{
        convertOWLToRDFGraph: (owl: Blob) => this.props.convertOWLToRDFGraph?.(owl) || ConvertApi.postOntologyDraftAIConvertOWL({ file: owl }),
        sparqlEndpointConnection: this.state.sparqlEndpointConnection,
        setSparqlEndpointURL: (newURL: string, importNamespaces = false) => {
          if (importNamespaces && this.state.grapholscape) {
            getNamespaces(newURL).then(namespaces => {
              namespaces.forEach(ns => this.state.grapholscape.ontology.addNamespace(ns))
            })
          }
          if (newURL !== undefined && newURL === this.props.sparqlEndpointConnection.endpointUrl)
            this.resetSPARQLEndpointConnection()
          else
            this.setState({ sparqlEndpointConnection: { endpointUrl: newURL } as SPARQLEndpointConnection })
        },
        resetSparqlEndpointConnection: this.resetSPARQLEndpointConnection
      }}>
        <Layout style={{ height: '100%' }}>
          <ToolbarContext.Provider value={{
            grapholscape: this.state.grapholscape,
            remoteCatalogEntities: this.state.remoteCatalogEntities,
            setRemoteCatalogEntities: this.setRemoteCatalogEntities,
            setDesignerAssistantSettings: (newSettings) => this.setState({
              designerAssistantSettings: newSettings
            }),
            designerAssistantSettings: this.state.designerAssistantSettings
          }}>
            {this.state.loading && <Spin />}
            <Layout.Content>
              <div id="grapholscape-container"
                style={{
                  visibility: this.state.loading ? 'hidden' : 'visible',
                  position: "relative",
                  height: "100%"
                }}>
                <div id="designer-ui-container"
                  style={{
                    zIndex: 1, position: "absolute",
                    height: "100%",
                    width: "100%",
                    pointerEvents: 'none',
                  }}
                >
                  <DesignerToolbar
                    style={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translate(-50%)' }}
                    grapholscape={this.state.grapholscape}
                    onSettingsClick={() => this.setState({ settingsOpen: true })}
                    saveDraftVisible={this.props.saveDraft !== undefined}
                    saveVersionVisible={this.props.saveVersion !== undefined}
                    removeDiagramDisabled={this.state.grapholscape?.ontology.diagrams.length <= 1}
                    objectPropEnabled={this.state.lastSelectedElement?.data().type === TypesEnum.CLASS}
                    helpVisible={!!this.props.userManualURL}
                    onNewDiagram={() => this.setState({ visibleNewDiagramModal: true })}
                    onRenameDiagram={() => this.setState({ visibleRenameDiagramModal: true })}
                    onRemoveDiagram={() => this.setState({ visibleRemoveDiagramModal: true })}
                    onDownload={() => this.openFormatModal()}
                    onNewClass={() => this.setState({ createClass: true })}
                    onNewIndividual={() => this.setState({ createIndividual: true })}
                    onPreviewOWLClick={() => this.setState({ visibleOWLDrawer: true })}
                    onNewDataProperty={() => { this.setState({ createDataProperty: true }) }}
                    onNewObjectProperty={() => this.onCreateObjectProperty()}
                    onEntityCatalogClick={() => this.setState({ entityCatalogOpen: !this.state.entityCatalogOpen })}
                    onLanguageChange={(evt) => {
                      this.setAdvancedValues({
                        ...this.state.advancedValues,
                        language: evt.detail,
                      })
                      if (!this.state.grapholscape.ontology.languages.includes(evt.detail)) {
                        this.state.grapholscape.ontology.languages.push(evt.detail)
                      }
                      this.state.grapholscape.setLanguage(evt.detail)
                      message.success(`Language changed to: ${evt.detail}`)
                    }}
                    onOntologyQueryClick={() => this.setState({ assistantVisible: this.state.assistantVisible !== 'explain' ? 'explain' : undefined })}
                    onHelpClick={() => this.setState({ userManualVisible: !this.state.userManualVisible })}
                    isAssistantRequestPending={this.state.isAssistantRequestPending}
                  ></DesignerToolbar>
                  <InfoBar grapholscape={this.state.grapholscape} />
                  <FormContext.Provider value={{
                    advancedValues: this.state.advancedValues,
                    setAdvancedValues: this.setAdvancedValues,
                    editEntity: this.editEntity,
                    referenceEntity: this.state.grapholscape?.selectedEntity,
                  }}>
                    {this.state.grapholscape && <ContextualMenu />}
                    <OWLDrawer
                      open={this.state.visibleOWLDrawer}
                      onClose={() => this.setState({ visibleOWLDrawer: false })}
                      fileName={this.state.grapholscape?.ontology.name || 'ontology'}
                      getOwl={async (format) => this.props.getOwl(
                        this.rdfGraph,
                        format)
                      }
                    />
                    <Modal
                      style={{ maxWidth: '90%', minWidth: 800 }}
                      open={this.state.settingsOpen}
                      title="Settings"
                      onCancel={() => this.setState({ settingsOpen: false })}
                      destroyOnHidden={true}
                      footer={null}
                      width={'fit-content'}
                    >
                      <Settings />
                    </Modal>

                    {(this.state.createClass || this.state.createIndividual) &&
                      <CreateClassAndIndividualModal
                        entityType={this.state.createClass ? TypesEnum.CLASS : TypesEnum.INDIVIDUAL}
                        onDone={() => this.setState({ createClass: false, createIndividual: false })}
                      />
                    }
                    {
                      (this.state.createDataProperty) &&
                      <CreateDataPropertyModal
                        onDone={() => this.setState({ createDataProperty: false })}
                      />
                    }

                    {this.state.createObjectProperty && this.state.lastSelectedElement &&
                      <CreateObjectPropertyModal
                        onDone={() => this.setState({ createObjectProperty: undefined })}
                        sourceIRI={this.state.createObjectProperty.sourceIri}
                        targetIRI={this.state.createObjectProperty.targetIri}
                        sourceType={this.state.createObjectProperty.sourceType}
                        targetType={this.state.createObjectProperty.targetType}
                      />
                    }

                    {(this.state.lastSelectedElement && this.state.createHierarchy) &&
                      <CreateClassAndIndividualModal
                        entityType={TypesEnum.CLASS}
                        formType="hierarchy"
                        onDone={() => this.setState({ createHierarchy: false })}
                      />
                    }

                    <Modal
                      title={this.state.visibleNewDiagramModal ? "Create New Diagram" : "Rename Diagram"}
                      open={this.state.visibleNewDiagramModal || this.state.visibleRenameDiagramModal}
                      onCancel={() => this.setState({ visibleNewDiagramModal: false, visibleRenameDiagramModal: false })}
                      destroyOnHidden={true}
                      getContainer={document.getElementById('root')}
                      footer={null}
                    >
                      <CreateEditDiagramForm
                        diagramName={this.state.visibleRenameDiagramModal
                          ? this.currentDiagram.name
                          : undefined
                        }
                        onDone={() => this.setState({ visibleNewDiagramModal: false, visibleRenameDiagramModal: false })} />
                    </Modal>

                    <Modal
                      title={<Flex gap={8}><ExclamationCircleOutlined /><>Delete Diagram</></Flex>}
                      open={this.state.visibleRemoveDiagramModal}
                      okType='danger'
                      cancelButtonProps={{ autoFocus: true }}
                      onOk={() => {
                        new OntologyBuilder(this.state.grapholscape).removeDiagram(this.currentDiagram)
                        message.success("Diagram Deleted")
                        this.setState({ visibleRemoveDiagramModal: false })
                      }}
                      onCancel={() => this.setState({ visibleRemoveDiagramModal: false })}
                    >
                      <Typography.Text>
                        If you delete this diagram, you will lose all the elements it contains.
                      </Typography.Text>
                    </Modal>
                    <Modal
                      open={this.state.modalOpen}
                      title={<span><DownloadOutlined style={{ marginRight: 8, marginBottom: 24, fontWeight: 'bold' }} />Download Ontology</span>}
                      onOk={this.confirmDownload}
                      onCancel={this.cancelDownload}
                      okButtonProps={{ disabled: !this.state.fileName }}
                      confirmLoading={this.state.isDownloading}
                    >
                      <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                        <Form labelCol={{ span: 8 }} layout="vertical">
                          <Form.Item label="File name:" required>
                            <Input
                              value={this.state.fileName}
                              onChange={(e) => this.setState({ fileName: e.target.value })}
                              placeholder={'File name (e.g., ontology)'}
                            />
                          </Form.Item>
                          <Form.Item label="Format:">
                            <Select
                              value={this.state.selectedFormat}
                              onChange={(value) => this.setState({ selectedFormat: value })}
                              options={[
                                { value: 'Functional Syntax', label: 'Functional Syntax' },
                                { value: 'RDF/XML', label: 'RDF/XML' },
                                { value: 'Turtle', label: 'Turtle' },
                                { value: 'gscape', label: 'GSCAPE' },
                              ]}
                            />
                          </Form.Item>
                          <Form.Item label="Diagrams to export:">
                            <Select
                              mode="multiple"
                              style={{ width: '100%' }}
                              placeholder="Please select diagrams to include. If none selected, all diagrams will be included."
                              value={this.state.diagramsToDownload.length > 0 ? this.state.diagramsToDownload : this.rdfGraph?.diagrams.map(d => {
                                return d.id
                              }) || []}
                              onChange={(value) => this.setState({ diagramsToDownload: value as number[] })}
                              options={(this.rdfGraph)?.diagrams.map(d => {
                                return {
                                  label: d.name,
                                  value: d.id
                                }
                              }) || []}
                            />
                          </Form.Item>
                        </Form>
                      </div>
                    </Modal>

                    <Drawer
                      title="Entity Catalog"
                      placement="right"
                      open={this.state.entityCatalogOpen}
                      onClose={() => this.setState({ entityCatalogOpen: false })}
                      width={'40%'}
                    >
                      <EntityCatalog />
                    </Drawer>

                    {this.props.userManualURL && <Drawer
                      title="User Manual"
                      placement="right"
                      open={this.state.userManualVisible}
                      onClose={() => this.setState({ userManualVisible: false })}
                      styles={{ body: { padding: 0, overflow: 'hidden' } }}
                      width={'50vw'}
                      extra={<Button
                        title="Open User Manual in New Tab"
                        onClick={() => window.open(this.props.userManualURL, '_blank')}
                        icon={GoLinkExternal({ size: "1.2em", })}></Button>}
                    >
                      <iframe
                        src={this.props.userManualURL}
                        height={'100%'}
                        width={'100%'}
                        style={{ border: 'none' }}>
                      </iframe>
                    </Drawer>}
                  </FormContext.Provider>
                </div>
              </div>
            </Layout.Content>
            {this.state.grapholscape && window["aiConfig"] && <>
              <Layout.Sider
                title='AI Ontology Designer Assistant'
                collapsed={this.state.assistantVisible === undefined}
                collapsedWidth={0}
                width="calc(35vw)"
              >
                {this.state.assistantVisible === 'design'
                  ? <AssistantContext.Provider value={{
                    setRequestHistory: (newHistory) => this.setState({ designerAssistantHistory: newHistory }),
                    requestHistory: this.state.designerAssistantHistory,
                    onClose: () => this.setState({ assistantVisible: undefined }),
                    isAssistantRequestPending: this.state.isAssistantRequestPending,
                    setIsAssistantRequestPending: (isPending: boolean) => this.setState({ isAssistantRequestPending: isPending })
                  }}>
                    <DesignerAssistant />
                  </AssistantContext.Provider>
                  : <AssistantContext.Provider value={{
                    setRequestHistory: (newHistory) => this.setState({ explainerAssistantHistory: newHistory }),
                    requestHistory: this.state.explainerAssistantHistory,
                    onClose: () => this.setState({ assistantVisible: undefined }),
                    isAssistantRequestPending: this.state.isAssistantRequestPending,
                    setIsAssistantRequestPending: (isPending: boolean) => this.setState({ isAssistantRequestPending: isPending })
                  }}>
                    <ExplainerAssistant />
                  </AssistantContext.Provider>}
              </Layout.Sider>
            </>}
          </ToolbarContext.Provider>
        </Layout>
      </ApiContext.Provider>
    );
  }
}
