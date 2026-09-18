
# FileInfoAndSemanticAnnotations

the payload for the route which performs API specification decoration with semantic annotations

## Properties

Name | Type
------------ | -------------
`fileInfo` | [FileInfo](FileInfo.md)
`semanticAnnotations` | [{ [key: string]: SemanticAnnotations; }](SemanticAnnotations.md)

## Example

```typescript
import type { FileInfoAndSemanticAnnotations } from ''

// TODO: Update the object below with actual values
const example = {
  "fileInfo": null,
  "semanticAnnotations": null,
} satisfies FileInfoAndSemanticAnnotations

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as FileInfoAndSemanticAnnotations
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


