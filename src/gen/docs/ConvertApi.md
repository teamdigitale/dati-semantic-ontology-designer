# ConvertApi

All URIs are relative to *https://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getOntologyDraftAIDownload**](ConvertApi.md#getontologydraftaidownload) | **POST** /ai/ontologyDraft/download | Download the ontology draft converted in OWL2 |
| [**postOntologyDraftAIConvertOWL**](ConvertApi.md#postontologydraftaiconvertowl) | **POST** /ai/ontologyDraft/convertOWL | Convert an OWL file in RDFGraph model |



## getOntologyDraftAIDownload

> string getOntologyDraftAIDownload(format, rDFGraph)

Download the ontology draft converted in OWL2

### Example

```ts
import {
  Configuration,
  ConvertApi,
} from '';
import type { GetOntologyDraftAIDownloadRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ConvertApi(config);

  const body = {
    // string (optional)
    format: format_example,
    // RDFGraph (optional)
    rDFGraph: ...,
  } satisfies GetOntologyDraftAIDownloadRequest;

  try {
    const data = await api.getOntologyDraftAIDownload(body);
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
| **format** | `string` |  | [Optional] [Defaults to `undefined`] |
| **rDFGraph** | [RDFGraph](RDFGraph.md) |  | [Optional] |

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


## postOntologyDraftAIConvertOWL

> RDFGraph postOntologyDraftAIConvertOWL(file)

Convert an OWL file in RDFGraph model

### Example

```ts
import {
  Configuration,
  ConvertApi,
} from '';
import type { PostOntologyDraftAIConvertOWLRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ConvertApi(config);

  const body = {
    // Blob (optional)
    file: BINARY_DATA_HERE,
  } satisfies PostOntologyDraftAIConvertOWLRequest;

  try {
    const data = await api.postOntologyDraftAIConvertOWL(body);
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
| **file** | `Blob` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**RDFGraph**](RDFGraph.md)

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

