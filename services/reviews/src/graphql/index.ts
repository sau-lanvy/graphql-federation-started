import { ApolloServer } from 'apollo-server-express';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { GraphQLError } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import queryComplexity, {
  simpleEstimator,
} from 'graphql-query-complexity';

import resolvers from './resolvers';
import typeDefs from './schema'; 

const queryComplexityRule = queryComplexity({
    maximumComplexity: 1000,
    variables: {},
    createError: (max: number, actual: number) => new GraphQLError(`Query is too complex: ${actual}. Maximum allowed complexity: ${max}`),
    estimators: [
      simpleEstimator({
        defaultComplexity: 1
      }),
    ],
  });


// Initialize an Apollo Server instance
// Define the schema and resolvers for the federated service
const apolloServer = new ApolloServer({
  schema: buildSubgraphSchema([{ typeDefs, resolvers }]),
  validationRules: [depthLimit(7), queryComplexityRule]
});

export default apolloServer;