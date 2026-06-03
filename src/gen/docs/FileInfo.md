
# FileInfo


## Properties

Name | Type
------------ | -------------
`fileName` | string
`fileType` | string
`content` | string

## Example

```typescript
import type { FileInfo } from ''

// TODO: Update the object below with actual values
const example = {
  "fileName": null,
  "fileType": null,
  "content": null,
} satisfies FileInfo

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as FileInfo
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


