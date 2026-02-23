# n8n-nodes-wcrm

This is an n8n community node for the **wCRM WhatsApp Cloud API**. It allows you to send and receive WhatsApp messages directly from your n8n workflows, build complex AI-powered chatbots, and manage conversation history — making it a comprehensive alternative to the official WhatsApp API node.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

- **Send Messages** — Text, Image, Audio, Document, Video, Interactive Lists, Interactive Buttons
- **Send Templates** — Pre-approved WhatsApp template messages with variable substitution and media
- **Receive Incoming Messages** — Webhook trigger node to capture all incoming WhatsApp messages in real time
- **Internal Message Store** — Save, retrieve, filter, and clear incoming message payloads for chatbot context and conversation history
- **Chatbot Ready** — Designed for complex chatbot workflows with OpenAI, database queries, catalog integrations, and more

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings > Community Nodes** in your n8n instance.
2. Select **Install**.
3. Enter `n8n-nodes-wcrm` in the **Enter npm package name** field.
4. Agree to the risks of using community nodes and select **Install**.

## Credentials

To use this node you need a **wCRM API Key**.

1. In n8n, go to **Credentials** and create a new credential of type **wCRM API**.
2. Enter your **API Key** obtained from your wCRM dashboard.
3. Save the credential.

This single API Key is used to authenticate all requests to the wCRM API.

### Incoming Messages — Callback URI Setup

The wCRM platform forwards all incoming WhatsApp message payloads to your n8n webhook URL.

- **If you are using the SRLINES n8n instance**, your callback URI is already configured — no action needed.
- **If you are self-hosting n8n**, copy your wCRM Trigger webhook URL from the active workflow and provide it to **SRLINES support** so they can configure it in your wCRM account.

## Nodes

This package includes two nodes:

| Node | Type | Description |
|---|---|---|
| **wCRM** | Action | Send messages, templates, and manage the internal message store |
| **wCRM Trigger** | Trigger | Receives incoming WhatsApp messages via webhook |

## Operations

### Message (Send)

Send WhatsApp messages of various types:

| Operation | Description |
|---|---|
| **Send Text** | Send a plain text message with optional URL preview |
| **Send Image** | Send an image by providing a URL |
| **Send Audio** | Send an audio file by providing a URL |
| **Send Document** | Send a document with an optional caption |
| **Send Video** | Send a video with an optional caption |
| **Send Interactive List** | Send an interactive list message with sections and rows |
| **Send Interactive Buttons** | Send an interactive button message with reply buttons |

### Template (Send)

| Operation | Description |
|---|---|
| **Send Template** | Send a pre-approved WhatsApp template message with variable substitution and optional media |

### Message Store

Manage stored incoming messages for chatbot context and conversation history:

| Operation | Description |
|---|---|
| **Get All Messages** | Retrieve all stored incoming messages |
| **Get Messages by Phone** | Retrieve messages filtered by sender phone number |
| **Save Message** | Manually save a message payload to the internal store |
| **Clear Messages** | Clear all stored messages |

## Usage

### Receiving Incoming Messages (wCRM Trigger)

1. Add the **wCRM Trigger** node to your workflow as the starting node.
2. Configure your wCRM API credentials.
3. Activate the workflow — n8n generates a webhook URL.
4. If self-hosting, provide the webhook URL to SRLINES support for callback configuration.
5. Incoming WhatsApp messages will now trigger your workflow with the full message payload.

The trigger node outputs:
- `body` — The raw incoming message payload from WhatsApp
- `from` — Sender's phone number
- `messageType` — Type of message (text, image, audio, etc.)
- `textBody` — The text content (for text messages)
- `timestamp` — Message timestamp
- `headers` — HTTP headers from the webhook request

The trigger node can also **automatically store** incoming messages in the workflow's internal data store (enabled by default) for later reference in chatbot conversations.

### Sending a Text Message

1. Add the **wCRM** node to your workflow.
2. Select **Message** as the Resource and **Send Text** as the Operation.
3. Enter the recipient's phone number (with country code, e.g. `+1234567890`).
4. Enter the message body text.
5. Optionally enable URL preview.

### Sending Media (Image/Audio/Document/Video)

1. Select the appropriate operation (Send Image, Send Audio, etc.).
2. Enter the recipient's phone number.
3. Provide the publicly accessible URL of the media file.
4. For documents and videos, you can add an optional caption.

### Sending Interactive List

1. Select **Send Interactive List** as the operation.
2. Provide header text, body text, footer text, and button text.
3. Define sections as JSON, for example:
```json
[
  {
    "title": "Section 1",
    "rows": [
      {
        "id": "row_1",
        "title": "Option 1",
        "description": "Description for option 1"
      }
    ]
  }
]
```

### Sending Interactive Buttons

1. Select **Send Interactive Buttons** as the operation.
2. Provide the body text.
3. Define buttons as JSON, for example:
```json
[
  {
    "type": "reply",
    "reply": {
      "id": "btn_yes",
      "title": "Yes"
    }
  },
  {
    "type": "reply",
    "reply": {
      "id": "btn_no",
      "title": "No"
    }
  }
]
```

### Sending a Template Message

1. Select **Template** as the Resource and **Send Template** as the Operation.
2. Enter the recipient's phone number.
3. Enter the template name as configured in your WhatsApp Business account.
4. Provide template variables as a JSON array (e.g. `["John", "Order #123"]`).
5. Optionally provide a media URI to attach media to the template.

### Using the Message Store

The internal message store allows you to save and reference past messages within your chatbot workflows:

1. **Auto-storage via Trigger** — Enable "Store Incoming Messages" on the wCRM Trigger node to automatically save all incoming messages.
2. **Manual save** — Use the wCRM node with Resource: **Message Store** → Operation: **Save Message** to save any message payload.
3. **Retrieve all** — Use **Get All Messages** to fetch the complete conversation history.
4. **Filter by phone** — Use **Get Messages by Phone** to get messages from a specific sender.
5. **Clear** — Use **Clear Messages** to reset the store.

## Building Complex Chatbot Workflows

The wCRM node is designed for building sophisticated WhatsApp chatbots. Here are common patterns:

### AI-Powered Chatbot (with OpenAI)

```
[wCRM Trigger] → [wCRM: Get Messages by Phone] → [OpenAI] → [wCRM: Send Text]
```

1. **wCRM Trigger** receives the incoming message.
2. **wCRM (Message Store: Get Messages by Phone)** retrieves conversation history for that sender.
3. Pass the incoming message + conversation history to an **OpenAI** node as context.
4. **wCRM (Send Text)** sends the AI-generated response back to the user.

### Catalog / Database Lookup Bot

```
[wCRM Trigger] → [IF: Check Message Type] → [Database/HTTP Node] → [OpenAI] → [wCRM: Send Text/Image/Document]
```

1. **wCRM Trigger** receives the incoming query from the customer.
2. **IF node** checks the message type or content to determine intent.
3. Query your **database** (MySQL, PostgreSQL, etc.) or **HTTP Request** node to fetch product catalog, order status, etc.
4. Merge the query results with the customer question and send to **OpenAI** for a natural language response.
5. **wCRM** sends the response back — as text, image, document, or interactive list depending on the content.

### Interactive Menu Bot

```
[wCRM Trigger] → [Switch] → [wCRM: Send Interactive List/Buttons] → [wCRM Trigger] → [Process Selection]
```

1. Send an interactive list or button message to present options.
2. When the user selects an option, the trigger receives the selection.
3. Process the selection (query database, call API, generate AI response, etc.).
4. Reply with the result or present further options.

### Multi-Step Workflow with Message History

```
[wCRM Trigger] → [wCRM: Save Message] → [wCRM: Get Messages by Phone] → [Code/Function] → [OpenAI] → [wCRM: Send Text]
```

1. Save each incoming message to the store for context.
2. Retrieve full conversation history for the sender.
3. Use a **Code** or **Function** node to format the conversation as a prompt.
4. Send to **OpenAI** with full context for an informed response.
5. Reply via wCRM.

### Key Tips for Chatbot Workflows

- **Use the Message Store** to maintain conversation context across multiple interactions.
- **Combine with n8n's built-in nodes** — IF, Switch, Merge, Code, HTTP Request, database nodes.
- **Chain with OpenAI/AI nodes** for intelligent, context-aware responses.
- **Use Interactive Lists and Buttons** for structured user input (menus, confirmations, selections).
- **Use Templates** for standardized messages (order confirmations, appointment reminders, etc.).
- **Reference old messages** via the Message Store to provide contextual responses.

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Watch for changes during development
npm run dev
```

## License

[MIT](LICENSE)
