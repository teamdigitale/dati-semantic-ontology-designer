
# Edge


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
`sourceId` | string
`targetId` | string
`breakpoints` | [Array&lt;Position&gt;](Position.md)
`domainTyped` | boolean
`rangeTyped` | boolean
`domainMandatory` | boolean
`rangeMandatory` | boolean

## Example

```typescript
import type { Edge } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "originalId": null,
  "diagramId": null,
  "displayedName": null,
  "iri": null,
  "type": null,
  "aiGenerated": null,
  "sourceId": null,
  "targetId": null,
  "breakpoints": null,
  "domainTyped": null,
  "rangeTyped": null,
  "domainMandatory": null,
  "rangeMandatory": null,
} satisfies Edge

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Edge
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


