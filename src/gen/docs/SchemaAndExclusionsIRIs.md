
# SchemaAndExclusionsIRIs

the schema component definition text and the list of exclusions IRIs

## Properties

Name | Type
------------ | -------------
`schemaComponentDefinition` | string
`ontologyName` | string
`ontologyVersion` | string
`exclusionsIRIs` | Array&lt;string&gt;
`promptType` | string
`maxSimilarClasses` | number

## Example

```typescript
import type { SchemaAndExclusionsIRIs } from ''

// TODO: Update the object below with actual values
const example = {
  "schemaComponentDefinition": null,
  "ontologyName": null,
  "ontologyVersion": null,
  "exclusionsIRIs": null,
  "promptType": null,
  "maxSimilarClasses": null,
} satisfies SchemaAndExclusionsIRIs

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as SchemaAndExclusionsIRIs
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


