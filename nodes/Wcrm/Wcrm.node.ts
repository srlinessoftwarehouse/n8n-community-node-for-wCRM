import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
	NodeOperationError,
} from 'n8n-workflow';

import { wcrmApiRequest } from './GenericFunctions';

export class Wcrm implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'wCRM',
		name: 'wcrm',
		icon: 'file:wcrm.svg',
		group: ['output'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Send messages via wCRM WhatsApp Cloud API',
		defaults: {
			name: 'wCRM',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'wcrmApi',
				required: true,
			},
		],
		properties: [
			// ----------------------------------
			//         Resource
			// ----------------------------------
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Message',
						value: 'message',
						description: 'Send a WhatsApp message',
					},
					{
						name: 'Message Store',
						value: 'messageStore',
						description: 'Manage stored incoming messages for chatbot reference',
					},
					{
						name: 'Template',
						value: 'template',
						description: 'Send a WhatsApp template message',
					},
				],
				default: 'message',
			},

			// ----------------------------------
			//         Message Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['message'],
					},
				},
				options: [
					{
						name: 'Send Text',
						value: 'sendText',
						description: 'Send a text message',
						action: 'Send a text message',
					},
					{
						name: 'Send Image',
						value: 'sendImage',
						description: 'Send an image message',
						action: 'Send an image message',
					},
					{
						name: 'Send Audio',
						value: 'sendAudio',
						description: 'Send an audio message',
						action: 'Send an audio message',
					},
					{
						name: 'Send Document',
						value: 'sendDocument',
						description: 'Send a document message',
						action: 'Send a document message',
					},
					{
						name: 'Send Video',
						value: 'sendVideo',
						description: 'Send a video message',
						action: 'Send a video message',
					},
					{
						name: 'Send Interactive List',
						value: 'sendInteractiveList',
						description: 'Send an interactive list message',
						action: 'Send an interactive list message',
					},
					{
						name: 'Send Interactive Buttons',
						value: 'sendInteractiveButtons',
						description: 'Send an interactive button message',
						action: 'Send an interactive button message',
					},
				],
				default: 'sendText',
			},

			// ----------------------------------
			//         Template Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['template'],
					},
				},
				options: [
					{
						name: 'Send Template',
						value: 'sendTemplate',
						description: 'Send a template message',
						action: 'Send a template message',
					},
				],
				default: 'sendTemplate',
			},

			// ----------------------------------
			//         Message Store Operations
			// ----------------------------------
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['messageStore'],
					},
				},
				options: [
					{
						name: 'Get All Messages',
						value: 'getAllMessages',
						description: 'Retrieve all stored incoming messages',
						action: 'Retrieve all stored messages',
					},
					{
						name: 'Get Messages by Phone',
						value: 'getMessagesByPhone',
						description: 'Retrieve stored messages filtered by sender phone number',
						action: 'Get messages by phone number',
					},
					{
						name: 'Save Message',
						value: 'saveMessage',
						description: 'Manually save a message payload to the internal store',
						action: 'Save a message to the store',
					},
					{
						name: 'Clear Messages',
						value: 'clearMessages',
						description: 'Clear all stored messages',
						action: 'Clear all stored messages',
					},
				],
				default: 'getAllMessages',
			},

			// ----------------------------------
			//         Message Store Fields
			// ----------------------------------
			{
				displayName: 'Phone Number',
				name: 'filterPhone',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. +1234567890',
				description: 'Filter messages by this sender phone number',
				displayOptions: {
					show: {
						resource: ['messageStore'],
						operation: ['getMessagesByPhone'],
					},
				},
			},
			{
				displayName: 'Message Payload (JSON)',
				name: 'messagePayload',
				type: 'json',
				default: '{}',
				required: true,
				description: 'The message payload to store. You can pass the raw incoming message body here.',
				displayOptions: {
					show: {
						resource: ['messageStore'],
						operation: ['saveMessage'],
					},
				},
			},

			// ----------------------------------
			//         Common Fields
			// ----------------------------------
			{
				displayName: 'Recipient Phone Number',
				name: 'to',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'e.g. +1234567890',
				description: 'The phone number of the recipient (with country code)',
				displayOptions: {
					show: {
						resource: ['message', 'template'],
					},
				},
			},

			// ----------------------------------
			//         Text Message Fields
			// ----------------------------------
			{
				displayName: 'Message Body',
				name: 'textBody',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				required: true,
				description: 'The text content of the message',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendText'],
					},
				},
			},
			{
				displayName: 'Preview URL',
				name: 'previewUrl',
				type: 'boolean',
				default: false,
				description: 'Whether to show a URL preview in the message',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendText'],
					},
				},
			},

			// ----------------------------------
			//         Image Message Fields
			// ----------------------------------
			{
				displayName: 'Image URL',
				name: 'imageUrl',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://example.com/image.jpg',
				description: 'The URL of the image to send',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendImage'],
					},
				},
			},

			// ----------------------------------
			//         Audio Message Fields
			// ----------------------------------
			{
				displayName: 'Audio URL',
				name: 'audioUrl',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://example.com/audio.mp3',
				description: 'The URL of the audio file to send',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendAudio'],
					},
				},
			},

			// ----------------------------------
			//         Document Message Fields
			// ----------------------------------
			{
				displayName: 'Document URL',
				name: 'documentUrl',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://example.com/document.pdf',
				description: 'The URL of the document to send',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDocument'],
					},
				},
			},
			{
				displayName: 'Caption',
				name: 'documentCaption',
				type: 'string',
				default: '',
				description: 'Caption for the document',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendDocument'],
					},
				},
			},

			// ----------------------------------
			//         Video Message Fields
			// ----------------------------------
			{
				displayName: 'Video URL',
				name: 'videoUrl',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'https://example.com/video.mp4',
				description: 'The URL of the video to send',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendVideo'],
					},
				},
			},
			{
				displayName: 'Caption',
				name: 'videoCaption',
				type: 'string',
				default: '',
				description: 'Caption for the video',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendVideo'],
					},
				},
			},

			// ----------------------------------
			//         Interactive List Fields
			// ----------------------------------
			{
				displayName: 'Header Text',
				name: 'listHeaderText',
				type: 'string',
				default: '',
				required: true,
				description: 'Header text for the interactive list',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendInteractiveList'],
					},
				},
			},
			{
				displayName: 'Body Text',
				name: 'listBodyText',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				required: true,
				description: 'Body text for the interactive list',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendInteractiveList'],
					},
				},
			},
			{
				displayName: 'Footer Text',
				name: 'listFooterText',
				type: 'string',
				default: '',
				description: 'Footer text for the interactive list',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendInteractiveList'],
					},
				},
			},
			{
				displayName: 'Button Text',
				name: 'listButtonText',
				type: 'string',
				default: '',
				required: true,
				description: 'Text for the list action button',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendInteractiveList'],
					},
				},
			},
			{
				displayName: 'Sections (JSON)',
				name: 'listSections',
				type: 'json',
				default: '[\n  {\n    "title": "Section 1",\n    "rows": [\n      {\n        "id": "row_1",\n        "title": "Row 1",\n        "description": "Description for Row 1"\n      }\n    ]\n  }\n]',
				required: true,
				description: 'JSON array of sections. Each section has a "title" and "rows" array. Each row has "id", "title", and "description".',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendInteractiveList'],
					},
				},
			},

			// ----------------------------------
			//         Interactive Button Fields
			// ----------------------------------
			{
				displayName: 'Body Text',
				name: 'buttonBodyText',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				default: '',
				required: true,
				description: 'Body text for the button message',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendInteractiveButtons'],
					},
				},
			},
			{
				displayName: 'Buttons (JSON)',
				name: 'buttons',
				type: 'json',
				default: '[\n  {\n    "type": "reply",\n    "reply": {\n      "id": "button_1",\n      "title": "Button 1"\n    }\n  }\n]',
				required: true,
				description: 'JSON array of buttons. Each button has "type" (set to "reply") and a "reply" object with "id" and "title".',
				displayOptions: {
					show: {
						resource: ['message'],
						operation: ['sendInteractiveButtons'],
					},
				},
			},

			// ----------------------------------
			//         Template Fields
			// ----------------------------------
			{
				displayName: 'Template Name',
				name: 'templateName',
				type: 'string',
				default: '',
				required: true,
				description: 'The name of the template to send',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['sendTemplate'],
					},
				},
			},
			{
				displayName: 'Template Variables (JSON)',
				name: 'templateVariables',
				type: 'json',
				default: '["value1", "value2"]',
				required: true,
				description: 'A JSON array of variable values to populate the template placeholders',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['sendTemplate'],
					},
				},
			},
			{
				displayName: 'Media URI',
				name: 'mediaUri',
				type: 'string',
				default: '',
				description: '(Optional) URI of media to attach to the template message',
				displayOptions: {
					show: {
						resource: ['template'],
						operation: ['sendTemplate'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject;

				if (resource === 'message') {
					const to = this.getNodeParameter('to', i) as string;
					let messageObject: IDataObject = {};

					if (operation === 'sendText') {
						const textBody = this.getNodeParameter('textBody', i) as string;
						const previewUrl = this.getNodeParameter('previewUrl', i) as boolean;
						messageObject = {
							to,
							type: 'text',
							text: {
								preview_url: previewUrl,
								body: textBody,
							},
						};
					} else if (operation === 'sendImage') {
						const imageUrl = this.getNodeParameter('imageUrl', i) as string;
						messageObject = {
							to,
							type: 'image',
							image: {
								link: imageUrl,
							},
						};
					} else if (operation === 'sendAudio') {
						const audioUrl = this.getNodeParameter('audioUrl', i) as string;
						messageObject = {
							to,
							type: 'audio',
							audio: {
								link: audioUrl,
							},
						};
					} else if (operation === 'sendDocument') {
						const documentUrl = this.getNodeParameter('documentUrl', i) as string;
						const documentCaption = this.getNodeParameter('documentCaption', i) as string;
						messageObject = {
							to,
							type: 'document',
							document: {
								link: documentUrl,
								caption: documentCaption,
							},
						};
					} else if (operation === 'sendVideo') {
						const videoUrl = this.getNodeParameter('videoUrl', i) as string;
						const videoCaption = this.getNodeParameter('videoCaption', i) as string;
						messageObject = {
							to,
							type: 'video',
							video: {
								link: videoUrl,
								caption: videoCaption,
							},
						};
					} else if (operation === 'sendInteractiveList') {
						const headerText = this.getNodeParameter('listHeaderText', i) as string;
						const bodyText = this.getNodeParameter('listBodyText', i) as string;
						const footerText = this.getNodeParameter('listFooterText', i) as string;
						const buttonText = this.getNodeParameter('listButtonText', i) as string;
						const sectionsJson = this.getNodeParameter('listSections', i) as string;
						let sections: IDataObject[];
						try {
							sections = typeof sectionsJson === 'string' ? JSON.parse(sectionsJson) : sectionsJson;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Invalid JSON in Sections field', { itemIndex: i });
						}
						messageObject = {
							to,
							type: 'interactive',
							interactive: {
								type: 'list',
								header: {
									type: 'text',
									text: headerText,
								},
								body: {
									text: bodyText,
								},
								footer: {
									text: footerText,
								},
								action: {
									button: buttonText,
									sections,
								},
							},
						};
					} else if (operation === 'sendInteractiveButtons') {
						const bodyText = this.getNodeParameter('buttonBodyText', i) as string;
						const buttonsJson = this.getNodeParameter('buttons', i) as string;
						let buttons: IDataObject[];
						try {
							buttons = typeof buttonsJson === 'string' ? JSON.parse(buttonsJson) : buttonsJson;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Invalid JSON in Buttons field', { itemIndex: i });
						}
						messageObject = {
							to,
							type: 'interactive',
							interactive: {
								type: 'button',
								body: {
									text: bodyText,
								},
								action: {
									buttons,
								},
							},
						};
					}

					responseData = await wcrmApiRequest.call(this, 'POST', '/send-message', {
						messageObject,
					});
				} else if (resource === 'template') {
					const to = this.getNodeParameter('to', i) as string;
					const templateName = this.getNodeParameter('templateName', i) as string;
					const templateVariablesJson = this.getNodeParameter('templateVariables', i) as string;
					const mediaUri = this.getNodeParameter('mediaUri', i) as string;

					let exampleArr: string[];
					try {
						exampleArr = typeof templateVariablesJson === 'string'
							? JSON.parse(templateVariablesJson)
							: templateVariablesJson;
					} catch {
						throw new NodeOperationError(this.getNode(), 'Invalid JSON in Template Variables field', { itemIndex: i });
					}

					const body: IDataObject = {
						sendTo: to,
						templetName: templateName,
						exampleArr,
					};

					if (mediaUri) {
						body.mediaUri = mediaUri;
					}

					responseData = await wcrmApiRequest.call(this, 'POST', '/send_templet', body);
				} else if (resource === 'messageStore') {
					const staticData = this.getWorkflowStaticData('node');
					if (!staticData.messages) {
						staticData.messages = [];
					}
					const messages = staticData.messages as IDataObject[];

					if (operation === 'getAllMessages') {
						responseData = {
							success: true,
							count: messages.length,
							messages,
						};
					} else if (operation === 'getMessagesByPhone') {
						const filterPhone = this.getNodeParameter('filterPhone', i) as string;
						const filtered = messages.filter((msg) => {
							const payload = msg.payload as IDataObject | undefined;
							return payload && payload.from === filterPhone;
						});
						responseData = {
							success: true,
							count: filtered.length,
							phone: filterPhone,
							messages: filtered,
						};
					} else if (operation === 'saveMessage') {
						const messagePayloadJson = this.getNodeParameter('messagePayload', i) as string;
						let payload: IDataObject;
						try {
							payload = typeof messagePayloadJson === 'string'
								? JSON.parse(messagePayloadJson)
								: messagePayloadJson;
						} catch {
							throw new NodeOperationError(this.getNode(), 'Invalid JSON in Message Payload field', { itemIndex: i });
						}
						const storedMessage: IDataObject = {
							id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
							savedAt: new Date().toISOString(),
							payload,
						};
						messages.push(storedMessage);
						staticData.messages = messages;
						responseData = {
							success: true,
							message: 'Message saved successfully',
							stored: storedMessage,
						};
					} else if (operation === 'clearMessages') {
						staticData.messages = [];
						responseData = {
							success: true,
							message: 'All stored messages have been cleared',
						};
					} else {
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, { itemIndex: i });
					}
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown resource: ${resource}`, { itemIndex: i });
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);
				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
