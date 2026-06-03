# RAGApi

All URIs are relative to *https://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**checkVectorDBStatus**](RAGApi.md#checkvectordbstatus) | **GET** /ai/rag/{ontologyName}/vectorDB/status | Check the vector database status for a specific ontology version. |
| [**deleteVectorDB**](RAGApi.md#deletevectordb) | **DELETE** /ai/rag/{ontologyName}/vectorDB/delete | Delete the vector database for a specific ontology version. |
| [**initializeVectorDB**](RAGApi.md#initializevectordboperation) | **POST** /ai/rag/{ontologyName}/vectorDB/initialize | Initialize the vector database for a specific ontology version |
| [**naturalLanguageQuery**](RAGApi.md#naturallanguagequeryoperation) | **POST** /ai/rag/{ontologyName}/vectorDB/nlq | Generate a SPARQL query from a natural language query using the vector database for a specific ontology version. |
| [**postOntologyRDFExamples**](RAGApi.md#postontologyrdfexamplesoperation) | **POST** /ai/rag/ontologyRDFExamples | Returns an example of RDF instaces in Turtle format, based on the classes provided in the request body and the current RDF graph. |
| [**postOntologySummary**](RAGApi.md#postontologysummaryoperation) | **POST** /ai/rag/ontologySummary | Returns a summary of the ontology. |
| [**putOntologyDraftAI**](RAGApi.md#putontologydraftaioperation) | **PUT** /ai/rag/ontologyDraft/{name} | Ask for AI support in ontology design. |
| [**putOntologyQueryAI**](RAGApi.md#putontologyqueryaioperation) | **PUT** /ai/rag/ontologyQuery | Ask anything about this ontology, and get an answer with the relevant entities. |



## checkVectorDBStatus

> VectorDBStatus checkVectorDBStatus(ontologyName, ontologyVersion)

Check the vector database status for a specific ontology version.

### Example

```ts
import {
  Configuration,
  RAGApi,
} from '';
import type { CheckVectorDBStatusRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RAGApi(config);

  const body = {
    // string
    ontologyName: ontologyName_example,
    // string
    ontologyVersion: ontologyVersion_example,
  } satisfies CheckVectorDBStatusRequest;

  try {
    const data = await api.checkVectorDBStatus(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ontologyName** | `string` |  | [Defaults to `undefined`] |
| **ontologyVersion** | `string` |  | [Defaults to `undefined`] |

### Return type

[**VectorDBStatus**](VectorDBStatus.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful operation |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## deleteVectorDB

> boolean deleteVectorDB(ontologyName, ontologyVersion)

Delete the vector database for a specific ontology version.

### Example

```ts
import {
  Configuration,
  RAGApi,
} from '';
import type { DeleteVectorDBRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RAGApi(config);

  const body = {
    // string
    ontologyName: ontologyName_example,
    // string
    ontologyVersion: ontologyVersion_example,
  } satisfies DeleteVectorDBRequest;

  try {
    const data = await api.deleteVectorDB(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ontologyName** | `string` |  | [Defaults to `undefined`] |
| **ontologyVersion** | `string` |  | [Defaults to `undefined`] |

### Return type

**boolean**

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful operation |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## initializeVectorDB

> boolean initializeVectorDB(ontologyName, ontologyVersion, initializeVectorDBRequest)

Initialize the vector database for a specific ontology version

### Example

```ts
import {
  Configuration,
  RAGApi,
} from '';
import type { InitializeVectorDBOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RAGApi(config);

  const body = {
    // string
    ontologyName: ontologyName_example,
    // string
    ontologyVersion: ontologyVersion_example,
    // InitializeVectorDBRequest (optional)
    initializeVectorDBRequest: ...,
  } satisfies InitializeVectorDBOperationRequest;

  try {
    const data = await api.initializeVectorDB(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ontologyName** | `string` |  | [Defaults to `undefined`] |
| **ontologyVersion** | `string` |  | [Defaults to `undefined`] |
| **initializeVectorDBRequest** | [InitializeVectorDBRequest](InitializeVectorDBRequest.md) |  | [Optional] |

### Return type

**boolean**

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful operation |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## naturalLanguageQuery

> NaturalLanguageQuery200Response naturalLanguageQuery(ontologyName, ontologyVersion, naturalLanguageQueryRequest)

Generate a SPARQL query from a natural language query using the vector database for a specific ontology version.

### Example

```ts
import {
  Configuration,
  RAGApi,
} from '';
import type { NaturalLanguageQueryOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RAGApi(config);

  const body = {
    // string
    ontologyName: ontologyName_example,
    // string
    ontologyVersion: ontologyVersion_example,
    // NaturalLanguageQueryRequest (optional)
    naturalLanguageQueryRequest: ...,
  } satisfies NaturalLanguageQueryOperationRequest;

  try {
    const data = await api.naturalLanguageQuery(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **ontologyName** | `string` |  | [Defaults to `undefined`] |
| **ontologyVersion** | `string` |  | [Defaults to `undefined`] |
| **naturalLanguageQueryRequest** | [NaturalLanguageQueryRequest](NaturalLanguageQueryRequest.md) |  | [Optional] |

### Return type

[**NaturalLanguageQuery200Response**](NaturalLanguageQuery200Response.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful operation |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## postOntologyRDFExamples

> string postOntologyRDFExamples(postOntologyRDFExamplesRequest)

Returns an example of RDF instaces in Turtle format, based on the classes provided in the request body and the current RDF graph.

### Example

```ts
import {
  Configuration,
  RAGApi,
} from '';
import type { PostOntologyRDFExamplesOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RAGApi(config);

  const body = {
    // PostOntologyRDFExamplesRequest (optional)
    postOntologyRDFExamplesRequest: ...,
  } satisfies PostOntologyRDFExamplesOperationRequest;

  try {
    const data = await api.postOntologyRDFExamples(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **postOntologyRDFExamplesRequest** | [PostOntologyRDFExamplesRequest](PostOntologyRDFExamplesRequest.md) |  | [Optional] |

### Return type

**string**

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful operation |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## postOntologySummary

> string postOntologySummary(postOntologySummaryRequest)

Returns a summary of the ontology.

### Example

```ts
import {
  Configuration,
  RAGApi,
} from '';
import type { PostOntologySummaryOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RAGApi(config);

  const body = {
    // PostOntologySummaryRequest (optional)
    postOntologySummaryRequest: ...,
  } satisfies PostOntologySummaryOperationRequest;

  try {
    const data = await api.postOntologySummary(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **postOntologySummaryRequest** | [PostOntologySummaryRequest](PostOntologySummaryRequest.md) |  | [Optional] |

### Return type

**string**

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful operation |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## putOntologyDraftAI

> RDFGraph putOntologyDraftAI(name, putOntologyDraftAIRequest)

Ask for AI support in ontology design.

### Example

```ts
import {
  Configuration,
  RAGApi,
} from '';
import type { PutOntologyDraftAIOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RAGApi(config);

  const body = {
    // string
    name: name_example,
    // PutOntologyDraftAIRequest (optional)
    putOntologyDraftAIRequest: ...,
  } satisfies PutOntologyDraftAIOperationRequest;

  try {
    const data = await api.putOntologyDraftAI(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **name** | `string` |  | [Defaults to `undefined`] |
| **putOntologyDraftAIRequest** | [PutOntologyDraftAIRequest](PutOntologyDraftAIRequest.md) |  | [Optional] |

### Return type

[**RDFGraph**](RDFGraph.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful operation |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## putOntologyQueryAI

> PutOntologyQueryAI200Response putOntologyQueryAI(putOntologyQueryAIRequest)

Ask anything about this ontology, and get an answer with the relevant entities.

### Example

```ts
import {
  Configuration,
  RAGApi,
} from '';
import type { PutOntologyQueryAIOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new RAGApi(config);

  const body = {
    // PutOntologyQueryAIRequest (optional)
    putOntologyQueryAIRequest: ...,
  } satisfies PutOntologyQueryAIOperationRequest;

  try {
    const data = await api.putOntologyQueryAI(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **putOntologyQueryAIRequest** | [PutOntologyQueryAIRequest](PutOntologyQueryAIRequest.md) |  | [Optional] |

### Return type

[**PutOntologyQueryAI200Response**](PutOntologyQueryAI200Response.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | Successful operation |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

