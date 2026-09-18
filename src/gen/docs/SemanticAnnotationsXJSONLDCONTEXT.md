
# SemanticAnnotationsXJSONLDCONTEXT

contains the context annotations specifying the object or data properties semantically equivalent (or similar) to the properties of the given schema component

## Properties

Name | Type
------------ | -------------
`vocab` | string
`elements` | [Array&lt;SemanticAnnotationsXJSONLDCONTEXTElementsInner&gt;](SemanticAnnotationsXJSONLDCONTEXTElementsInner.md)

## Example

```typescript
import type { SemanticAnnotationsXJSONLDCONTEXT } from ''

// TODO: Update the object below with actual values
const example = {
  "vocab": null,
  "elements": null,
} satisfies SemanticAnnotationsXJSONLDCONTEXT

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SemanticAnnotationsXJSONLDCONTEXT
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


