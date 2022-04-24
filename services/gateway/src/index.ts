// configure OpenTelemetry instrumentation as early as possible in your app's execution
import './open-telemetry';

import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';
dotenv.config();

// Set port number
const { PORT = 7071 } = process.env;

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
    willSendRequest({ request, context }: any) {
        // pass the coinmarketcap api key from the context to underlying services
        // as a header called `x-auth-key`
        const { authKey } = context;
        if (authKey) {
            request.http.headers.set('x-auth-key', authKey);
        }
    }
}
    
// Initialize an ApolloGateway instance and pass it an array of
// your implementing service names and URLs
const gateway = new ApolloGateway({
    buildService({ name, url }) {
        return new AuthenticatedDataSource({ url });
    },
    serviceList: [
        { name: 'accounts-service', url: 'http://accounts-service:7072/' },
        { name: 'products-service', url: 'http://products-service:7073/' },
        { name: 'inventory-service', url: 'http://inventory-service:7074/' },
        { name: 'reviews-service', url: 'http://reviews-service:7075/' },
    ],
    // Experimental: Enabling this enables the query plan view in Playground.
    __exposeQueryPlanExperimental: false,
});

(async () => {
    const { schema, executor } = await gateway.load();
    // Pass the ApolloGateway to the ApolloServer constructor
    const server = new ApolloServer({
        schema,
        executor: executor as any,
        context: async ({ req }) => {
            const authKey = 'encrypted-secret-key-to-decrypt';
            // Add auth key to context
            return {
                authKey,
            };
        },
        // Disable subscriptions (not currently supported with ApolloGateway)
        subscriptions: false,
        playground: true,
        // Apollo Graph Manager (previously known as Apollo Engine)
        // When enabled and an `ENGINE_API_KEY` is set in the environment,
        // provides metrics, schema management and trace reporting.
        engine: false,
    });

    server.listen({ port: PORT }).then(({ url }) => {
        console.log(`🚀 Server ready at ${url}`);
    });
})();