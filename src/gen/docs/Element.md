
# Element


## Properties

Name | Type
------------ | -------------
`id` | string
`originalId` | string
`diagramId` | number
`displayedName` | string
`iri` | string
`type` | [TypesEnum](TypesEnum.md)
`aiGenerated` | [ElementAiGenerated](ElementAiGenerated.md)

## Example

```typescript
import type { Element } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "originalId": null,
  "diagramId": null,
  "displayedName": null,
  "iri": null,
  "type": null,
  "aiGenerated": null,
} satisfies Element

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Element
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


