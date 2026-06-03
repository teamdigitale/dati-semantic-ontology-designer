
# RDFGraph


## Properties

Name | Type
------------ | -------------
`diagrams` | [Array&lt;Diagram&gt;](Diagram.md)
`entities` | [Array&lt;GrapholscapeEntity&gt;](GrapholscapeEntity.md)
`classInstanceEntities` | [Array&lt;ClassInstanceEntity&gt;](ClassInstanceEntity.md)
`metadata` | [RDFGraphMetadata](RDFGraphMetadata.md)
`config` | [RDFGraphConfig](RDFGraphConfig.md)
`selectedDiagramId` | number
`modelType` | string
`actions` | [Array&lt;Action&gt;](Action.md)
`creator` | string
`constraints` | [Array&lt;SHACLShape&gt;](SHACLShape.md)

## Example

```typescript
import type { RDFGraph } from ''

// TODO: Update the object below with actual values
const example = {
  "diagrams": null,
  "entities": null,
  "classInstanceEntities": null,
  "metadata": null,
  "config": null,
  "selectedDiagramId": null,
  "modelType": null,
  "actions": null,
  "creator": null,
  "constraints": null,
} satisfies RDFGraph

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as RDFGraph
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


