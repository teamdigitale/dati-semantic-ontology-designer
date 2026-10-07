# APISemanticheApi

All URIs are relative to *https://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**deleteApisemCatalog**](APISemanticheApi.md#deleteapisemcatalog) | **DELETE** /ai/apisem/catalog | Reset the content of the current catalog |
| [**deleteApisemCatalogName**](APISemanticheApi.md#deleteapisemcatalogname) | **DELETE** /ai/apisem/catalog/{name} | Reset the content of the current catalog |
| [**getApisemCatalog**](APISemanticheApi.md#getapisemcatalog) | **GET** /ai/apisem/catalog | Returns the current content of the ontology catalog used to generate semantic annotations for provided YAML service specifications |
| [**getApisemCatalogHistory**](APISemanticheApi.md#getapisemcataloghistory) | **GET** /ai/apisem/catalog/history | Returns the list of operations executed on the ontology catalog |
| [**getApisemCatalogNameStatus**](APISemanticheApi.md#getapisemcatalognamestatus) | **GET** /ai/apisem/catalog/{name}/status | Returns the current status of a given ontology catalog entry |
| [**postApisemCatalog**](APISemanticheApi.md#postapisemcatalogoperation) | **POST** /ai/apisem/catalog | Adds a new ontology to the current ontology catalog, creates the corresponding vector DB instance |
| [**postApisemSchema**](APISemanticheApi.md#postapisemschema) | **POST** /ai/apisem/schema | Takes a JSON file containing the specification of a service, plus the list of semantic annotations for every schema component being annotated, and returns the JSON specification decorated with such annotations |
| [**postApisemSchemaMultiprompt**](APISemanticheApi.md#postapisemschemamultiprompt) | **POST** /ai/apisem/schema/multiprompt | Takes a YAML schema component in textual format and returns the list of classes that are similar to the schema provided |
| [**postApisemSchemaNameAnnotations**](APISemanticheApi.md#postapisemschemanameannotationsoperation) | **POST** /ai/apisem/schema/{name}/annotations | Takes as input the name of a schema component (as a path parameter) and the name of a similar class previously identified by the operator (as a query parameter) and returns the full set of semantic annotations for the given schema component w.r.t. to the similar class provided |
| [**putApisemCatalogName**](APISemanticheApi.md#putapisemcatalogname) | **PUT** /ai/apisem/catalog/{name} | Replace the given ontology in the catalog with the one provided in the request body |



## deleteApisemCatalog

> boolean deleteApisemCatalog()

Reset the content of the current catalog

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { DeleteApisemCatalogRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  try {
    const data = await api.deleteApisemCatalog();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

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


## deleteApisemCatalogName

> boolean deleteApisemCatalogName(name, version)

Reset the content of the current catalog

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { DeleteApisemCatalogNameRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  const body = {
    // string
    name: name_example,
    // string
    version: version_example,
  } satisfies DeleteApisemCatalogNameRequest;

  try {
    const data = await api.deleteApisemCatalogName(body);
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
| **version** | `string` |  | [Defaults to `undefined`] |

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


## getApisemCatalog

> MWSXOntologyCatalogEntries getApisemCatalog()

Returns the current content of the ontology catalog used to generate semantic annotations for provided YAML service specifications

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { GetApisemCatalogRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  try {
    const data = await api.getApisemCatalog();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**MWSXOntologyCatalogEntries**](MWSXOntologyCatalogEntries.md)

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


## getApisemCatalogHistory

> OntologyCatalogHistory getApisemCatalogHistory()

Returns the list of operations executed on the ontology catalog

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { GetApisemCatalogHistoryRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  try {
    const data = await api.getApisemCatalogHistory();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**OntologyCatalogHistory**](OntologyCatalogHistory.md)

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


## getApisemCatalogNameStatus

> OntologyCatalogEntryStatus getApisemCatalogNameStatus(name, version)

Returns the current status of a given ontology catalog entry

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { GetApisemCatalogNameStatusRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  const body = {
    // string
    name: name_example,
    // string
    version: version_example,
  } satisfies GetApisemCatalogNameStatusRequest;

  try {
    const data = await api.getApisemCatalogNameStatus(body);
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
| **version** | `string` |  | [Defaults to `undefined`] |

### Return type

[**OntologyCatalogEntryStatus**](OntologyCatalogEntryStatus.md)

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


## postApisemCatalog

> MWSXOntologyCatalogEntries postApisemCatalog(postApisemCatalogRequest)

Adds a new ontology to the current ontology catalog, creates the corresponding vector DB instance

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { PostApisemCatalogOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  const body = {
    // PostApisemCatalogRequest (optional)
    postApisemCatalogRequest: ...,
  } satisfies PostApisemCatalogOperationRequest;

  try {
    const data = await api.postApisemCatalog(body);
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
| **postApisemCatalogRequest** | [PostApisemCatalogRequest](PostApisemCatalogRequest.md) |  | [Optional] |

### Return type

[**MWSXOntologyCatalogEntries**](MWSXOntologyCatalogEntries.md)

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


## postApisemSchema

> FileInfo postApisemSchema(fileInfoAndSemanticAnnotations)

Takes a JSON file containing the specification of a service, plus the list of semantic annotations for every schema component being annotated, and returns the JSON specification decorated with such annotations

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { PostApisemSchemaRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  const body = {
    // FileInfoAndSemanticAnnotations
    fileInfoAndSemanticAnnotations: ...,
  } satisfies PostApisemSchemaRequest;

  try {
    const data = await api.postApisemSchema(body);
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
| **fileInfoAndSemanticAnnotations** | [FileInfoAndSemanticAnnotations](FileInfoAndSemanticAnnotations.md) |  | |

### Return type

[**FileInfo**](FileInfo.md)

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


## postApisemSchemaMultiprompt

> SimilarClasses postApisemSchemaMultiprompt(schemaAndExclusionsIRIs)

Takes a YAML schema component in textual format and returns the list of classes that are similar to the schema provided

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { PostApisemSchemaMultipromptRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  const body = {
    // SchemaAndExclusionsIRIs
    schemaAndExclusionsIRIs: ...,
  } satisfies PostApisemSchemaMultipromptRequest;

  try {
    const data = await api.postApisemSchemaMultiprompt(body);
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
| **schemaAndExclusionsIRIs** | [SchemaAndExclusionsIRIs](SchemaAndExclusionsIRIs.md) |  | |

### Return type

[**SimilarClasses**](SimilarClasses.md)

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


## postApisemSchemaNameAnnotations

> SemanticAnnotations postApisemSchemaNameAnnotations(name, similarClass, postApisemSchemaNameAnnotationsRequest)

Takes as input the name of a schema component (as a path parameter) and the name of a similar class previously identified by the operator (as a query parameter) and returns the full set of semantic annotations for the given schema component w.r.t. to the similar class provided

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { PostApisemSchemaNameAnnotationsOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  const body = {
    // string | the name of the schema component
    name: name_example,
    // string | the value of the similar class identified by the operator
    similarClass: similarClass_example,
    // PostApisemSchemaNameAnnotationsRequest
    postApisemSchemaNameAnnotationsRequest: ...,
  } satisfies PostApisemSchemaNameAnnotationsOperationRequest;

  try {
    const data = await api.postApisemSchemaNameAnnotations(body);
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
| **name** | `string` | the name of the schema component | [Defaults to `undefined`] |
| **similarClass** | `string` | the value of the similar class identified by the operator | [Defaults to `undefined`] |
| **postApisemSchemaNameAnnotationsRequest** | [PostApisemSchemaNameAnnotationsRequest](PostApisemSchemaNameAnnotationsRequest.md) |  | |

### Return type

[**SemanticAnnotations**](SemanticAnnotations.md)

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


## putApisemCatalogName

> MWSXOntologyCatalogEntries putApisemCatalogName(name, version, rDFGraph)

Replace the given ontology in the catalog with the one provided in the request body

### Example

```ts
import {
  Configuration,
  APISemanticheApi,
} from '';
import type { PutApisemCatalogNameRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new APISemanticheApi(config);

  const body = {
    // string
    name: name_example,
    // string
    version: version_example,
    // RDFGraph
    rDFGraph: ...,
  } satisfies PutApisemCatalogNameRequest;

  try {
    const data = await api.putApisemCatalogName(body);
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
| **version** | `string` |  | [Defaults to `undefined`] |
| **rDFGraph** | [RDFGraph](RDFGraph.md) |  | |

### Return type

[**MWSXOntologyCatalogEntries**](MWSXOntologyCatalogEntries.md)

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

