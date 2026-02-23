import {
	IAuthenticateGeneric,
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
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {
				token: '={{$credentials.apiKey}}',
			},
		},
	};
}
