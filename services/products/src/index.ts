import { ApolloServer } from 'apollo-server';
import { buildSubgraphSchema } from '@apollo/subgraph';

import resolvers from './resolvers';
import typeDefs from './schema'; 

// Set port number
const { PORT = 7073 } = process.env;

// Initialize an Apollo Server instance
// Define the schema and resolvers for the federated service
const server = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
});

//Start server
server.listen({port: PORT}).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});