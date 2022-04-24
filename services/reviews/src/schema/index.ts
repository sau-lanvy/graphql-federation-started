import { gql } from "apollo-server";

export default gql`
    type Review @key(fields: "id") {
        id: ID!
        body: String
        author: User @provides(fields: "username")
        product: Product
    }
    extend type User @key(fields: "id") {
        id: ID! @external
        username: String @external
        reviews: [Review]
    }
    extend type Product @key(fields: "upc") {
        upc: String! @external
        reviews: [Review]
    }
`;
