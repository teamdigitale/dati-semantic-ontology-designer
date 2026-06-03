import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { Literal } from '@rdfjs/types';
import { Button, Descriptions, Drawer, Form, Popover, Select, Spin, Tag, Tooltip } from 'antd';
import { FormInstance } from 'antd/lib';
import { Annotation, Iri, RendererStatesEnum, TypesEnum } from 'grapholscape';
import React, { Component } from 'react';
import ParsingClient from 'sparql-http-client/ParsingClient';
import { GrapholscapeDesigner } from 'src/builder';
import OntologyBuilder from 'src/builder/ontology-builder';
import { message, showError } from 'src/store/store';
import { MetadataProperty, ndcPrefixes } from './metadataProperties';
import { SPARQLEndpointConnection } from '../../ApiContext';

class MetadataIndividualSelector extends Component<{
  annotations?: Annotation[],
  endpointconnection?: SPARQLEndpointConnection,
  property: string,
  iri: string,
  title: string,
  metadataProperty: MetadataProperty[],
  grapholscape?: GrapholscapeDesigner,
  language?: string,
  parentForm?: FormInstance
}> {
  form = React.createRef<FormInstance>()
  state = {
    loadingIndividual: true,
    annotations: new Map<string, Annotation[]>(),
    individualIRIs: [],
    editIndividual: null as string | null,
    definedIndividuals: [] as { iri: string, descriptions: React.ReactElement }[],
    drawerVisible: false,
    submitting: false
  }

  componentDidMount() {
    this.updateAnnotations()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.loadingIndividual !== this.state.loadingIndividual) {
      this.exec()
    }
    if (this.state.editIndividual && this.state.editIndividual !== prevState.editIndividual) {
      this.editIndividual()
    }
  }

  updateAnnotations = () => {
    const annotations = this.props.annotations?.filter(i => i.propertyIri.fullIri === this.props.property) || []
    const individualIRIs: string[] = []
    let map = new Map<string, Annotation[]>()
    if (annotations.length > 0) {
      for (let annotation of annotations) {
        const annotations = this.props.grapholscape.ontology.entities[annotation.value].annotations || []
        map.set(annotation.value, annotations)
        individualIRIs.push(annotation.value)
      }
    }
    for (let diagram of this.props.grapholscape.ontology.diagrams.values()) {
      const classNode = diagram.representations.get(RendererStatesEnum.FLOATY)?.cy?.$(`[iri = "${this.props.iri}"]`)
      const individualNodes = classNode.incomers(`[type = "${TypesEnum.INSTANCE_OF}"]`).sources()
      individualNodes.forEach(individualNode => {
        individualIRIs.push(individualNode.attr('iri'))
      })
    }
    this.setState({ annotations: map, individualIRIs, loadingIndividual: false })
  }

  exec = async () => {
    try {
      const parsingClient = new ParsingClient(this.props.endpointconnection)
      const results = await parsingClient.query.select(`
    select distinct *
    {
      ?x a <${this.props.iri}>.
      ${this.props.metadataProperty.map((i, index) => i.iri === 'iri'
        ? ''
        : `OPTIONAL { 
        ?x <${i.iri}> ?y${index}.
        ${i.lang ? `FILTER(lang(?y${index})='${this.props.language}')` : ''}
      }.`).join('\n')}
    }
    ORDER BY ?x`)
      this.setState({
        definedIndividuals: results.map(row => ({
          iri: row.x.value,
          descriptions: this.props.metadataProperty.map((i, index) => {
            return <Descriptions.Item
              label={i.label}
              key={i.label}>{(index === 0 ? row.x : row['y' + index])?.value}
            </Descriptions.Item>
          })
        }))
      })
    }
    catch (error) {
      showError(`Error fetching individuals of the class <${this.props.iri}>. ${error.message}`)
      console.error('Error fetching individuals of the class:', error)
    }
  }

  submit = async (values) => {
    this.setState({ submitting: true })
    // ADD "INSTANCE OF" TO ONTOLOGY
    // values.iri -> rdfType -> this.props.iri
    const ontologyBuilder = new OntologyBuilder(this.props.grapholscape)
    ontologyBuilder.addIndividualAndClassElementsForMetadata(values.iri, this.props.iri)
    const ge = this.props.grapholscape.ontology.getEntity(values.iri)
    if (!ge) return

    Object.keys(values).forEach(i => {
      const mp = this.props.metadataProperty.find(p => p.iri === i)
      if (values[i] && i !== 'iri') {
        if (typeof values[i] === 'object') {
          //MULTILANG
          Object.keys(values[i]).forEach(lang => {
            values[i][lang] && ge.addAnnotation(new Annotation(
              new Iri(i, ndcPrefixes),
              values[i][lang],
              lang,
              mp?.dataType,
            ))
          })
        } else {
          ge.addAnnotation(new Annotation(
            new Iri(i, ndcPrefixes),
            mp?.isIri ? new Iri(values[i], ndcPrefixes) : values[i],
            undefined,
            mp?.dataType,
          ))
        }
      }
    })
    try {
      message.success(this.props.title + ' added!')
      this.updateAnnotations()
      this.props.parentForm?.setFieldValue(
        this.props.property,
        [...(this.props.parentForm?.getFieldValue(this.props.property) || []), values.iri])
      this.setState({ submitting: false, drawerVisible: false })
    } catch (error) {
      console.error(error)
      this.setState({ submitting: false })
    }
  }

  editIndividual = async () => {
    const iri = this.state.editIndividual
    if (!iri) return
    let values = { iri }
    const inOntology = this.state.annotations.get(iri)
    if (inOntology) {
      inOntology.forEach(i => {
        if (i.language) {
          if (!values[i.propertyIri.fullIri]) {
            values[i.propertyIri.fullIri] = {}
          }
          values[i.propertyIri.fullIri][i.language] = i.value
        } else {
          values[i.propertyIri.fullIri] = i.value
        }
      })
    } else {
      const parsingClient = new ParsingClient(this.props.endpointconnection)
      const results = await parsingClient.query.select(`
        select distinct *
        {
          ?x a <${this.props.iri}>.
          filter(?x=<${iri}>)
          ${this.props.metadataProperty.map((i, index) => i.iri === 'iri'
        ? ''
        : `OPTIONAL { 
            ?x <${i.iri}> ?y${index}.
          }.`).join('\n')}
        }`)
      results.forEach(row => Object.entries(row).forEach(([key, cell], index) => {
        const propertyIri = this.props.metadataProperty[index].iri
        if ((cell as Literal).language) {
          if (!values[propertyIri]) {
            values[propertyIri] = {}
          }
          values[propertyIri][(cell as Literal).language] = cell.value
        } else {
          values[propertyIri] = cell.value
        }
      }))
    }
    this.form.current?.setFieldsValue(values)
    this.setState({ editIndividual: null })
  }

  render() {
    const formItemLayout = {
      labelCol: {
        sm: { span: 24 },
        xl: { span: 6 }

      },
      wrapperCol: {
        sm: { span: 24 },
        xl: { span: 18 }
      }
    }
    const options: { label: React.ReactNode, value: string }[] = []
    if (this.state.definedIndividuals) {
      this.state.definedIndividuals.forEach(i => {
        !options.find(ii => ii.value === i.iri) && options.push({
          label: <Popover
            placement='left'
            content={
              this.state.loadingIndividual
                ? <Spin size='small' />
                : <div>
                  <Descriptions bordered size='small' column={1} style={{ width: 550 }}>
                    {i.descriptions}
                  </Descriptions>
                  {/* <div style={{ marginTop: 6, textAlign: 'center' }}>
                    <Button icon={<EditOutlined />}
                      onClick={() => this.setState({ drawerVisible: true, editIndividual: i.iri })}>Edit</Button>
                  </div> */}
                </div>}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>{i.iri}<Tag color='blue'>external</Tag></div>
          </Popover>,
          value: i.iri
        })
      })
    }
    if (this.state.individualIRIs.length > 0) {
      this.state.individualIRIs.forEach(individualIRI => {
        !options.find(i => i.value === individualIRI) && options.push(
          {
            label: <Popover
              placement='left'
              content={
                this.state.loadingIndividual
                  ? <Spin size='small' />
                  : <div>

                    <Descriptions bordered size='small' column={1} style={{ width: 550 }}>
                      {this.props.metadataProperty.map(i => {
                        let value
                        if (i.iri === 'iri') {
                          value = individualIRI
                        } else {
                          value = this.state.annotations.get(individualIRI)
                            ?.find(a => !a.language ? a.propertyIri.fullIri === i.iri : a.propertyIri.fullIri === i.iri && a.language === this.props.language)?.value
                        }
                        return <Descriptions.Item
                          label={i.label}
                          key={i.label}>{value}
                        </Descriptions.Item>
                      })}
                    </Descriptions>
                    <div style={{ marginTop: 6, textAlign: 'center' }}>
                      <Button icon={<EditOutlined />}
                        onClick={() => this.setState({ drawerVisible: true, editIndividual: individualIRI })}>Edit</Button>
                    </div>
                  </div>}>
              {individualIRI}
            </Popover>,
            value: individualIRI
          }
        )
      })
    }

    return (
      (<div style={{ display: 'flex', gap: 4 }}>
        <Form.Item name={this.props.property} style={{ width: '100%', margin: 0 }}>
          <Select options={options} mode='multiple' />
        </Form.Item>
        <Button icon={<PlusOutlined />} onClick={() => this.setState({ drawerVisible: true })} />
        <Drawer
          title={<span>Add <Tooltip title={
            <a href={this.props.iri} target='_blank' rel='noopener noreferrer'>{this.props.iri}</a>
          }>{this.props.title}</Tooltip> to ontology</span>}
          open={this.state.drawerVisible}
          width={700}
          onClose={() => this.setState({ drawerVisible: false })}
        >
          <Form {...formItemLayout} onFinish={this.submit} ref={this.form}>
            {this.props.metadataProperty.map(i => {
              return <Form.Item
                rules={i.iri === 'iri' ? [{ required: true }] : undefined}
                key={i.iri}
                name={i.lang ? undefined : i.iri}
                label={<Tooltip title={
                  <a href={i.iri} target='_blank' rel='noopener noreferrer'>{i.iri}</a>
                }>{i.label}</Tooltip>}>
                {i.component}
              </Form.Item>
            })}
            <Form.Item style={{ textAlign: 'center' }}>
              <Button onClick={() => this.setState({ drawerVisible: false })} style={{ marginRight: 8 }}>
                Cancel
              </Button>
              <Button htmlType='submit' type="primary" loading={this.state.submitting}>
                Save
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
      </div>)
    );
  }
}

export default MetadataIndividualSelector;