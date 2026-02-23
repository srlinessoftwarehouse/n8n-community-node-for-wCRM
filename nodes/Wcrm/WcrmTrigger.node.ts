import {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

export class WcrmTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'wCRM Trigger',
		name: 'wcrmTrigger',
		icon: 'file:wcrm.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '=Incoming WhatsApp Message',
		description: 'Receives incoming WhatsApp messages forwarded by wCRM via webhook. Use this as the starting point for chatbot workflows.',
		defaults: {
			name: 'wCRM Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'wcrmApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'wcrm-webhook',
			},
		],
		properties: [
			{
				displayName:
					'This node listens for incoming WhatsApp messages forwarded by wCRM to your n8n webhook URL.<br><br>' +
					'<b>Webhook URL:</b><br>' +
					'Production: <code>https://&lt;your-domain&gt;/webhook/&lt;webhook-path&gt;</code><br>' +
					'Test: <code>https://&lt;your-domain&gt;/webhook-test/&lt;webhook-path&gt;</code><br><br>' +
					'<b>Callback URI Setup:</b><br>' +
					'If you are using the <b>SRLINES n8n instance</b>, your callback URI is already configured — no action needed.<br><br>' +
					'If you are self-hosting n8n, copy your webhook URL (shown above the node after activating the workflow) and provide it to <b>SRLINES support</b> so they can configure it in your wCRM account.<br><br>' +
					'<b>Note:</b> Make sure <code>N8N_COMMUNITY_PACKAGES_ENABLED=true</code> is set in your n8n environment variables.',
				name: 'notice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Webhook Path',
				name: 'webhookPath',
				type: 'string',
				default: 'wcrm-webhook',
				required: true,
				placeholder: 'e.g. wcrm-webhook-project1',
				description: 'The path segment used in the webhook URL. Use lowercase letters, numbers, and hyphens only (e.g., wcrm-webhook-project1). Change this to a unique value if you have multiple wCRM Trigger workflows to avoid conflicts.',
			},
			{
				displayName: 'Store Incoming Messages',
				name: 'storeMessages',
				type: 'boolean',
				default: true,
				description: 'Whether to automatically store incoming message payloads in workflow static data for later reference in chatbot workflows',
			},
			{
				displayName: 'Max Stored Messages',
				name: 'maxStoredMessages',
				type: 'number',
				default: 100,
				description: 'Maximum number of messages to keep in the internal message store (oldest messages are removed first)',
				displayOptions: {
					show: {
						storeMessages: [true],
					},
				},
			},
		],
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;

		if (!body || Object.keys(body).length === 0) {
			throw new NodeOperationError(
				this.getNode(),
				'Received empty webhook payload',
			);
		}

		const storeMessages = this.getNodeParameter('storeMessages', false) as boolean;

		if (storeMessages) {
			const maxStoredMessages = this.getNodeParameter('maxStoredMessages', 100) as number;
			const staticData = this.getWorkflowStaticData('node');

			if (!staticData.messages) {
				staticData.messages = [];
			}
			const messages = staticData.messages as IDataObject[];

			const storedMessage: IDataObject = {
				id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
				receivedAt: new Date().toISOString(),
				payload: body,
			};

			messages.push(storedMessage);

			while (messages.length > maxStoredMessages) {
				messages.shift();
			}

			staticData.messages = messages;
		}

		const webhookUrl = this.getNodeWebhookUrl('default');

		const outputData: IDataObject = {
			webhookId: this.getNode().id,
			webhookUrl: webhookUrl ?? '',
			headers: req.headers as IDataObject,
			body,
		};

		// Detect Meta WhatsApp webhook format (original payload) vs flat/pre-processed format
		if (body.object === 'whatsapp_business_account' && Array.isArray(body.entry)) {
			// Original Meta WhatsApp webhook payload
			const entries = body.entry as IDataObject[];
			if (entries.length > 0) {
				const entry = entries[0] as IDataObject;
				const changes = entry.changes as IDataObject[] | undefined;
				if (Array.isArray(changes) && changes.length > 0) {
					const change = changes[0] as IDataObject;
					const value = change.value as IDataObject | undefined;
					if (value) {
						// Extract metadata (phone_number_id, display_phone_number)
						const metadata = value.metadata as IDataObject | undefined;
						if (metadata) {
							outputData.phoneNumberId = metadata.phone_number_id;
							outputData.displayPhoneNumber = metadata.display_phone_number;
						}

						// Extract contact info
						const contacts = value.contacts as IDataObject[] | undefined;
						if (Array.isArray(contacts) && contacts.length > 0) {
							const contact = contacts[0] as IDataObject;
							outputData.contactWaId = contact.wa_id;
							const profile = contact.profile as IDataObject | undefined;
							if (profile) {
								outputData.contactName = profile.name;
							}
						}

						// Extract message fields
						const messages = value.messages as IDataObject[] | undefined;
						if (Array.isArray(messages) && messages.length > 0) {
							const message = messages[0] as IDataObject;
							outputData.from = message.from;
							outputData.messageId = message.id;
							outputData.messageType = message.type;
							outputData.timestamp = message.timestamp;
							if (message.text && typeof message.text === 'object') {
								outputData.textBody = (message.text as IDataObject).body;
							}
						}

						// Extract statuses if present (delivery receipts)
						const statuses = value.statuses as IDataObject[] | undefined;
						if (Array.isArray(statuses) && statuses.length > 0) {
							outputData.statuses = statuses;
						}
					}
				}
			}
		} else {
			// Flat / pre-processed payload (backward compatible)
			if (body.from) {
				outputData.from = body.from;
			}
			if (body.type) {
				outputData.messageType = body.type;
			}
			if (body.timestamp) {
				outputData.timestamp = body.timestamp;
			}
			if (body.text && typeof body.text === 'object') {
				outputData.textBody = (body.text as IDataObject).body;
			}
		}

		const returnItem: INodeExecutionData = {
			json: outputData,
		};

		return {
			workflowData: [[returnItem]],
		};
	}
}
