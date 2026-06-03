# PromptApi

All URIs are relative to *https://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**autoChart**](PromptApi.md#autochartoperation) | **POST** /ai/autochart | Returns a chart configuration for a SPARQL query suggested by AI |
| [**describeChart**](PromptApi.md#describechartoperation) | **POST** /ai/autochart_description | Returns a description of a chart |
| [**describeIndividual**](PromptApi.md#describeindividualoperation) | **POST** /ai/individual_description | Returns the description for an individual (class instance) |
| [**describeOntologyEntity**](PromptApi.md#describeontologyentityoperation) | **POST** /ai/entity_description | Returns the description for an entity |
| [**describeSparqlQuery**](PromptApi.md#describesparqlqueryoperation) | **POST** /ai/sparql_description | Returns a description of a sparql query |
| [**suggestClassDataProperties**](PromptApi.md#suggestclassdatapropertiesoperation) | **POST** /ai/class_data_properties | Returns a list of possible data properties for a given class |
| [**suggestClassSubclasses**](PromptApi.md#suggestclasssubclasses) | **POST** /ai/class_subclasses | Returns a list of possible subclasses for a given class |
| [**text2sparql**](PromptApi.md#text2sparqloperation) | **POST** /ai/text2sparql | Converts a natural language text into a SPARQL query |



## autoChart

> ChartConfiguration autoChart(autoChartRequest)

Returns a chart configuration for a SPARQL query suggested by AI

### Example

```ts
import {
  Configuration,
  PromptApi,
} from '';
import type { AutoChartOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PromptApi(config);

  const body = {
    // AutoChartRequest (optional)
    autoChartRequest: ...,
  } satisfies AutoChartOperationRequest;

  try {
    const data = await api.autoChart(body);
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
| **autoChartRequest** | [AutoChartRequest](AutoChartRequest.md) |  | [Optional] |

### Return type

[**ChartConfiguration**](ChartConfiguration.md)

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


## describeChart

> string describeChart(describeChartRequest)

Returns a description of a chart

### Example

```ts
import {
  Configuration,
  PromptApi,
} from '';
import type { DescribeChartOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PromptApi(config);

  const body = {
    // DescribeChartRequest (optional)
    describeChartRequest: ...,
  } satisfies DescribeChartOperationRequest;

  try {
    const data = await api.describeChart(body);
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
| **describeChartRequest** | [DescribeChartRequest](DescribeChartRequest.md) |  | [Optional] |

### Return type

**string**

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


## describeIndividual

> string describeIndividual(describeIndividualRequest)

Returns the description for an individual (class instance)

### Example

```ts
import {
  Configuration,
  PromptApi,
} from '';
import type { DescribeIndividualOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PromptApi(config);

  const body = {
    // DescribeIndividualRequest (optional)
    describeIndividualRequest: ...,
  } satisfies DescribeIndividualOperationRequest;

  try {
    const data = await api.describeIndividual(body);
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
| **describeIndividualRequest** | [DescribeIndividualRequest](DescribeIndividualRequest.md) |  | [Optional] |

### Return type

**string**

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


## describeOntologyEntity

> string describeOntologyEntity(describeOntologyEntityRequest)

Returns the description for an entity

### Example

```ts
import {
  Configuration,
  PromptApi,
} from '';
import type { DescribeOntologyEntityOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PromptApi(config);

  const body = {
    // DescribeOntologyEntityRequest (optional)
    describeOntologyEntityRequest: ...,
  } satisfies DescribeOntologyEntityOperationRequest;

  try {
    const data = await api.describeOntologyEntity(body);
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
| **describeOntologyEntityRequest** | [DescribeOntologyEntityRequest](DescribeOntologyEntityRequest.md) |  | [Optional] |

### Return type

**string**

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


## describeSparqlQuery

> string describeSparqlQuery(describeSparqlQueryRequest)

Returns a description of a sparql query

### Example

```ts
import {
  Configuration,
  PromptApi,
} from '';
import type { DescribeSparqlQueryOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PromptApi(config);

  const body = {
    // DescribeSparqlQueryRequest (optional)
    describeSparqlQueryRequest: ...,
  } satisfies DescribeSparqlQueryOperationRequest;

  try {
    const data = await api.describeSparqlQuery(body);
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
| **describeSparqlQueryRequest** | [DescribeSparqlQueryRequest](DescribeSparqlQueryRequest.md) |  | [Optional] |

### Return type

**string**

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


## suggestClassDataProperties

> Array&lt;string&gt; suggestClassDataProperties(suggestClassDataPropertiesRequest)

Returns a list of possible data properties for a given class

### Example

```ts
import {
  Configuration,
  PromptApi,
} from '';
import type { SuggestClassDataPropertiesOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PromptApi(config);

  const body = {
    // SuggestClassDataPropertiesRequest (optional)
    suggestClassDataPropertiesRequest: ...,
  } satisfies SuggestClassDataPropertiesOperationRequest;

  try {
    const data = await api.suggestClassDataProperties(body);
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
| **suggestClassDataPropertiesRequest** | [SuggestClassDataPropertiesRequest](SuggestClassDataPropertiesRequest.md) |  | [Optional] |

### Return type

**Array<string>**

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


## suggestClassSubclasses

> Array&lt;string&gt; suggestClassSubclasses(suggestClassDataPropertiesRequest)

Returns a list of possible subclasses for a given class

### Example

```ts
import {
  Configuration,
  PromptApi,
} from '';
import type { SuggestClassSubclassesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PromptApi(config);

  const body = {
    // SuggestClassDataPropertiesRequest (optional)
    suggestClassDataPropertiesRequest: ...,
  } satisfies SuggestClassSubclassesRequest;

  try {
    const data = await api.suggestClassSubclasses(body);
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
| **suggestClassDataPropertiesRequest** | [SuggestClassDataPropertiesRequest](SuggestClassDataPropertiesRequest.md) |  | [Optional] |

### Return type

**Array<string>**

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


## text2sparql

> string text2sparql(text2sparqlRequest)

Converts a natural language text into a SPARQL query

### Example

```ts
import {
  Configuration,
  PromptApi,
} from '';
import type { Text2sparqlOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new PromptApi(config);

  const body = {
    // Text2sparqlRequest (optional)
    text2sparqlRequest: ...,
  } satisfies Text2sparqlOperationRequest;

  try {
    const data = await api.text2sparql(body);
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
| **text2sparqlRequest** | [Text2sparqlRequest](Text2sparqlRequest.md) |  | [Optional] |

### Return type

**string**

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

