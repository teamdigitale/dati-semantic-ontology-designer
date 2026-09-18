import { CheckCircleOutlined, ImportOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Cascader, Flex, Form, Input, Popover, Select, Statistic, Typography, Upload } from "antd"
import axios from "axios"
import { useContext, useState } from "react"
import { OWL2RDFGraphConversionResult, RDFGraph } from "src/gen"
import { message } from "src/store/store"
import { ApiContext } from './ApiContext'
import OWLDrawer from './OwlDrawer'
import removeDiagramsFromRDFGraph from "./RemoveDiagramsFromRDFGraph"

type RDFGraphImporterProps = {
  onRDFGraphReady: (rdfGraph?: RDFGraph, importedFile?: File) => void,
}

const supportedFileExtensions = ['.gscape', '.owl', '.ttl', '.n3', '.rdf', '.ofn', '.owx']

let owlFile: File | undefined = undefined
export default function RDFGraphImporter(props: RDFGraphImporterProps) {
  const [loading, setLoading] = useState(false)
  const [ontologyURL, setOntologyURL] = useState('')
  const [importing, setImporting] = useState(false)
  const [uploadedRDFGraph, setUploadedRDFGraph] = useState(undefined as OWL2RDFGraphConversionResult | undefined)
  const [owlWarningVisible, setOwlWarningVisible] = useState(false)
  const [ignoredAxiomsVisible, setIgnoredAxiomsVisible] = useState(false)
  const {
    convertOWLToRDFGraph,
    externalOntologiesOptions,
    onSelectMonolithOntology,
    getRejectedAxiomsOntology
  } = useContext(ApiContext)

  const onConverted = (res: OWL2RDFGraphConversionResult) => {
    if (res) {
      message.success('Upload successfully.');
      setUploadedRDFGraph(res)
      setOwlWarningVisible(res.originalAxioms > 0)
    }
    setLoading(false)
    setImporting(false)
    props.onRDFGraphReady(res.rdfGraph, owlFile)
  }

  const parseGscape = (file): Promise<RDFGraph> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          resolve(JSON.parse(reader.result as string))
        } else {
          reject(new Error('Failed to read file'))
        }
      });
      reader.readAsText(file)
    })
  }

  const handleOk = () => {
    setImporting(true)
    let fileType = supportedFileExtensions.find(t => ontologyURL.includes(t))
    if (!fileType) {
      fileType = ontologyURL.includes('.gscape') ? '.gscape' : null
    }
    if (!fileType) {
      message.error('You can only import owl or gscape file!');
      setImporting(false)
    } else axios.get(ontologyURL, { responseType: 'blob' }).then(res => {
      if (fileType !== '.gscape') {
        owlFile = res.data
        convertOWLToRDFGraph(res.data, fileType).then(result => onConverted(result)).catch(() => setImporting(false))
      } else {
        parseGscape(res.data).then((result) => onConverted({
          rdfGraph: result,
          acceptedAxioms: 0,
          rejectedAxioms: 0,
          originalAxioms: 0
        })).catch(() => setImporting(false))
      }
    })
  }

  const beforeUpload = (file: File) => {
    setLoading(true)
    let fileType = supportedFileExtensions.find(t => file.name.endsWith(t))
    if (!fileType) {
      fileType = file.name.endsWith('.gscape') ? '.gscape' : null
    }
    if (!fileType) {
      message.error('You can only upload OWL or GSCAPE file! Found ' + file.type);
      setLoading(false)
    } else if (fileType === '.gscape') {
      parseGscape(file)
        .then(res => onConverted({
          rdfGraph: res,
          acceptedAxioms: 0,
          rejectedAxioms: 0,
          originalAxioms: 0
        }))
        .finally(() => {
          setLoading(false)
          setImporting(false)
        })
    } else {
      owlFile = file
      convertOWLToRDFGraph(file, fileType)
        .then(res => onConverted(res))
        .finally(() => {
          setLoading(false)
          setImporting(false)
        })
    }
    return false
  }

  const onDiagramsSelection = (selectedDiagrams: number[]) => {
    if (selectedDiagrams && uploadedRDFGraph) {
      const newRDFGraph = removeDiagramsFromRDFGraph(uploadedRDFGraph.rdfGraph, selectedDiagrams)
      props.onRDFGraphReady(newRDFGraph)
    }
  }

  return <>
    {uploadedRDFGraph !== undefined
      ? <Flex vertical gap={16} align='center'>
        <div style={{ textAlign: 'center' }}>
          <Typography.Title level={3} style={{ color: "var(--success)" }}><CheckCircleOutlined /> Valid Ontology</Typography.Title>
          <Typography.Text><b>Detected version:</b> {uploadedRDFGraph.rdfGraph.metadata.version}</Typography.Text>
        </div>
        {owlWarningVisible && <>
          <Popover content={`${uploadedRDFGraph.acceptedAxioms} out of ${uploadedRDFGraph.originalAxioms} Converted Axioms`}>
            <Statistic
              title="Converted Axioms"
              value={(uploadedRDFGraph.acceptedAxioms / uploadedRDFGraph.originalAxioms) * 100}
              precision={1}
              valueStyle={{ color: (uploadedRDFGraph.acceptedAxioms / uploadedRDFGraph.originalAxioms) > 0.5
                ? 'var(--success)'
                : 'rgb(204, 122, 0)' //warning
              }}
              prefix={<CheckCircleOutlined />}
              suffix={"%"}
            />
          </Popover>
          {uploadedRDFGraph.rejectedAxioms > 0 && <Typography.Text style={{ textAlign: 'center' }} type='secondary'>
            Some axioms are outside the expressiveness of the ontology designer and therefore ignored.
          </Typography.Text>}
        </>}
        <Flex gap={8}>
          {owlWarningVisible && uploadedRDFGraph.rejectedAxioms > 0 && <Button type='dashed' size='small' onClick={() => setIgnoredAxiomsVisible(true)}>
            <Typography.Text type="secondary">
              View Ignored Axioms
            </Typography.Text>
          </Button>}
          <Button danger size='small' type="dashed" onClick={() => {
            setUploadedRDFGraph(undefined)
            setOwlWarningVisible(false)
            setImporting(false)
            setLoading(false)
            props.onRDFGraphReady(undefined)
          }}>Reset</Button>
        </Flex>
      </Flex>
      : <>
        <Form.Item label='Import Ontology'>
          <Upload.Dragger beforeUpload={beforeUpload} fileList={[]}>
            {loading
              ? <><LoadingOutlined /> Uploading</>
              : <div>
                <PlusOutlined />
                <p>Click or drop ontology file here</p>
                <p>({supportedFileExtensions.map(t => `*${t}`).join(', ')})</p>
              </div>
            }
          </Upload.Dragger>
        </Form.Item>
        {externalOntologiesOptions && <Form.Item label='Monolith ontology:'>
          <Cascader
            showSearch
            options={externalOntologiesOptions}
            displayRender={(label) => label.join(' - ')}
            onChange={(value) => {
              onSelectMonolithOntology(value[0], value[1]).then(rdfGraph => onConverted({
                rdfGraph,
                acceptedAxioms: 0,
                rejectedAxioms: 0,
                originalAxioms: 0,
              }))
            }}
          />
        </Form.Item>}
        <Flex style={{ marginBottom: 12 }}>
          <Input
            className="paste-url-ontology-step"
            placeholder='Import file from URL'
            value={ontologyURL}
            onChange={(e) => setOntologyURL(e.target.value)}
            onPressEnter={handleOk} />
          <Button
            style={{ marginLeft: 6 }}
            icon={<ImportOutlined />}
            loading={importing}
            onClick={handleOk}>
            Load from URL
          </Button>
        </Flex>
      </>
    }

    {uploadedRDFGraph?.rdfGraph.diagrams && uploadedRDFGraph.rdfGraph.diagrams.length > 1 &&
      <Form.Item style={{ marginTop: 12 }} label="Diagrams To Import" name='diagrams'>
        <Select mode="multiple" placeholder="All Diagrams" onChange={onDiagramsSelection}>
          {uploadedRDFGraph.rdfGraph.diagrams.sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>))
          }
        </Select>
      </Form.Item>}

    <OWLDrawer
      open={ignoredAxiomsVisible}
      onClose={() => setIgnoredAxiomsVisible(false)}
      fileName={`ignored-axioms-${Date.now()}`}
      getOwl={(format) => getRejectedAxiomsOntology(owlFile!, format)}
      title="Ignored Axioms"
    />
  </>
}

