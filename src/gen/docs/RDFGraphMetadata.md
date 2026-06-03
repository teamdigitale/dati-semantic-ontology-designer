
# RDFGraphMetadata


## Properties

Name | Type
------------ | -------------
`name` | string
`iri` | string
`version` | string
`languages` | Array&lt;string&gt;
`defaultLanguage` | string
`namespaces` | [Array&lt;Namespace&gt;](Namespace.md)
`annotations` | [Array&lt;GrapholscapeAnnotation&gt;](GrapholscapeAnnotation.md)
`annotationProperties` | Array&lt;string&gt;

## Example

```typescript
import type { RDFGraphMetadata } from ''

// TODO: Update the object below with actual values
const example = {
  "name": null,
  "iri": null,
  "version": null,
  "languages": null,
  "defaultLanguage": null,
  "namespaces": null,
  "annotations": null,
  "annotationProperties": null,
} satisfies RDFGraphMetadata

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RDFGraphMetadata
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


