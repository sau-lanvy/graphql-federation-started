import './open-telemetry';
import express from 'express';
import axios from 'axios';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apolloServer from './graphql';
import typeDefs from './graphql/schema';
import { logger } from './logger';
import config from './config';

const app = express();
app.use(helmet());

if (config.NODE_ENV === 'production') {
	app.use(
		rateLimit({
			windowMs: 15 * 60 * 1000, // 15 minutes
			max: 100, // limit each IP to 100 requests per windowMs
		})
	);
}

app.get(`/health`, async (req, res) => {
	return res.status(200).send('ok');
});

// register the service schema with the registry service
async function registerSchema(): Promise<void> {
	try {
		logger.info('Registering schema', typeDefs.toString());

		await axios({
			timeout: 5000,
			method: 'POST',
			url: `/schema/push`,
			baseURL: config.registryURL,
			data: {
				name: config.serviceName, // service name
				version: config.serviceVersion, //service version, like docker container hash. Use 'latest' for dev env
				type_defs: typeDefs.toString(),
				url: config.serviceURL, // service URL
			},
		});
		logger.info('Schema registered successfully!');
	} catch (err) {
		logger.error(`Schema registration failed: ${err}`);
	}
}

// GraphQL server setup
async function startApolloServer() {
	await apolloServer.start();
	apolloServer.applyMiddleware({ app, path: '/graphql' });

	app.listen(config.port, () => {
		logger.info(`Server listening on port: ${config.port}`);
	});

	await registerSchema();
}

startApolloServer();
