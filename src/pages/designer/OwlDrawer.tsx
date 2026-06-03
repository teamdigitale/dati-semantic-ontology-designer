import { DownloadOutlined } from '@ant-design/icons';
import { Button, Drawer, Empty, Form, FormInstance, Select, Switch } from 'antd';
import { Base64 } from 'js-base64';
import React from 'react';
import { FormatEnum } from 'src/model';
import { downloadTextFile, getOntologyExtension } from 'src/utils/utils';

const formats = [FormatEnum.TURTLE, FormatEnum.FUNCTIONAL_SYNTAX, FormatEnum.RDF_XML]

export default class OWLDrawer extends React.Component<{
  open: boolean
  onClose: () => void
  getOwl: (format: string) => Promise<string | { content: string }>,
  formats?: FormatEnum[],
  fileName: string,
}> {
  formRef = React.createRef<FormInstance>();
  formats = this.props.formats || formats
  state = {
    preStyle: { paddingTop: 12, height: 'calc(100vh - 177px)', overflow: 'auto', wordWrap: 'break-word' as any, whiteSpace: undefined },
    owlString: undefined as (string | undefined),
    format: formats[0],
    loading: false,
  }

  componentDidUpdate(prevProps: Readonly<{ open: boolean; onClose: () => void; getOwl: (format: string) => void; }>, prevState: Readonly<{}>, snapshot?: any): void {
    if (prevProps.open === false && this.props.open === true) {
      this.handleGetOwl(formats[0]);
    }
  }

  onValuesChange = (changed, values) => {
    if (Object.keys(changed).includes('wrap')) {
      let preStyle = { paddingTop: 12, height: 'calc(100vh - 177px)', overflow: 'auto', wordWrap: 'break-word', whiteSpace: undefined as unknown as string }
      if (!this.state.preStyle.whiteSpace) {
        preStyle.whiteSpace = 'pre-wrap'
      }
      this.setState({ preStyle })
    } else {
      this.handleGetOwl(values.format)
    }
    this.setState({ format: values.format })
  }

  handleGetOwl = (format: FormatEnum) => {
    this.setState({ loading: true, owlString: undefined })
    this.props.getOwl(format).then(result => {
      const owlString = result['content'] ? Base64.decode(result['content']) : result as string
      this.setState({ owlString: owlString, loading: false })
    }).catch(() => {
      this.setState({ loading: false })
    })
  }

  handleDownload = () => {
    downloadTextFile(this.state.owlString, this.props.fileName + getOntologyExtension(this.state.format))
  }

  render() {

    return (
      <Drawer
        open={this.props.open}
        title="OWL Preview"
        width={'50vw'}
        onClose={() => { this.props.onClose() }}
        loading={this.state.loading}
        extra={<Button icon={<DownloadOutlined />} onClick={() => this.handleDownload()}>Download</Button>}>
        <Form
          layout='inline'
          initialValues={{ format: this.state.format }}
          ref={this.formRef}
          onValuesChange={this.onValuesChange}>
          <Form.Item label='Format' name='format'>
            <Select style={{ width: 200 }} disabled={this.formats.length <= 1}>
              {formats.map(i => <Select.Option key={i} value={i}>{i}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item label='Word wrap' name='wrap' valuePropName='checked'>
            <Switch />
          </Form.Item>
        </Form>
        {this.state.owlString === undefined
          ? <Empty description="No data available" />
          : <pre style={this.state.preStyle}>
            <code>{this.state.owlString}</code>
          </pre>
        }
      </Drawer>
    )
  }
}