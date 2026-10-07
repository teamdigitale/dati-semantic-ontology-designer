import { ClearOutlined, ImportOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Flex, Form, FormInstance, Input, Popover, Select, Upload } from 'antd';
import { RcFile } from 'antd/es/upload';
import { ButtonProps } from 'antd/lib';
import dayjs, { Dayjs } from 'dayjs';
import { Annotation, GrapholEntity, Iri, RDFGraphParser } from 'grapholscape';
import React, { Component, useContext } from 'react';
import ParsingClient from 'sparql-http-client/ParsingClient';
import { ResultRow } from 'sparql-http-client/ResultParser';
import { GrapholscapeDesigner } from 'src/builder';
import OntologyBuilder from 'src/builder/ontology-builder';
import { MWSXMetadataTriple, MWSXOntologyCatalogOntologyMetadataSet, RDFGraph } from 'src/gen';
import { ApiContext } from 'src/lib';
import { message, MetadataApi, showError } from 'src/store/store';
import { dataTypes, dateFormatRDF, downloadTextFile, rdfType } from 'src/utils/utils';
import { SPARQLEndpointConnection } from '../../ApiContext';
import { ToolbarContext } from '../../ToolbarContext';
import { ndc, ndcPrefixes } from './metadataProperties';
import { FormatEnum } from 'src/model';

const metadataProperty = ndc


interface ComponentProps {
  disabled: boolean
  standalone?: boolean
  importedFile?: File
  onSave?: (metadataSet: MWSXOntologyCatalogOntologyMetadataSet) => Promise<void>
  saveButtonText?: string
  saveButtonProps?: ButtonProps
}

interface PropsFromContext {
  grapholscape?: GrapholscapeDesigner,
  sparqlEndpointConnection?: SPARQLEndpointConnection,
  convertOWLToRDFGraph: Function
}

type Props = ComponentProps & PropsFromContext

interface State {
  submitting: boolean,
  dirty: boolean,
  language: string,
  importLoading: boolean,
  randomForRerender?: number,
  annotations: Annotation[]
}

class OntologyMetadataFormCC extends Component<Props, State> {
  form = React.createRef<FormInstance>()
  state: State = {
    submitting: false,
    dirty: false,
    language: 'en',
    importLoading: false,
    annotations: [],
  }

  componentDidMount() {
    this.setState({ annotations: this.props.grapholscape?.ontology.getAnnotations() || [] })
    this.setForm()
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.language !== this.state.language || prevState.annotations !== this.state.annotations) {
      this.setForm()
    }

    if (prevProps.grapholscape !== this.props.grapholscape) {
      this.form.current.resetFields()
      this.setState({ annotations: this.props.grapholscape?.ontology.getAnnotations() || [] })
    }
  }

  setForm = () => {
    const values: Record<string, any> = {}
    this.state.annotations?.forEach(annotation => {
      const mp = metadataProperty.find(p => p.iri === annotation.propertyIri.fullIri)
      if (mp) {
        let value: string | Dayjs = annotation.value
        if (mp.dataType === dataTypes.dateTime) {
          const d = dayjs(value)
          if (d.isValid()) {
            value = d
          } else {
            console.error('Invalid date found: ', value)
          }
        }
        if (annotation.language) {
          if (this.props.disabled) {
            if (annotation.language === this.state.language) {
              values[annotation.propertyIri.fullIri] = value
            }
          } else {
            if (!values[annotation.propertyIri.fullIri]) {
              values[annotation.propertyIri.fullIri] = {}
            }
            values[annotation.propertyIri.fullIri][annotation.language] = value
          }
        } else {
          if (values[annotation.propertyIri.fullIri] && mp.multiple) {
            const exValue = values[annotation.propertyIri.fullIri]
            if (Array.isArray(exValue)) {
              values[annotation.propertyIri.fullIri] = [...exValue, value]
            } else {
              values[annotation.propertyIri.fullIri] = [exValue, value]
            }
          } else {
            values[annotation.propertyIri.fullIri] = value
          }
        }
      }
    });
    this.form.current?.setFieldsValue(values)
  }

  addIndividualIriMetadata = async (iri: string) => {
    const ontologyBuilder = new OntologyBuilder(this.props.grapholscape)
    if (this.props.sparqlEndpointConnection) {
      try {
        const parsingClient = new ParsingClient(this.props.sparqlEndpointConnection)
        const results = await parsingClient.query.select(`
      select ?p ?o
      {
        <${iri}> ?p ?o
      }
      `)

        results.forEach((row: ResultRow) => {
          if (row.p.value === rdfType) {
            ontologyBuilder.addIndividualAndClassElementsForMetadata(iri, row.o.value)
          } else {
            let ge = this.props.grapholscape?.ontology.getEntity(iri)
            if (!ge) {
              ge = new GrapholEntity(new Iri(iri, this.props.grapholscape?.ontology.namespaces || []))
              this.props.grapholscape?.ontology.addEntity(ge)
            }
            const a = new Annotation(
              new Iri(row.p.value, []),
              row.o.value,
              undefined,
              dataTypes.plainLiteral,
            )
            ge.getAnnotations().forEach(existingAnn => {
              if (a.property === existingAnn.property) {
                if (existingAnn.language) {
                  if (a.language === existingAnn.language) {
                    ge.removeAnnotation(existingAnn)
                  }
                } else {
                  ge.removeAnnotation(existingAnn)
                }
              }
            })
            ge.addAnnotation(a)
          }
        })
      } catch (error: any) {
        showError(`Error fetching metadata of the individual. <${iri}>. ${error.message}`)
        console.error('Error fetching metadata of the individual:', error)
      }
    }
  }

  removeAnnotationByProperty = (property: string, language?: string) => {
    this.props.grapholscape?.ontology.getAnnotations().forEach(existingAnn => {
      if (property === existingAnn.property) {
        if (existingAnn.language && language) {
          if (language === existingAnn.language) {
            this.props.grapholscape?.ontology.removeAnnotation(existingAnn)
          }
        } else {
          this.props.grapholscape?.ontology.removeAnnotation(existingAnn)
        }
      }
    })
  }

  replaceOntologyAnnotaton = (a: Annotation) => {
    this.removeAnnotationByProperty(a.property, a.language)
    this.props.grapholscape?.ontology.addAnnotation(a)
  }

  submit = async (values) => {
    this.setState({ submitting: true })
    // add ndc metadata prefixes before adding any new entity to the ontology
    // otherwise entity creation step won't find them set in the namespaces list => no prefixes
    ndcPrefixes.forEach(ndcNamespace => this.props.grapholscape?.ontology.addNamespace(ndcNamespace))
    for (const i of Object.keys(values)) {
      const mp = metadataProperty.find(p => p.iri === i)
      if (values[i]) {
        if (values[i].$isDayjsObject) {
          // DATES
          this.removeAnnotationByProperty(i)
          const a = new Annotation(
            new Iri(i, ndcPrefixes),
            values[i].format(dateFormatRDF),
            undefined,
            mp?.dataType
          )
          this.replaceOntologyAnnotaton(a)
        } else if (Array.isArray(values[i])) {
          // MULTIVALUE
          this.removeAnnotationByProperty(i)
          for (const j of values[i]) {
            if (mp?.isIri) {
              try {
                await this.addIndividualIriMetadata(j)
              } catch (error) {
                console.error(error)
              }
            }
            const a = new Annotation(
              new Iri(i, ndcPrefixes),
              mp?.isIri ? new Iri(j, ndcPrefixes) : j,
              undefined,
              mp?.dataType
            )
            this.replaceOntologyAnnotaton(a)
          }
        } else if (typeof values[i] === 'object') {
          //MULTILANG
          Object.keys(values[i]).forEach(lang => {
            this.removeAnnotationByProperty(i, lang)
            if (values[i][lang]) {
              const a = new Annotation(
                new Iri(i, ndcPrefixes),
                values[i][lang],
                lang,
                mp?.dataType
              )
              this.replaceOntologyAnnotaton(a)
            }
          })
        } else {
          if (mp?.isIri) {
            await this.addIndividualIriMetadata(values[i])
          }
          const a = new Annotation(
            new Iri(i, ndcPrefixes),
            mp?.isIri ? new Iri(values[i], ndcPrefixes) : values[i],
            undefined,
            mp?.dataType
          )
          this.replaceOntologyAnnotaton(a)
        }
      } else {
        this.removeAnnotationByProperty(i)
      }
    }
    message.success('Ontology metadata saved successfully.')
    this.setState({ submitting: false })
  }

  submitStandalone = async (values) => {
    const metadataTriples: MWSXMetadataTriple[] = []
    this.setState({ submitting: true })
    for (const i of Object.keys(values)) {
      if (i === 'newVersion') {
        continue
      }
      const mp = metadataProperty.find(p => p.iri === i)
      if (values[i]) {
        if (values[i].$isDayjsObject) {
          // DATES
          metadataTriples.push({
            subject: { iri: this.props.grapholscape.ontology.iri },
            predicate: { iri: i },
            object: {
              value: values[i].format(dateFormatRDF),
              isIri: false,
              datatypeIri: mp?.dataType
            }
          })

        } else if (Array.isArray(values[i])) {
          // MULTIVALUE
          this.removeAnnotationByProperty(i)
          for (const j of values[i]) {
            metadataTriples.push({
              subject: { iri: this.props.grapholscape.ontology.iri },
              predicate: { iri: i },
              object: {
                value: j,
                iri: j,
                isIri: mp?.isIri || false,
                datatypeIri: mp?.dataType
              }
            })
          }
        } else if (typeof values[i] === 'object') {
          //MULTILANG
          Object.keys(values[i]).forEach(lang => {
            this.removeAnnotationByProperty(i, lang)
            if (values[i][lang]) {
              metadataTriples.push({
                subject: { iri: this.props.grapholscape.ontology.iri },
                predicate: { iri: i },
                object: {
                  value: values[i][lang],
                  isIri: false,
                  lang,
                  datatypeIri: mp?.dataType
                }
              })
            }
          })
        } else {
          if (mp?.isIri) {
            await this.addIndividualIriMetadata(values[i])
          }
          metadataTriples.push({
            subject: { iri: this.props.grapholscape.ontology.iri },
            predicate: { iri: i },
            object: {
              value: values[i],
              iri: values[i],
              isIri: mp?.isIri || false,
              datatypeIri: mp?.dataType
            }
          })
        }
      }
    }
    try {
      const fileWithMetadataString = await MetadataApi.postAIOntologyDraftMetadata({
        file: this.props.importedFile,
        format: FormatEnum.TURTLE,
        newVersion: values['newVersion'],
        metadata: { metadataTriples: metadataTriples },
      });
      downloadTextFile(fileWithMetadataString, this.props.importedFile.name)
      message.success('Download of the metadata enriched ontology started.')
    } finally {
      this.setState({ submitting: false })
    }
  }

  importMetadata = (file: RcFile) => {
    this.setState({ importLoading: true })
    let fileType = file.name.endsWith('.owl')
      || file.name.endsWith('.ttl')
      || file.name.endsWith('.n3')
      || file.name.endsWith('.rdf') ? '.owl' : null
    if (!fileType) {
      fileType = file.name.endsWith('.gscape') ? '.gscape' : null
    }
    if (!fileType) {
      message.error('You can only upload OWL or GSCAPE file! Found ' + file.type);
      this.setState({ importLoading: false });
    } else if (fileType === '.gscape') {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          this.onConverted(JSON.parse(reader.result as string))
        }
      });
      reader.readAsText(file);
    } else {
      this.props.convertOWLToRDFGraph(file, fileType)
        .then(this.onConverted)
        .catch(() => this.setState({ importLoading: false }))
    }
    return false
  }

  onConverted = (res: RDFGraph) => {
    if (res) {
      this.setState({ annotations: RDFGraphParser.getOntology(res).getAnnotations() || [] })
      this.setForm()
    }
    this.setState({ importLoading: false })
  }
  render() {
    const formItemLayout = {
      labelCol: {
        lg: { span: 4 }
      },
      wrapperCol: {
        lg: { span: 20 }
      }
    }

    return (
      <Flex vertical gap={16} style={{ height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'right' }}>
          {this.props.disabled && <Form.Item label='Language' style={{ margin: 0 }}>
            <Select
              style={{ width: 100 }}
              value={this.state.language}
              options={[{ label: 'English', value: 'en' }, { label: 'Italian', value: 'it' }]}
              onSelect={language => {
                this.setState({ language })
              }} />
          </Form.Item>}
        </div>
        <Form
          {...formItemLayout}
          disabled={this.props.disabled}
          ref={this.form}
          onChange={() => this.setState({ dirty: true })}
          onFinish={this.props.standalone ? this.submitStandalone : this.submit}
          style={{ height: '100%', overflow: 'hidden' }}
        >
          <Flex gap={8} vertical style={{ height: '100%' }}>
            <div style={{ overflow: 'auto' }}>
              {this.props.standalone && <Form.Item
                key="newVersion"
                name="newVersion"
                label="New Version IRI:"
                rules={[
                  { required: true, message: 'Please enter Ontology Version IRI' },
                  { type: 'url' },
                ]}>
                <Input />
              </Form.Item>}
              {metadataProperty.map(i => {
                return <Form.Item
                  key={i.iri}
                  name={!this.props.disabled && i.lang ? undefined : i.iri}
                  label={<Popover
                    placement='left'
                    content={
                      <a href={i.iri} target='_blank' rel='noopener noreferrer'>{i.iri}</a>
                    }>{i.label}</Popover>}>
                  {React.cloneElement(
                    this.props.disabled && i.singleComponent ? i.singleComponent : i.component,
                    {
                      grapholscape: this.props.grapholscape,
                      language: this.state.language,
                      endpointconnection: this.props.sparqlEndpointConnection,
                      parentForm: this.form.current,
                      refresh: () => this.setState({ randomForRerender: Math.random() }),
                      randomForRerender: this.state.randomForRerender
                    }
                  )}
                </Form.Item>
              })}
            </div>
            {!this.props.disabled && <Flex justify='end' gap={4}>
              <Button icon={<ClearOutlined />} onClick={() => this.form.current?.resetFields()}>Clear</Button>
              <Upload fileList={[]} beforeUpload={this.importMetadata}>
                <Button icon={<ImportOutlined />} loading={this.state.importLoading}>
                  Import
                </Button>
              </Upload>
              <Button htmlType='submit' type="primary" loading={this.state.submitting} icon={<SaveOutlined />} {...this.props.saveButtonProps}>
                {this.props.saveButtonText || 'Save'}
              </Button>
            </Flex>}
          </Flex>
        </Form>
      </Flex>

    )
  }
}

export default function OntologyMetadataForm(props: ComponentProps) {
  return <OntologyMetadataFormCC {...props} {...useContext(ToolbarContext)} {...useContext(ApiContext)} />
}