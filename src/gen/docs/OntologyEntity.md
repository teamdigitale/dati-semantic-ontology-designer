
# OntologyEntity


## Properties

Name | Type
------------ | -------------
`entityLabels` | [Array&lt;Label&gt;](Label.md)
`deprecated` | boolean
`entityIRI` | string
`entityType` | string
`entityPrefixIRI` | string
`entityRemainder` | string
`entityID` | string

## Example

```typescript
import type { OntologyEntity } from ''

// TODO: Update the object below with actual values
const example = {
  "entityLabels": null,
  "deprecated": null,
  "entityIRI": null,
  "entityType": null,
  "entityPrefixIRI": null,
  "entityRemainder": null,
  "entityID": null,
} satisfies OntologyEntity

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OntologyEntity
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


