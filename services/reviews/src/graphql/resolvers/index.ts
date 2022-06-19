import { reviews, usernames } from '../../models';
import { Resolvers, Review } from '../generated/schema-types';

const resolvers: Resolvers = {
	Review: {
		author(review: any) {
			return { __typename: 'User', id: review.authorID };
		},
		product(review: any) {
			return { __typename: 'Product', upc: review.product?.upc };
		},
	},
	User: {
		reviews(user: any) {
			return reviews.filter((review) => review.authorID === user.id);
		},
		numberOfReviews(rev: Review) {
			return reviews.filter((review) => review.authorID === rev.id)
				.length;
		},
		username(user: any) {
			// const found = usernames.find((username) => username.id === user.id);
			// return found ? found.username : null;
			return usernames[0].username;
		},
	},
	Product: {
		reviews(product) {
			return reviews.filter(
				(review) => review.product.upc === product.upc
			);
		},
	},
	Query: {
        reviews(_: any, args: any) {
            return reviews;
        }
    }
};

export default resolvers;
