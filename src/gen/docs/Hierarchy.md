
# Hierarchy


## Properties

Name | Type
------------ | -------------
`id` | string
`type` | [TypesEnum](TypesEnum.md)
`inputs` | [Array&lt;GrapholscapeEntity&gt;](GrapholscapeEntity.md)
`superclasses` | [Array&lt;HierarchySuperclassesInner&gt;](HierarchySuperclassesInner.md)

## Example

```typescript
import type { Hierarchy } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "type": null,
  "inputs": null,
  "superclasses": null,
} satisfies Hierarchy

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Hierarchy
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


