import { ApolloServer } from 'apollo-server-express';
import { buildSubgraphSchema } from '@apollo/subgraph';
import depthLimit from 'graphql-depth-limit';

import resolvers from './resolvers';
import typeDefs from './schema'; 

// Initialize an Apollo Server instance
// Define the schema and resolvers for the federated service
const apolloServer = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  validationRules: [depthLimit(7)],
});

export default apolloServer;