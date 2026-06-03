
# RDFGraphConfig


## Properties

Name | Type
------------ | -------------
`themes` | [Array&lt;Theme&gt;](Theme.md)
`selectedTheme` | string
`language` | string
`entityNameType` | string
`renderers` | Array&lt;string&gt;
`widgets` | object
`filters` | Array&lt;string&gt;

## Example

```typescript
import type { RDFGraphConfig } from ''

// TODO: Update the object below with actual values
const example = {
  "themes": null,
  "selectedTheme": null,
  "language": null,
  "entityNameType": null,
  "renderers": null,
  "widgets": null,
  "filters": null,
} satisfies RDFGraphConfig

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RDFGraphConfig
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


