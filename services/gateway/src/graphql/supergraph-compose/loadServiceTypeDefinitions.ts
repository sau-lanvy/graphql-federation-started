import { get } from 'lodash';
const axios = require('axios').default;

import config from '../../config';
import { logger } from '../../logger';
import { ServiceTypeDefinition } from './type';

export async function loadServiceListWithTypeDefs(): Promise<ServiceTypeDefinition[]> {
	try {
		const serviceTypeDefinitions = await axios({
			baseURL: config.registryURL,
			method: 'GET',
			// Simplest approach to get last registered schema versions
			url: '/schema/latest'
		});

		return get(serviceTypeDefinitions, 'data.data', []).map((service: ServiceTypeDefinition) => {
			if (!service.url) {
				logger.warn(
					`Service url not found for type definition "${service.name}"`
				);
			} else {
				logger.info(
					`Got ${service.name} service schema with version ${service.version}`
				);
			}
			return {
				name: service.name,
				url: service.url,
				version: service.version,
				type_defs: service.type_defs,
				type_defs_original: service.type_defs_original,
			};
		});
	} catch (error) {
		const errorMessage = `Couldn't load service definitions from schema registry ${config.registryURL}`

        throw new Error(errorMessage);
	}
}