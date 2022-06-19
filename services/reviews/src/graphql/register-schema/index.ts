import axios from 'axios';
import { logger } from '../../logger';
import config from '../../config';
import typeDefs from '../schema';

const wait = (ms:number) => new Promise(r => setTimeout(r, ms));

const retryOperation = (operation: any, delay: number, retries: number) => new Promise((resolve, reject) => {
  return operation()
    .then(resolve)
    .catch((reason: any) => {
      if (retries > 0) {
        return wait(delay)
          .then(retryOperation.bind(null, operation, delay, retries - 1))
          .then(resolve)
          .catch(reject);
      }
      return reject(reason);
    });
});

// register the service schema with the registry service
const register = async (): Promise<void> => {
	try {
		// Construct a schema, using GraphQL schema language
        const schema = typeDefs.loc?.source.body;

		await axios({
			timeout: 50000,
			method: 'POST',
			url: `/schema/push`,
			baseURL: config.registryURL,
			data: {
				name: config.serviceName, // service name
				version: config.serviceVersion, //service version, like docker container hash. Use 'latest' for dev env
				type_defs: schema, // schema
				url: config.serviceURL, // service URL
			},
		});
		logger.info('Schema registered successfully!');
	} catch (err) {
		logger.error(`Schema registration failed: ${err} ${config.registryURL}`);
		throw err;
	}
}

const registerSchema = async (): Promise<void> => {
    await retryOperation(register, 10000, 5);
}

export default registerSchema;

