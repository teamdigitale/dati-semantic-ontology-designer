
# SemanticAnnotations

Object for the representation of the full set of semantic annotations the system produces and adds to a schema component definition during the semantic enrichment algorithm

## Properties

Name | Type
------------ | -------------
`X_JSONLD_TYPE` | string
`X_JSONLD_CONTEXT` | [SemanticAnnotationsXJSONLDCONTEXT](SemanticAnnotationsXJSONLDCONTEXT.md)
`example` | { [key: string]: string; }

## Example

```typescript
import type { SemanticAnnotations } from ''

// TODO: Update the object below with actual values
const example = {
  "X_JSONLD_TYPE": null,
  "X_JSONLD_CONTEXT": null,
  "example": null,
} satisfies SemanticAnnotations

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SemanticAnnotations
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


