
# SHACLShape


## Properties

Name | Type
------------ | -------------
`id` | string
`type` | string
`targetClass` | string
`path` | string
`property` | string
`constraintValue` | Array&lt;string&gt;

## Example

```typescript
import type { SHACLShape } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "type": null,
  "targetClass": null,
  "path": null,
  "property": null,
  "constraintValue": null,
} satisfies SHACLShape

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SHACLShape
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


