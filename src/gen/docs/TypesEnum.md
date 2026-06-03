
# TypesEnum

Contiene tutti i tipi di nodi/archi orginirari dal Graphol per evitare di duplicare gli enumeratori. Nella rappresentazione Floaty/vkg vengono usati questi valori. NODI class data-property class-instance (vkg) individual (floaty) union disjoint-union iri (floaty iri range di annotazioni che non sono entità) ARCHI object-property annotation-property instance-of input inclusion equivalence attribute-edge union disjoint-union complete-union complete-disjoint-union

## Properties

Name | Type
------------ | -------------

## Example

```typescript
import type { TypesEnum } from ''

// TODO: Update the object below with actual values
const example = {
} satisfies TypesEnum

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TypesEnum
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


