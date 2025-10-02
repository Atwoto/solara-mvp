# Project Structure

## Overview

This repository is organized as a flat collection of n8n workflow JSON files. Each file represents a complete, importable workflow that can be used in an n8n instance.

## File Organization

- **Root Directory**: Contains all workflow JSON files
- **.kiro/steering**: Contains guidance files for AI assistants working with this repository

## Workflow File Structure

Each JSON workflow file follows the standard n8n workflow structure:

```json
{
  "id": "unique-identifier",
  "name": "Workflow Name",
  "nodes": [
    // Array of node objects with configurations
  ],
  "connections": {
    // Object defining connections between nodes
  },
  "active": true|false,
  "settings": {
    // Optional workflow settings
  }
}
```

## Key Components

### Nodes

Nodes represent individual operations in a workflow. Each node has:

- **name**: Display name for the node
- **type**: The node type (e.g., "n8n-nodes-base.webhook")
- **position**: [x, y] coordinates for visual placement
- **parameters**: Configuration options specific to the node type
- **credentials**: References to stored credentials (when applicable)

### Connections

Connections define how data flows between nodes:

```json
"connections": {
  "Source Node Name": {
    "main": [
      [
        {
          "node": "Target Node Name",
          "type": "main",
          "index": 0
        }
      ]
    ]
  }
}
```

## Naming Conventions

Workflow files follow a descriptive naming convention that indicates their primary function:

- Files are named using title case with spaces
- Names typically describe the action and services involved (e.g., "Gmail to Notion Email Archiver.json")
- AI-powered workflows often include "AI" in the name

## Best Practices

When working with this repository:

1. **Do not modify** the original workflow files unless specifically requested
2. **Create new files** for new workflows or variations
3. **Use descriptive names** that follow the existing convention
4. **Remove sensitive data** like API keys or tokens before committing
5. **Document credentials required** in comments or documentation
