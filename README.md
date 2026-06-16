# Ontology Designer

The Ontology Designer is a tool that lets you graphically create and edit an ontology.

## Getting Started

### Docker Compose (recommended)

The Ontology Designer requires the [AI assistant backend](https://github.com/teamdigitale/dati-semantic-ontology-ai-assistant) for OWL import/export and optional AI features.

```bash
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:8200

Optional: copy `.env.example` to `.env` and configure LLM/embedding API keys to enable AI Design, AI Explain, and related features. OWL conversion works without them.

See `docs/installationNotes.md` for manual installation and backend configuration details.

### Local development

- `npm install`: Install dependencies
- `npm run dev`: Start the development server for testing
  - Open your browser and navigate to `http://localhost:5173/`
- `npm run build`: Build the application for deployment. Configure `config.js` to connect the ontology designer to the URL where the [ai-assistant](https://github.com/teamdigitale/dati-semantic-ontology-ai-assistant) is served.

## Development

The ontology designer is developed in React + ViteJS and uses two main libraries:

- [Ant Design](https://github.com/ant-design/ant-design): for main components
- [Grapholscape](https://github.com/obdasystems/grapholscape): to visualize ontologies

## Manual

Installation and usage manuals are mantained under the `docs` folder.