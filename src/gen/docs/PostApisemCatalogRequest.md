
# PostApisemCatalogRequest


## Properties

Name | Type
------------ | -------------
`ontologyName` | string
`ontologyVersion` | string
`currentRdfGraph` | [RDFGraph](RDFGraph.md)

## Example

```typescript
import type { PostApisemCatalogRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "ontologyName": null,
  "ontologyVersion": null,
  "currentRdfGraph": null,
} satisfies PostApisemCatalogRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PostApisemCatalogRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


