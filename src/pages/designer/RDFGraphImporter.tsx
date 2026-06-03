import { CheckCircleOutlined, ImportOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Cascader, Flex, Form, Input, Select, Typography, Upload } from "antd"
import axios from "axios"
import { useContext, useState } from "react"
import { RDFGraph } from "src/gen"
import { message } from "src/store/store"
import { ApiContext } from './ApiContext'
import removeDiagramsFromRDFGraph from "./RemoveDiagramsFromRDFGraph"

type RDFGraphImporterProps = {
  onRDFGraphReady: (rdfGraph?: RDFGraph) => void,
}

const supportedFileExtensions = ['.gscape', '.owl', '.ttl', '.n3', '.rdf', '.ofn', '.owx']

export default function RDFGraphImporter(props: RDFGraphImporterProps) {
  const [loading, setLoading] = useState(false)
  const [ontologyURL, setOntologyURL] = useState('')
  const [importing, setImporting] = useState(false)
  const [uploadedRDFGraph, setUploadedRDFGraph] = useState(undefined as RDFGraph | undefined)
  const [owlWarningVisible, setOwlWarningVisible] = useState(false)

  const {
    convertOWLToRDFGraph,
    externalOntologiesOptions,
    onSelectMonolithOntology
  } = useContext(ApiContext)

  const onConverted = (res: RDFGraph) => {
    if (res) {
      message.success('Upload successfully.');
      setUploadedRDFGraph(res)
    }
    setLoading(false)
    setImporting(false)
    props.onRDFGraphReady(res)
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
        setOwlWarningVisible(true)
        convertOWLToRDFGraph(res.data, fileType).then(onConverted).catch(() => setImporting(false))
      } else {
        parseGscape(res.data).then(onConverted).catch(() => setImporting(false))
      }
    })
  }

  const beforeUpload = (file) => {
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
        .then(res => onConverted(res))
        .finally(() => {
          setLoading(false)
          setImporting(false)
        })
    } else {
      setOwlWarningVisible(true)
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
      const newRDFGraph = removeDiagramsFromRDFGraph(uploadedRDFGraph, selectedDiagrams)
      props.onRDFGraphReady(newRDFGraph)
    }
  }

  return <>
    {uploadedRDFGraph !== undefined
      ? <Flex vertical align='center' gap={12}>
        <div style={{ textAlign: 'center' }}>
          <Typography.Title level={5} style={{ color: "var(--success)" }}><CheckCircleOutlined /> Valid Ontology</Typography.Title>
          <Typography.Text><b>Detected version:</b> {uploadedRDFGraph.metadata.version}</Typography.Text>
          {owlWarningVisible && <Typography.Text type='secondary' style={{ display: "block" }}>
            Beware, some axioms of the imported OWL ontology may be outside the expressiveness of the ontology designer and therefore removed.
          </Typography.Text>}
        </div>
        <Button danger size='small' type="dashed" onClick={() => {
          setUploadedRDFGraph(undefined)
          setOwlWarningVisible(false)
          props.onRDFGraphReady(undefined)
        }}>Reset</Button>
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
              onSelectMonolithOntology(value[0], value[1]).then(rdfGraph => onConverted(rdfGraph))
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

    {uploadedRDFGraph?.diagrams && uploadedRDFGraph.diagrams.length > 1 &&
      <Form.Item style={{ marginTop: 12 }} label="Diagrams To Import" name='diagrams'>
        <Select mode="multiple" placeholder="All Diagrams" onChange={onDiagramsSelection}>
          {uploadedRDFGraph.diagrams.sort((a, b) => a.name.localeCompare(b.name))
            .map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
              </Select.Option>))
          }
        </Select>
      </Form.Item>}
  </>
}

