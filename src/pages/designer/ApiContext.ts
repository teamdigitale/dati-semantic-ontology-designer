import { createContext } from "react";
import { RDFGraph } from "src/gen";

type ApiContextType = {
  convertOWLToRDFGraph: (owl: Blob, fileType: string) => Promise<RDFGraph>
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