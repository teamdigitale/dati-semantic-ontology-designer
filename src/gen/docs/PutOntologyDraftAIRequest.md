
# PutOntologyDraftAIRequest


## Properties

Name | Type
------------ | -------------
`text` | string
`currentRdfGraph` | [RDFGraph](RDFGraph.md)
`iriStyle` | boolean
`simpleNameLanguage` | string
`annotationLanguage` | string

## Example

```typescript
import type { PutOntologyDraftAIRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "text": null,
  "currentRdfGraph": null,
  "iriStyle": null,
  "simpleNameLanguage": null,
  "annotationLanguage": null,
} satisfies PutOntologyDraftAIRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PutOntologyDraftAIRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


