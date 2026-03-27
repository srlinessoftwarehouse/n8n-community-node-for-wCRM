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
	const options: IHttpRequestOptions = {
		method,
		url: `https://crm.srlines.net/api/v1${endpoint}`,
		body,
		json: true,
		headers: {
			'Content-Type': 'application/json',
		},
	};

	return this.helpers.httpRequestWithAuthentication.call(this, 'wcrmApi', options) as Promise<IDataObject>;
}
