// Open Telemetry (optional)
import { ApolloOpenTelemetry, GraphNodeType, ExporterType } from './graphql/open-telemetry';
new ApolloOpenTelemetry({
	type: GraphNodeType.Subgraph,
	name: 'products',
	exporter: {
	  type: ExporterType.Console, // console, zipkin, collector, ...
	  host: 'localhost', // default: localhost
	  port: '9411', // default: exporter specific
	}
  }).setupInstrumentation();

import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apolloServer from './graphql';
import { logger } from './logger';
import config from './config';
import registerSchema from './graphql/register-schema';

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

// GraphQL server setup
const startApolloServer = async () => {
	await apolloServer.start();
	apolloServer.applyMiddleware({ app });

	app.listen(config.port, () => {
		logger.info(`Server listening on port: ${config.port}`);
	});

	await registerSchema();
}

startApolloServer();
