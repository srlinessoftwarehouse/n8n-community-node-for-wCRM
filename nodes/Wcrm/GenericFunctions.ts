import {
	IExecuteFunctions,
	IHttpRequestMethods,
	IHttpRequestOptions,
	IDataObject,
} from 'n8n-workflow';

export async function wcrmApiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('wcrmApi');
	const apiKey = credentials.apiKey as string;

	const options: IHttpRequestOptions = {
		method,
		url: `https://crm.srlines.net/api/v1${endpoint}`,
		body,
		json: true,
	};

	if (endpoint === '/send_templet') {
		options.headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		};
	} else {
		options.url += `${options.url!.includes('?') ? '&' : '?'}token=${apiKey}`;
	}

	return this.helpers.httpRequest(options) as Promise<IDataObject>;
}
