import { AutoComplete, Button, Form, Input, Select, Tabs } from "antd"
import { useForm } from 'antd/lib/form/Form'
import TextArea from "antd/lib/input/TextArea"
import { Annotation, DefaultAnnotationProperties, Language } from "grapholscape"
import { useContext, useState } from "react"
import { RiSparkling2Line } from "react-icons/ri"
import { aiDarkColor, aiLightColor } from "src/css/ai-style"
import { ToolbarContext } from "src/pages/designer/ToolbarContext"
import { datatypes, formItemStyle, getAnnotationPropertyDisplayName } from "src/utils/utils"
import { AnnotationInfo, FormProps } from "../entity-form-props"

export type AnnotationFormProps = FormProps & {
  referenceAnnotation?: Annotation,
  handleDescriptionAskAI?: () => Promise<string | undefined>,
  defaultInput?: AnnotationInfo,
  /**
   * if false, the form is used for editing annotations of non-entities (e.g. ontology)
   * and in this case the AI description is not available
   */
  isDomainEntity: boolean, 
}

export default function AnnotationForm(props: AnnotationFormProps) {

  const { grapholscape } = useContext(ToolbarContext)

  const properties = grapholscape?.ontology.getAnnotationProperties()
  const namespaces = grapholscape?.ontology.namespaces
  const language = grapholscape?.language || Language.EN
  const languages = grapholscape?.ontology.languages

  let currentTab = props.referenceAnnotation?.hasIriValue ? 'IRI' : 'LexicalForm'
  const defaultInputValue: AnnotationInfo = props.defaultInput || {
    property: 'http://www.w3.org/2000/01/rdf-schema#label',
    range: '',
    datatype: 'rdf:PlainLiteral',
    language: language || '',
    hasIRIRange: false
  }
  const editMode = props.referenceAnnotation !== undefined
  const inputs: AnnotationInfo[] = editMode
    ? [{
      property: props.referenceAnnotation?.property,
      range: props.referenceAnnotation?.value,
      datatype: props.referenceAnnotation?.datatype,
      language: props.referenceAnnotation?.language,
      hasIRIRange: props.referenceAnnotation?.hasIriValue
    }]
    : [defaultInputValue]

  const form = useForm()[0]
  const [loadingAI, setLoadingAI] = useState(false)
  const [enableAI, setEnableAI] = useState(editMode
    ? window["aiConfig"] && props.referenceAnnotation?.property === DefaultAnnotationProperties.comment.fullIri && props.isDomainEntity
    : false
  )

  function handleSubmit() {
    const hasIRIRange = currentTab === 'IRI'
    let annotationInfo: AnnotationInfo
    if (hasIRIRange) {
      const property = form.getFieldValue('property')
      const range = form.getFieldValue('namespace') + form.getFieldValue('input').trim()
      annotationInfo = { property: property, range: range, hasIRIRange: hasIRIRange }
    } else {
      const property = form.getFieldValue('property')
      const range = form.getFieldValue('lexicalForm').trim()
      const datatype = form.getFieldValue('datatype')
      const lang = form.getFieldValue('language')
      annotationInfo = { property: property, range: range, datatype: datatype, language: lang, hasIRIRange: hasIRIRange }
    }
    form.validateFields()
      .then(() => props.onOk && props.onOk(annotationInfo))
      .catch(() => { console.log('error on annotation edit') })
  }

  function changeTab(key) {
    currentTab = key
  }

  async function handleDescriptionAskAI() {
    if (props.handleDescriptionAskAI) {
      setLoadingAI(true)
      props.handleDescriptionAskAI()
        .then(description => {
          if (description) {
            form.setFieldValue('lexicalForm', description)
          }
        })
        .finally(() => setLoadingAI(false))
    }
  }

  function handleAnnotationIRIChange(newAnnotationIRI: string) {
    setEnableAI(window["aiConfig"] && DefaultAnnotationProperties.comment.equals(newAnnotationIRI) && props.isDomainEntity)
  }

  return (
    <>
      <Form
        form={form}
        name="ann-property-form"
        // size="small"
        initialValues={{
          property: inputs[0].property,
          lexicalForm: inputs[0].hasIRIRange ? '' : inputs[0].range,
          datatype: inputs[0].datatype,
          language: inputs[0].language,
          namespace: props.referenceAnnotation?.hasIriValue ? props.referenceAnnotation.rangeIri?.namespace?.value : '',
          input: props.referenceAnnotation?.hasIriValue ? props.referenceAnnotation.rangeIri?.remainder : ''
        }}
        wrapperCol={{ span: 24 }}
        labelCol={{ span: 8 }}
        style={{ maxWidth: 600 }}
        colon={false}
      >
        <Form.Item
          name='property'
          label="Property"
          rules={[
            { required: true, message: 'Property is required.' },
            { type: "url", message: "Property must be a valid IRI." },
          ]}>
          <Select
            showSearch
            options={properties?.sort((a, b) => a.fullIri.localeCompare(b.fullIri))
              .map(ns => ({
                value: ns.fullIri,
                label: getAnnotationPropertyDisplayName(ns)
              })) || []
            }
            placeholder="Input a valid property"
            //children={<Input type="url"></Input>}
            filterOption={(inputValue, option) => (
              properties?.find(ns => inputValue === ns.fullIri) !== undefined || // if option selected shows all suggestions
              option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            )}
            onChange={handleAnnotationIRIChange}
          />
        </Form.Item>
        <Tabs defaultActiveKey={currentTab} onChange={changeTab} items={[
          {
            label: 'Lexical Form',
            key: 'LexicalForm',
            children: <>
              <Form.Item label="Lexical Form:" name="lexicalForm" required>
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item
                name='datatype'
                label="Datatype"
              >
                <Select
                  showSearch
                  options={datatypes?.sort((a, b) => a.localeCompare(b)).map(d => ({ value: d, label: d })) || []}
                  //children={<Input></Input>}
                  filterOption={(inputValue, option) => (
                    datatypes.find(d => inputValue === d) !== undefined || // if option selected shows all suggestions
                    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  )}
                />
              </Form.Item>

              <Form.Item
                name='language'
                label="Language"
              >
                <AutoComplete
                  options={languages?.map(l => ({ value: l, label: l })) || []}
                  filterOption={(inputValue, option) => (
                    languages?.find(l => inputValue === l) !== undefined || // if option selected shows all suggestions
                    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  )}
                />
              </Form.Item>
            </>
          },
          {
            label: 'IRI',
            key: 'IRI',
            children: <>
              <Form.Item
                name='namespace'
                label="Namespace"
                required>
                <Select
                  showSearch
                  options={namespaces?.sort((a, b) => (
                    a.prefixes.join(' - ').localeCompare(b.prefixes.join(' - '))
                  )).map(ns => ({ value: ns.value, label: ns.prefixes.join(' - ') })) || []}
                  placeholder="Input a valid namespace"
                  //children={<Input type="url"></Input>}
                  filterOption={(inputValue, option) => (
                    namespaces?.find(ns => inputValue === ns.value) !== undefined || // if option selected shows all suggestions
                    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                  )}
                />
              </Form.Item>
              <Form.Item label="Input:" name="input" required>
                <Input />
              </Form.Item>
            </>
          }
        ]} />


      </Form >
      <Form.Item style={{ ...formItemStyle, marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'end' }}>
          {enableAI && <Button
            style={{
              background: `linear-gradient(135deg, ${aiDarkColor}, ${aiLightColor})`
            }}
            icon={<i>{RiSparkling2Line({})}</i>}
            onClick={handleDescriptionAskAI}
            loading={loadingAI}
          >Ask AI</Button>}
          <Button onClick={props.onCancel} >Cancel</Button>
          <Button type="primary" onClick={handleSubmit}>Ok</Button>
        </div>
      </Form.Item>
    </>
  )
}