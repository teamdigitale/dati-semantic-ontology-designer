
# OWL2RDFGraphConversionResult


## Properties

Name | Type
------------ | -------------
`rdfGraph` | [RDFGraph](RDFGraph.md)
`rejectedAxioms` | number
`acceptedAxioms` | number
`originalAxioms` | number

## Example

```typescript
import type { OWL2RDFGraphConversionResult } from ''

// TODO: Update the object below with actual values
const example = {
  "rdfGraph": null,
  "rejectedAxioms": null,
  "acceptedAxioms": null,
  "originalAxioms": null,
} satisfies OWL2RDFGraphConversionResult

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OWL2RDFGraphConversionResult
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


