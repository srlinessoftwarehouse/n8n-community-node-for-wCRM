# n8n-nodes-wcrm

This is an n8n community node for the **wCRM WhatsApp Cloud API**. It allows you to send WhatsApp messages directly from your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

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

## Operations

### Message

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

### Template

| Operation | Description |
|---|---|
| **Send Template** | Send a pre-approved WhatsApp template message with variable substitution and optional media |

## Usage

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
