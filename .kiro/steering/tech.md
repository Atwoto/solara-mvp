# Technical Information

## Tech Stack

- **Core Platform**: [n8n](https://n8n.io/) - Fair-code licensed workflow automation platform
- **File Format**: JSON workflow definitions
- **Integration Types**:
  - REST APIs
  - Webhooks
  - Database connectors
  - AI/ML services
  - Cloud storage services
  - CRM platforms
  - Social media APIs
  - Messaging platforms

## Key Libraries & Integrations

### AI & Machine Learning

- OpenAI (GPT models, DALL-E)
- Google Gemini
- LangChain
- Anthropic Claude
- Mistral AI
- Ollama (local LLMs)
- Vector databases (Pinecone, Qdrant, Milvus, Supabase)

### Data & Storage

- Google Sheets/Drive
- Airtable
- Notion
- PostgreSQL
- MySQL
- MongoDB
- AWS S3
- Firebase

### Communication

- Slack
- Discord
- Telegram
- WhatsApp
- Email services (Gmail, Outlook)
- SMS services (Twilio, Plivo)

### CRM & Business

- HubSpot
- Salesforce
- Pipedrive
- Zendesk
- Monday.com
- Linear

## Common Commands

### n8n CLI Commands

```bash
# Start n8n
n8n start

# Import a workflow
n8n import:workflow --input=workflow-file.json

# Export a workflow
n8n export:workflow --id=123 --output=my-workflow.json

# Create a new workflow
n8n create:workflow

# List all workflows
n8n list:workflows
```

### Working with Workflows

- **Import**: In n8n UI, go to Workflows > Import From File
- **Export**: Open workflow, click on the three dots menu > Download
- **Activate/Deactivate**: Toggle the "Active" switch in the workflow editor
- **Execute**: Click "Execute Workflow" button in the editor

## Environment Setup

n8n workflows often require credentials and environment variables for API keys, tokens, and other sensitive information. These should be configured in the n8n credentials manager and not stored directly in the workflow JSON files.

## Testing

- Use the n8n workflow editor's execution preview to test workflows
- For webhook-triggered workflows, use tools like Postman or webhook.site to send test requests
- Monitor execution logs in the n8n UI for debugging
