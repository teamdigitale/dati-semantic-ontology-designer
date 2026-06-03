
# ActionInvolvedElements

Other elements involved in an action. Only for Remove actions. The remove action on an Entity might involve other elements. i.e. object properties on removed classes

## Properties

Name | Type
------------ | -------------
`nodes` | [Array&lt;Node&gt;](Node.md)
`edges` | [Array&lt;Edge&gt;](Edge.md)
`Hierarchies` | [Array&lt;Hierarchy&gt;](Hierarchy.md)

## Example

```typescript
import type { ActionInvolvedElements } from ''

// TODO: Update the object below with actual values
const example = {
  "nodes": null,
  "edges": null,
  "Hierarchies": null,
} satisfies ActionInvolvedElements

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ActionInvolvedElements
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


