
# ComplexContextElement

the representation of a complex-context semantic annotation (i.e. the ones used to indicate which object property is semantically associated to a given schema property)

## Properties

Name | Type
------------ | -------------
`complexContextElementName` | string
`id` | string
`type` | string
`context` | [ComplexContextElementContext](ComplexContextElementContext.md)

## Example

```typescript
import type { ComplexContextElement } from ''

// TODO: Update the object below with actual values
const example = {
  "complexContextElementName": null,
  "id": null,
  "type": null,
  "context": null,
} satisfies ComplexContextElement

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ComplexContextElement
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


