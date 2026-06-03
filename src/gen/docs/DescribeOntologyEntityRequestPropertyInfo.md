
# DescribeOntologyEntityRequestPropertyInfo

if the entity is a data or object property, this objects contains domain and range names. In case of data properties, the range is its datatype (string, number, ...)

## Properties

Name | Type
------------ | -------------
`domainName` | string
`rangeName` | string

## Example

```typescript
import type { DescribeOntologyEntityRequestPropertyInfo } from ''

// TODO: Update the object below with actual values
const example = {
  "domainName": null,
  "rangeName": null,
} satisfies DescribeOntologyEntityRequestPropertyInfo

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DescribeOntologyEntityRequestPropertyInfo
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


