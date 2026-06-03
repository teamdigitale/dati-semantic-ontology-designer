
# OntologyCatalogEntryStatus

The status of a given ontology catalog entry

## Properties

Name | Type
------------ | -------------
`status` | string
`errorMessage` | string
`percentage` | number
`executionTime` | number

## Example

```typescript
import type { OntologyCatalogEntryStatus } from ''

// TODO: Update the object below with actual values
const example = {
  "status": null,
  "errorMessage": null,
  "percentage": null,
  "executionTime": null,
} satisfies OntologyCatalogEntryStatus

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OntologyCatalogEntryStatus
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


