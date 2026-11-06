# Installing the HuntAPI MCP server

Instructions for AI agents installing this server for a user.

1. Check that Node.js 20 or newer is available (`node --version`).
2. Ask the user for their HuntAPI API key. They can create one at https://app.huntapi.com/register and copy it from https://app.huntapi.com.
   Never print the key back or commit it to a file in a repository.
3. Prefer the hosted server: add it with URL `https://mcp.huntapi.com/` and the header `x-api-key: <key>`:

```json
{
  "mcpServers": {
    "huntapi": {
      "url": "https://mcp.huntapi.com/",
      "headers": {
        "x-api-key": "YOUR_API_KEY"
      }
    }
  }
}
```

Or run it locally over stdio:

```json
{
  "mcpServers": {
    "huntapi": {
      "command": "npx",
      "args": ["-y", "@huntapi/mcp"],
      "env": {
        "HUNTAPI_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

4. Restart the client and check that the `audio_download` tool is listed.

The server needs no other configuration. Each tool call that reaches the API consumes HuntAPI credits.
