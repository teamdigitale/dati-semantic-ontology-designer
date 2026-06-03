import { CodeOutlined, DownloadOutlined, FileExcelOutlined, ImportOutlined } from "@ant-design/icons";
import { Button, Flex, Tabs, Upload } from "antd";
import { useForm } from "antd/es/form/Form";
import { useContext, useState } from "react";
import OntologyBuilder from "src/builder/ontology-builder";
import { OntologyUploadInfo } from "src/pages/designer/entity-form-props";
import { RDFGraph } from "src/gen";
import OntologyUploadForm from "src/pages/designer/settings/ExcelUploadForm";
import { message } from "src/store/store";
import RDFGraphImporter from "../RDFGraphImporter";
import { ToolbarContext } from "../ToolbarContext";
import OntologyExcelImporter from "./OntologyExcelImporter";
import OntologyTemplateExporter from "./OntologyTemplateExporter";

export default function OntologyImporter() {
  const { grapholscape } = useContext(ToolbarContext)
  const [rdfGraph, setRdfGraph] = useState<RDFGraph | undefined>()
  const [readyToImport, setReadyToImport] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [form] = useForm()

  const importButton = (onClick: () => void) => {
    return <Button
      onClick={onClick}
      type="primary"
      icon={<ImportOutlined />}
      disabled={!readyToImport}
      loading={importLoading}
    >Import</Button>
  }

  const importRDFGraph = async () => {
    if (rdfGraph) {
      const ontologyBuilder = new OntologyBuilder(grapholscape)
      setImportLoading(true)
      rdfGraph.diagrams.forEach(diagram => {
        const diagramsWithSameName = grapholscape.ontology.diagrams.filter(d => d.name === diagram.name)
        if (diagramsWithSameName.length > 0) {
          diagram.name = `${diagram.name} - imported`
        }
      })
      await ontologyBuilder.mergeRDFGraph(rdfGraph)
      message.success('Ontology Imported successfully')
      setImportLoading(false)
      setReadyToImport(false)
      setRdfGraph(undefined)
      grapholscape.showDiagram(grapholscape.ontology.diagrams[grapholscape.ontology.diagrams.length - 1]?.id)
    }
  }

  const importExcel = (file) => {
    const uploadInfo: OntologyUploadInfo = form.getFieldsValue()
    form.validateFields()
      .then(() => {
        const selectedFile = file
        const updateFunc = (rows) => {
          if (Object.keys(rows).map(function (key) {
            return rows[key];
          }).flat().length === 0) {
            message.success(`${file.name} file uploaded successfully`);
          } else {
            message.warning(`${file.name} file uploaded. The following lines were ignored: ${Object.entries(rows)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")}`)
          }
        }
        new OntologyExcelImporter(grapholscape, updateFunc).importOntologyXlsx(
          selectedFile,
          uploadInfo.diagram,
          uploadInfo.namespace,
          uploadInfo.lang
        )
      })
      .catch(() => { console.warn('error on ontology upload') })
  }

  const handleTemplate = () => {
    new OntologyTemplateExporter(grapholscape.ontology).generateXlsxTemplate()
  }

  return <Tabs
    onChange={(activeKey) => activeKey === 'excel' ? setReadyToImport(true) : setReadyToImport(rdfGraph !== undefined)}
    items={[
      {
        key: 'owl',
        label: 'OWL',
        icon: <CodeOutlined />,
        children: <>
          <RDFGraphImporter
            onRDFGraphReady={(loadedRDFGraph) => {
              setReadyToImport(loadedRDFGraph !== undefined)
              setRdfGraph(loadedRDFGraph)
            }}
          />
          <Flex justify="end">
            {importButton(() => importRDFGraph())}
          </Flex>
        </>
      },
      {
        key: 'excel',
        label: 'Excel',
        icon: <FileExcelOutlined />,
        children: <>
          <OntologyUploadForm form={form} />
          <Flex justify="end" gap={8}>
            <Button onClick={handleTemplate} icon={<DownloadOutlined />}>Download Template</Button>
            <Upload
              beforeUpload={(file) => { importExcel(file) }}
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" showUploadList={false}>
              {importButton(() => { }) /** do nothing on click */} 
            </Upload>
          </Flex>
        </>
      }
    ]}
  />
}