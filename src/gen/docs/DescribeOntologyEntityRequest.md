
# DescribeOntologyEntityRequest


## Properties

Name | Type
------------ | -------------
`entityName` | string
`entityType` | string
`context` | string
`propertyInfo` | [DescribeOntologyEntityRequestPropertyInfo](DescribeOntologyEntityRequestPropertyInfo.md)
`language` | string

## Example

```typescript
import type { DescribeOntologyEntityRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "entityName": null,
  "entityType": null,
  "context": null,
  "propertyInfo": null,
  "language": null,
} satisfies DescribeOntologyEntityRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DescribeOntologyEntityRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


