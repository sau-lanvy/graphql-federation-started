import { ApolloServer } from 'apollo-server-express';
import { ApolloGateway, RemoteGraphQLDataSource } from '@apollo/gateway';

import depthLimit from 'graphql-depth-limit';
import { SupergraphCompose } from './supergraph-compose'

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

// Initialize an ApolloGateway instance
const gateway = new ApolloGateway({
  supergraphSdl: async({update, healthCheck}) => {
    return await new SupergraphCompose(
      {
        pollIntervalInMs: 30000, 
        shouldUsePubSub: false
      }).initialize(update);
  },
  buildService: ({ name, url }) => new AuthenticatedDataSource({ url }),
  debug: true,
});

// Initialize an Apollo Server instance
const apolloServer = new ApolloServer({
  gateway,
  validationRules: [depthLimit(7)],
  introspection: true,
  cache: "bounded",
  csrfPrevention: true,
  debug: true
});

export default apolloServer;