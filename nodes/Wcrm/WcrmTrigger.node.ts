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
					'<b>Callback URI Setup:</b><br>' +
					'If you are using the <b>SRLINES n8n instance</b>, your callback URI is already configured — no action needed.<br><br>' +
					'If you are self-hosting n8n, provide your webhook URL (shown below after activating the workflow) to <b>SRLINES support</b> so they can configure it in your wCRM account.',
				name: 'notice',
				type: 'notice',
				default: '',
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

		const outputData: IDataObject = {
			headers: req.headers as IDataObject,
			body,
		};

		// Extract common fields for easier downstream use
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

		const returnItem: INodeExecutionData = {
			json: outputData,
		};

		return {
			workflowData: [[returnItem]],
		};
	}
}
