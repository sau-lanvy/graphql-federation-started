import { gql } from 'apollo-server-express';

export default gql`
  # User type definition as an Entity to be shared with multiple services
  # The @key directive defines the entity's primary key
  # This primary key will be used as a unique referene for all implementing services
  
  extend type Query {
    me: User!
  }

  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
  }
`;