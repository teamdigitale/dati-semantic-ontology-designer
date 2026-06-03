
# GrapholscapeEntity


## Properties

Name | Type
------------ | -------------
`fullIri` | string
`annotations` | [Array&lt;GrapholscapeAnnotation&gt;](GrapholscapeAnnotation.md)
`datatype` | string
`isDataPropertyFunctional` | boolean
`functionProperties` | [Array&lt;FunctionPropertiesEnum&gt;](FunctionPropertiesEnum.md)

## Example

```typescript
import type { GrapholscapeEntity } from ''

// TODO: Update the object below with actual values
const example = {
  "fullIri": null,
  "annotations": null,
  "datatype": null,
  "isDataPropertyFunctional": null,
  "functionProperties": null,
} satisfies GrapholscapeEntity

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GrapholscapeEntity
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


