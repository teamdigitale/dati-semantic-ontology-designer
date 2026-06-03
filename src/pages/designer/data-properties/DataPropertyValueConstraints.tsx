import { Col, Form, Input, InputNumber, Row, Select } from "antd";
import { GrapholEntity, Grapholscape, NeighbourhoodFinder } from "grapholscape";
import { formItemStyle } from "src/utils/utils";

export default function getValueConstraints(datatype: string, initialValues) {
  if (datatype) {
    if (isNumeric(datatype)) {
      return (
        <Row>
          <Col flex={'195px'} >
            <Form.Item name="minValueType" style={{ marginLeft: 95, marginBottom: 4 }} initialValue={initialValues.minValueType}>
              <Select
                defaultValue={">"}
                options={[
                  { value: '>', label: '>' },
                  { value: '>=', label: '>=' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col flex={'124px'} style={{ marginLeft: '16px' }}>
            <Form.Item name="minValue" style={formItemStyle} initialValue={initialValues.minValue}>
              <InputNumber min={0} /*defaultValue={3}*/ />
            </Form.Item>
          </Col>
          <Col flex={'100px'}>
            <Form.Item name="maxValueType" style={formItemStyle} initialValue={initialValues.maxValueType}>
              <Select
                defaultValue={"<"}
                options={[
                  { value: '<', label: '<' },
                  { value: '<=', label: '<=' },
                ]}
              />
            </Form.Item>
          </Col>
          <Col flex={'124px'} style={{ marginLeft: '16px' }} >
            <Form.Item name="maxValue" style={formItemStyle} initialValue={initialValues.maxValue}>
              <InputNumber min={0} /*defaultValue={3}*/ />
            </Form.Item>
          </Col>
        </Row>
      )
    } else if (datatype === 'xsd:string') {
      return (
        <>
          <Row >
            <Form.Item name="minLengthValue" style={{ marginLeft: 35, marginRight: 100, marginBottom: 4 }} label='Min. Length:' labelCol={{ span: 21 }} initialValue={initialValues.minLengthValue}>
              <InputNumber min={0} max={1000} style={{ width: 110 }}/*defaultValue={3}*/ />
            </Form.Item>
            <Form.Item name="maxLengthValue" style={formItemStyle} label='Max. Length:' /*labelCol={{ span: 40 }}*/ initialValue={initialValues.maxLengthValue}>
              <InputNumber min={0} max={1000} style={{ width: 110 }}/*defaultValue={3}*/ />
            </Form.Item>
          </Row>
          <Form.Item label={'Regex:'} name={'regex'} style={{ marginBottom: 4 }} labelCol={{ span: 6 }} initialValue={initialValues.regex}>
            <Input style={{ width: 330 }} />
          </Form.Item>
        </>
      )
    }
  }
  return null
}

export function getAdvancedConstraints(datatype: string, referenceClass: GrapholEntity, grapholscape: Grapholscape, initialValues) {
  const neighbourhoodFinder = new NeighbourhoodFinder(grapholscape.ontology)
  const options = neighbourhoodFinder.getDataProperties(referenceClass.fullIri)
  if (datatype) {
    //const options = dataProperties.filter(d => d.domain.map(dom => dom.iri).includes(referenceClass.fullIri))
    if (isNumeric(datatype)) {
      const numericOptions = options.filter(d => isNumeric(d.datatype)).map(d => { return { value: d.fullIri, label: d.iri.remainder } })
      return (
        <Form.Item name="lessThanProp" style={formItemStyle} label='Less than value of:' labelCol={{ span: 6 }} initialValue={initialValues.lessThanProp}>
          <Select
            mode="multiple"
            style={{ width: 330 }}
            //defaultValue=""
            options={numericOptions} />
        </Form.Item>
      )
    } else if (datatype === 'xsd:string') {
      const stringOptions = options.filter(d => d.datatype === datatype).map(d => { return { value: d.fullIri, label: d.iri.remainder } })
      return (
        <>
          <Form.Item name="equalToProp" style={formItemStyle} label='Equal value to:' labelCol={{ span: 6 }} initialValue={initialValues.equalToProp}>
            <Select
              mode="multiple"
              style={{ width: 330 }}
              //defaultValue=""
              options={stringOptions} />
          </Form.Item>
          <Form.Item name="differentFromProp" style={formItemStyle} label='Different value from:' labelCol={{ span: 6 }} initialValue={initialValues.differentFromProp}>
            <Select
              mode="multiple"
              style={{ width: 330 }}
              //defaultValue=""
              options={stringOptions} />
          </Form.Item>
        </>
      )
    } else {
      return null
    }

  } else {
    return null

  }
}

export function getValueEnumConstraint() {
  return (<Select
    mode="tags"
    style={{ width: 330 }}
    tokenSeparators={[',']}
    options={[]}
  />)
}

export function isNumeric(datatype: string) {
  const numericDatatypes = ['owl:real', 'owl:rational', 'xsd:decimal', 'xsd:integer',
    'xsd:nonNegativeInteger', 'xsd:nonPositiveInteger',
    'xsd:positiveInteger', 'xsd:negativeInteger', 'xsd:long',
    'xsd:int', 'xsd:short', 'xsd:byte', 'xsd:unsignedLong',
    'xsd:unsignedInt', 'xsd:unsignedShort', 'xsd:unsignedByte',
    'xsd:double', 'xsd:float']
  return numericDatatypes.includes(datatype)
}