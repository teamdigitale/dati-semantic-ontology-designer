# MetadataApi

All URIs are relative to *https://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**postAIOntologyDraftMetadata**](MetadataApi.md#postaiontologydraftmetadata) | **POST** /ai/ontologyDraft/metadata | Download a new version to the ontology enriched with the metadata provided in the request body. |



## postAIOntologyDraftMetadata

> string postAIOntologyDraftMetadata(format, newVersion, file, metadata)

Download a new version to the ontology enriched with the metadata provided in the request body.

### Example

```ts
import {
  Configuration,
  MetadataApi,
} from '';
import type { PostAIOntologyDraftMetadataRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: jwt
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new MetadataApi(config);

  const body = {
    // string (optional)
    format: format_example,
    // string (optional)
    newVersion: newVersion_example,
    // Blob (optional)
    file: BINARY_DATA_HERE,
    // MWSXOntologyCatalogOntologyMetadataSet (optional)
    metadata: ...,
  } satisfies PostAIOntologyDraftMetadataRequest;

  try {
    const data = await api.postAIOntologyDraftMetadata(body);
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
| **newVersion** | `string` |  | [Optional] [Defaults to `undefined`] |
| **file** | `Blob` |  | [Optional] [Defaults to `undefined`] |
| **metadata** | [MWSXOntologyCatalogOntologyMetadataSet](MWSXOntologyCatalogOntologyMetadataSet.md) |  | [Optional] [Defaults to `undefined`] |

### Return type

**string**

### Authorization

[jwt](../README.md#jwt)

### HTTP request headers

- **Content-Type**: `multipart/form-data`
- **Accept**: `text/plain`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **401** | Unhauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

