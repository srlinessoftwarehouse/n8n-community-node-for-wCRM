import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WcrmApi implements ICredentialType {
	name = 'wcrmApi';
	displayName = 'wCRM API';
	documentationUrl = 'https://crm.srlines.net';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'The API Key for authenticating with the wCRM WhatsApp Cloud API. This single key is used for all API requests.',
		},
		{
			displayName:
				'Incoming Messages (Webhook) Setup:\n\n' +
				'If you are using the SRLINES n8n instance, your callback URI is already configured — no action needed.\n\n' +
				'If you are self-hosting n8n, copy your wCRM Trigger webhook URL from the workflow and provide it to SRLINES support so they can configure it in your wCRM account. ' +
				'This allows incoming WhatsApp messages to be forwarded to your n8n instance.',
			name: 'webhookNotice',
			type: 'notice',
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				token: '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://crm.srlines.net/api/v1',
			url: '/send-message',
			method: 'GET',
		},
	};
}
