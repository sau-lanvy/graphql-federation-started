const { get } = require('lodash');
const axios = require('axios').default;

exports.getServiceListWithTypeDefs = async () => {
	try {
		const serviceTypeDefinitions = await axios({
			baseURL: 'http://localhost:6001',
			method: 'GET',
			// Simplest approach to get last registered schema versions
			url: '/schema/latest'
		});

		return get(serviceTypeDefinitions, 'data.data', []).map((schema) => {
			if (!schema.url) {
				console.warn(
					`Service url not found for type definition "${schema.name}"`
				);
			} else {
				console.log(
					`Got ${schema.name} service schema with version ${schema.version}`
				);
			}
			return {
				name: schema.name,
				url: schema.url,
				version: schema.version,
				typeDefs: schema.type_defs,
				typeDefsOriginal: schema.type_defs_original,
			};
		});
	} catch (error) {
		console.warn(
			`Cannot get schemas from Schema registry`
		);
	}
};