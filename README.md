# HuntAPI MCP Server

Official [Model Context Protocol](https://modelcontextprotocol.io) server for the [HuntAPI](https://www.huntapi.com) media download API.

Download video and audio from public media URLs, or extract their metadata, with one async REST API.

It lets Claude, Cursor, VS Code, Windsurf and any MCP client call the API as tools. Runs over **stdio** (local) or **Streamable HTTP** (self-hosted).

## Requirements

- Node.js 20 or newer
- a HuntAPI API key — [sign up](https://app.huntapi.com/register), then copy it from the [dashboard](https://app.huntapi.com)

## Hosted server (recommended)

HuntAPI runs this server for you at **`https://mcp.huntapi.com/`** (Streamable HTTP). Send your API key in the `x-api-key` header; nothing to install.

```sh
claude mcp add --transport http huntapi https://mcp.huntapi.com/ --header "x-api-key: YOUR_API_KEY"
```

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

The hosted server and this package expose the same API; run the package locally when you want stdio, your own network egress, or to self-host it.

## Run it locally

### Claude Code

```sh
claude mcp add huntapi --env HUNTAPI_API_KEY=YOUR_API_KEY -- npx -y @huntapi/mcp
```

### Claude Desktop, Cursor, Windsurf and other clients

Add the server to the client's MCP configuration (`claude_desktop_config.json`, `.cursor/mcp.json`…):

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

### VS Code

```json
{
  "servers": {
    "huntapi": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@huntapi/mcp"],
      "env": {
        "HUNTAPI_API_KEY": "${input:huntapi-api-key}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "huntapi-api-key",
      "description": "HuntAPI API key",
      "password": true
    }
  ]
}
```

### Claude Desktop extension

Download the `.mcpb` bundle from the releases page and open it; Claude Desktop asks for your API key.

### Docker

```sh
docker build -t huntapi-mcp .
docker run -i --rm -e HUNTAPI_API_KEY=YOUR_API_KEY huntapi-mcp
```

## Tools

| Tool             | Description                                                                                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audio_download` | Download audio from a URL via HuntAPI and receive a job id.                                                                                                                   |
| `jobs`           | Poll status, progress (0–100), and result of an async HuntAPI job.                                                                                                            |
| `media_metadata` | Extract metadata from a media URL without downloading the file.                                                                                                               |
| `stats`          | Infrastructure health for an engine or endpoint over the last hour. Not scoped to your account or tenant. Enabled per account: HTTP 403 means contact support to activate it. |
| `usage`          | Retrieve real-time usage statistics and credit balance for your Huntapi account.                                                                                              |
| `video_download` | Video Download                                                                                                                                                                |
| `wait_for_job`   | Wait for an async download job to finish.                                                                                                                                     |

Every tool that calls the API consumes credits. JSON results are returned as text; images are returned inline and other files (PDF…) as embedded resources, up to 4 MB.

## Streamable HTTP

```sh
npx @huntapi/mcp --http --port 3000
```

The endpoint is `POST /mcp` (stateless, JSON responses). Each client sends its own key in the `x-api-key` header (or `Authorization: Bearer <key>`); the server never uses a key of its own. It binds to `127.0.0.1` by default and rejects browser origins unless you allow them — put it behind TLS before exposing it.

`createHttpHandler()` is exported for Fetch-compatible runtimes (Cloudflare Workers, Deno, Bun):

```ts
import { createHttpHandler } from "@huntapi/mcp";

export default { fetch: createHttpHandler({ allowedOrigins: [] }) };
```

## Security

- The API key is read from `HUNTAPI_API_KEY` (stdio) or the request headers (HTTP) and removed from error messages.
- Content fetched from websites is untrusted: the server instructions tell the model to treat it as data, not instructions.
- See [SECURITY.md](SECURITY.md) to report a vulnerability.

## Development

```sh
npm install
npm test
npm run build
npx @modelcontextprotocol/inspector node dist/stdio.js
```

## Built on the SDK

The server uses the official [Node.js SDK](https://github.com/huntapi/huntapi-node) (`@huntapi/sdk`).

## License

MIT — see [LICENSE](LICENSE).
