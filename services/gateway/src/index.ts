// Open Telemetry (optional)
import { ApolloOpenTelemetry, GraphNodeType, ExporterType } from './graphql/open-telemetry';
new ApolloOpenTelemetry({
    type: GraphNodeType.Router,
    name: 'router',
    exporter: {
      type: ExporterType.Console, // console, zipkin, collector, ...
      host: 'localhost', // default: localhost
      port: '9411', // default: exporter specific
    }
  }).setupInstrumentation();

import express from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { json } from 'body-parser';
import apolloServer from './graphql';
import { logger } from './logger';
import config from './config';

const app = express();
const router = express.Router();

// Not loading due to Content Security Policy Directive on CDN requests
// refer to https://github.com/graphql/graphql-playground/issues/1283
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

app.use(router);
router.use(json());

router.get('/graphql', (req, res) => {
	res.sendFile(path.join(__dirname + '/playground.html'));
});

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

	app.listen(config.gatewayPort, () => {
		logger.info(`Server listening on port: ${config.gatewayPort}`);
	});
}

startApolloServer();