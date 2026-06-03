
# PostOntologyRDFExamplesRequest


## Properties

Name | Type
------------ | -------------
`classes` | Array&lt;string&gt;
`currentRdfGraph` | [RDFGraph](RDFGraph.md)

## Example

```typescript
import type { PostOntologyRDFExamplesRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "classes": null,
  "currentRdfGraph": null,
} satisfies PostOntologyRDFExamplesRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PostOntologyRDFExamplesRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


