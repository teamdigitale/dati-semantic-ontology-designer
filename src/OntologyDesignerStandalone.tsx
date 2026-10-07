import { CloseOutlined, GithubOutlined } from "@ant-design/icons";
import { App, Button, ConfigProvider, Drawer, Flex } from "antd";
import { useState } from "react";
import logo from '../assets/logo-mono.svg';
import { RDFGraph } from "./gen";
import AddOntologyDraft from "./pages/designer/AddOntologyDraftStandalone";
import OntologyDesigner from "./pages/designer/OntologyDesigner";
import StaticComponents, { ConvertApi } from "./store/store";

export default function OntologyDesignerStandalone() {
  const [rdfGraph, setRdfGraph] = useState<RDFGraph | undefined>(undefined);

  return <App style={{ height: '100%', width: '100%' }}>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0066cc',
          fontFamily: 'Titillium Web',
        },
      }}
      drawer={{
        closeIcon: <CloseOutlined style={{ color: 'white' }} />,
        styles: {
          header: {
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          },
        }
      }}
    >
      <StaticComponents />
      {rdfGraph && <OntologyDesigner
        rdfGraph={rdfGraph}
        getOwl={async (rDFGraph, format) => await ConvertApi.getOntologyDraftAIDownload({ format, rDFGraph })}
        sparqlEndpointConnection={{ endpointUrl: window['SPARQLEndpointURL'] || 'https://schema.gov.it/sparql' }}
        userManualURL="https://teamdigitale.github.io/dati-semantic-ontology-designer/"
      />}

      <Drawer
        title={<Flex align="center" gap={16}>
          <img src={logo} style={{ height: 32 }} alt='logo' />
          Ontology Designer
        </Flex>}
        width={'50vw'}
        open={!rdfGraph}
        closable={false}
        extra={<Button onClick={() => window.open("https://github.com/teamdigitale/dati-semantic-ontology-designer", "_blank")} type="text" size="large" icon={<GithubOutlined style={{ fontSize: '24px', color: 'white' }} />} />}
      >
        <AddOntologyDraft open={(rdfGraph: RDFGraph) => {
          setRdfGraph(rdfGraph)
        }} />
      </Drawer>
    </ConfigProvider>
  </App>
}