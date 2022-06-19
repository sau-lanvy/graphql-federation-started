
// configure OpenTelemetry instrumentation as early as possible in your app's execution
const ApolloOpenTelemetry  = require('./graphql/open-telemetry');
new ApolloOpenTelemetry({
	type: 'router',
	name: 'router',
	exporter: {
	  type: 'console', // console, zipkin, collector, ...
	}
  }).setupInstrumentation();

const dotenv = require('dotenv');
const { ApolloServer } = require('apollo-server');
const GraphGateway = require('./graphql/graph-gateway');
const { RemoteGraphQLDataSource } = require('@apollo/gateway');

dotenv.config();

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }) {
        // pass the coinmarketcap api key from the context to underlying services
        // as a header called `x-auth-key`
        const { authKey } = context;
        if (authKey) {
            request.http.headers.set('x-auth-key', authKey);
        }
    }
}

// Set port number
const { PORT = 7071 } = process.env;
    
// Initialize an ApolloGateway instance
const gateway = new GraphGateway({
    serviceList: [],
    buildService: ({ name, url }) => new AuthenticatedDataSource({ url }),
    debug: true,
    experimental_pollInterval: 30000, // 30 sec
});

(async () => {
    const { schema, executor } = await gateway.load();
    // Pass the ApolloGateway to the ApolloServer constructor
    const server = new ApolloServer({
        schema,
        executor: executor,
        // Disable subscriptions (not currently supported with ApolloGateway)
        subscriptions: false,
        playground: true,
        introspection: true
    });

    server.listen({ port: PORT }).then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`);
    });
})();
