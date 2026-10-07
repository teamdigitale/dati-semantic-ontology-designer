
# MWSXMetadataObject


## Properties

Name | Type
------------ | -------------
`iri` | string
`impliedClassIri` | string
`value` | string
`lang` | string
`datatypeIri` | string
`isIri` | boolean
`isBlankNode` | boolean

## Example

```typescript
import type { MWSXMetadataObject } from ''

// TODO: Update the object below with actual values
const example = {
  "iri": null,
  "impliedClassIri": null,
  "value": null,
  "lang": null,
  "datatypeIri": null,
  "isIri": null,
  "isBlankNode": null,
} satisfies MWSXMetadataObject

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MWSXMetadataObject
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


