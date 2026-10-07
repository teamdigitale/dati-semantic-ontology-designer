import { createContext } from "react";
import { OWL2RDFGraphConversionResult, RDFGraph } from "src/gen";

type ApiContextType = {
  convertOWLToRDFGraph: (owl: Blob, fileType: string) => Promise<OWL2RDFGraphConversionResult>
  getRejectedAxiomsOntology: (file: Blob, format: string) => Promise<string>
  externalOntologiesOptions?: Option[]
  onSelectMonolithOntology?: (name: string, version: string) => Promise<RDFGraph>
  sparqlEndpointConnection?: SPARQLEndpointConnection
  setSparqlEndpointURL?: (newURL: string, importNamespaces?: boolean) => void
  resetSparqlEndpointConnection?: () => SPARQLEndpointConnection
}

interface Option {
  value: string;
  label: string;
  children?: Option[];
}

export type SPARQLEndpointConnection = {
  endpointUrl: string,
  headers?: any,
}

export const ApiContext = createContext<ApiContextType>(undefined)