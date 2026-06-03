
# DescribeIndividualRequest


## Properties

Name | Type
------------ | -------------
`individualName` | string
`context` | string
`individualTypes` | Array&lt;string&gt;
`language` | string

## Example

```typescript
import type { DescribeIndividualRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "individualName": null,
  "context": null,
  "individualTypes": null,
  "language": null,
} satisfies DescribeIndividualRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as DescribeIndividualRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


