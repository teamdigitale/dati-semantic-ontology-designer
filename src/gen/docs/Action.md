
# Action

Actions describes what user has done on a single element or element\'s metadata. The user can add, edit or remove something. The \"something\" is described by the operation involved in the action, it can be an operation over an entity, a diagram, a hierarchy and so on. Reverting an action means reverting the operation that has been done and it depends on the type of the action. - Add => Remove - Remove => Add - Edit => restore the previous state of the subject of the operation made

## Properties

Name | Type
------------ | -------------
`operationType` | string
`subject` | object
`previousState` | object
`involvedElements` | [ActionInvolvedElements](ActionInvolvedElements.md)
`subactions` | [Array&lt;Action&gt;](Action.md)
`user` | [ActionUser](ActionUser.md)
`timestamp` | number

## Example

```typescript
import type { Action } from ''

// TODO: Update the object below with actual values
const example = {
  "operationType": null,
  "subject": null,
  "previousState": null,
  "involvedElements": null,
  "subactions": null,
  "user": null,
  "timestamp": null,
} satisfies Action

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as Action
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


