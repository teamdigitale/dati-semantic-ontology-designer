
# ChartConfiguration


## Properties

Name | Type
------------ | -------------
`yVariables` | Array&lt;string&gt;
`series` | string
`xVariable` | string
`chartType` | string
`cutoff` | number

## Example

```typescript
import type { ChartConfiguration } from ''

// TODO: Update the object below with actual values
const example = {
  "yVariables": null,
  "series": null,
  "xVariable": null,
  "chartType": null,
  "cutoff": null,
} satisfies ChartConfiguration

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ChartConfiguration
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


