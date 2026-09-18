
# SimpleContextElement

the representation of a simple semantic annotation (i.e. the ones used to indicate which data property is semantically associated to a given schema property)

## Properties

Name | Type
------------ | -------------
`simpleContexElementName` | string
`simpleContexElementValue` | string

## Example

```typescript
import type { SimpleContextElement } from ''

// TODO: Update the object below with actual values
const example = {
  "simpleContexElementName": null,
  "simpleContexElementValue": null,
} satisfies SimpleContextElement

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SimpleContextElement
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


