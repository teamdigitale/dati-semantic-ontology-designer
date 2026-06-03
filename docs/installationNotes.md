# Installation Notes

These are the installation notes for the ontology-designer, a tool for designing ontologies enhanced with AI.

## Architecture

The ontology-designer is composed of two components: a backend server and a frontend client. The backend is built using Python FastAPI, while the frontend is developed with React. The two components communicate via RESTful APIs.

## System Requirements

- **Python 3.8+** (for installing and running the backend server)
- **Java 17+** (used by the backend server)
- **Node.js 14+** (for building the frontend application)
- **Apache Server** (for hosting the frontend application)

## Installation Steps

### Backend Installation

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/teamdigitale/dati-semantic-ontology-ai-assistant.git
cd dati-semantic-ontology-ai-assistant
```

Project installation follows standard Python packaging guidelines:

```bash
# create and activate a Python virtual environment (optional yet recommended)
python3 -m venv <venv-path>
source <venv-path>/bin/activate

# Install through the pip package manager
pip install .
```

Supported Python versions are 3.9 or later. Other available dependency profiles
are `dev` for development and `tests` for unit tests, e.g.:

```bash
pip install -e .[dev,tests]
```

where the `-e` option installs in development mode.

Copy `env.example` file into a new file called `.env` and change the value of following variables:

The following table describes the role of environment variables:

| **Variable** | **Explanation** | **Mandatory** | **Type** | **Default value** |
|--------------|-----------------|---------------|----------|-------------------|
|**NO_AUTH**|set to `True` to disable authentication|Yes|boolean|True|
|**WORKING_DIR**|Storage location of data/file|Yes (only for no public version)|string|current working directory|
|**GRAPH_FILE_EXT**|Format of the file containing the graph|No|string|gscape|
|**LOG_LEVEL**|Log tracking level|No|string|INFO|
|**LOG_DIR**|Log file location|No|string|current working directory|
|**VERBOSE**|Log verbosity level|No|boolean|False|
|**LOG_MAX_BYTES**|Log file max size in bytes|No|integer|10485760|
|**LOG_BACKUP_COUNT**|Number of backup files to keep|No|integer|5|
|**NO_AUTH**|Authentication required notice|Yes|boolean|False|
|**WEB_CONCURRENCY**|Number of possible concurrent workers|No|string|1|
|**ENABLE_LLM_CACHE**|Enables caching for LLM responses to avoid redundant computations|No|boolean|False|
|**ENABLE_LLM_CACHE_FOR_EXTRACT**|Enables caching for ontology extraction steps to reduce LLM costs|No|boolean|False|
|**ENABLE_VDB_LOAD**|Enables Vector DB loading|No|boolean|True|
|**ENABLE_VDB_LOAD_FOR_EXTRACT**|Enables Vector DB loading after ontology extraction|No|boolean|False|
|**ENABLE_DISK_PERSIST**|Enables disk data storage|No|boolean|False|
|**PROMPTS_LANGUAGE**|Prompt language, possible values: Italian or English|No|string|Italian|
|**SUMMARY_LANGUAGE**|Ontology annotation language (specify in `PROMPTS_LANGUAGE`)|No|string|italiano|
|**IRI_LANGUAGE**|Language of ontology entities identification name (specify in `PROMPTS_LANGUAGE`)|No|string|inglese|
|**IRI_FORMAT**|Style of ontology entities identification name, possible values: camelCase or snake_case_|No|string|camelCase|
|**COSINE_THRESHOLD**|Cosine threshold of vector DB retrieval for entity types, relations and chunks|No|decimal|0.2|
|**ENABLE_RERANK**|Enables rerank function|No|boolean|True|
|**RERANK_MODEL**|Model of rerank function|Yes|string|no default|
|**RERANK_BINDING_HOST**|Rerank API endpoint|Yes|string|no default|
|**RERANK_BINDING_API_KEY**|Rerank API key|Yes|string|no default|
|**LLM_MODEL**|LLM model|Yes|string|no default|
|**LLM_BINDING**|LLM model type|No|string|openai|
|**LLM_BINDING_HOST**|LLM API endpoint|Yes|string|no default|
|**LLM_BINDING_API_KEY**|LLM API key|Yes|string|no default|
|**TEMPERATURE**|LLM temperature parameter|No|decimal|0.5|
|**SEED**|LLM seed parameter|No|integer|not set|
|**TIMEOUT**|Maximum waiting time for a LLM response|No|integer|not set|
|**EMBEDDING_MODEL**|Embedding model|Yes|string|no default|
|**EMBEDDING_BINDING**|Embedding model type|No|string|openai|
|**EMBEDDING_BINDING_HOST**|Embedding API endpoint|Yes|string|no default|
|**EMBEDDING_BINDING_API_KEY**|Embedding API key|Yes|string|no default|
|**EMBEDDING_DIM**|Embedding vector dimensions|Yes|integer|1024|
|**EMBEDDING_MAX_TOKENS_**|Embedding maximum input length|Yes|integer|8192|

### Backend Usage

Once installed you can start the FastAPI backend through the `ai_assistant` command:

```bash
ai_assistant server run
```

You can use the `-h` (or `--help`) option to list the available configuration options for the backend, e.g.:

```bash
ai_assistant server run -b 0.0.0.0 -m /ai-assistant -p 8200 -d cache_dir
```

where:
* `-b` sets the host to bind to (default is localhost)
* `-m` sets the mount path of the backend (default is `/`)
* `-p` sets the port to listen to (default is `8200`)
* `-d` sets the directory to store the vector db files (defaults to the current folder)

### Frontend Installation

The frontend application is built using React and can be installed using npm. To install the frontend, navigate to the `frontend` directory and run the following command:

```bash
npm install
```

Then you have to configure the frontend to communicate with the backend server by updating the `src/config.js` file with the appropriate backend URL and port.

The content of the `src/config.js` file should look like this:

```javascript
window["aiConfig"] = {
  basePath: "http://127.0.0.1:8200",
  headers: {
    Authorization: "Bearer ontology-designer"
  }
}
```

In order to build  a lightweight and optimised version of the frontend application, run the following command:

```bash
npm run build
```
This will create a `build` directory containing the optimized frontend application, which can be served using an Apache server or any static file server.

### Frontend Usage

To serve the frontend application, you can use an Apache server or any static file server. If using Apache, you can configure it to serve the contents of the `build` directory by copying the contents to the appropriate directory (e.g., `/var/www/html`).

Once the frontend is served, you can access it through a web browser by navigating to the URL where the frontend is hosted (e.g., `http://localhost`).