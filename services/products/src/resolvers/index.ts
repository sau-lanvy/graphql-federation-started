import { products } from '../models';
import { Resolvers, Product } from '../generated/schema-types';

const resolvers: Resolvers = {
    Product: {
        __resolveReference(object: Product): Product {
            return products.find(product => product.upc === object.upc) as Product;
        }
    },
    Query: {
        topProducts(_, args): Product[] {
            return products.slice(0, args.first);
        }
    }
};

export default resolvers;