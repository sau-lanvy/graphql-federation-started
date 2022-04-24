import { gql } from 'apollo-server';
export default gql`
  type Query {
    topProducts(first: Int = 5): [Product]
  }
  
  type Product @key(fields: "upc") {
    upc: String!
    name: String
    price: Int
    weight: Int
  }
`