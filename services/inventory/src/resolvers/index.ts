import { Resolvers, Product } from '../generated/schema-types';
import {  inventory } from '../models';

const resolvers: Resolvers = {
    Product: {
        __resolveReference(object: Product) {
          return {
            ...object,
            ...inventory.find(product => product.upc === object.upc)
          };
        },
        shippingEstimate(object: Product) {
          // free for expensive items
          if (object.price && object.price > 1000) return 0;
          // estimate is based on weight
          if (object.weight) return object.weight * 0.5;

          return 0;
        }
      }
};

export default resolvers;