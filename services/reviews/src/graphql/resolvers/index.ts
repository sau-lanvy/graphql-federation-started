import { reviews, usernames } from '../../models';
import { Resolvers, Review } from '../generated/schema-types';

const resolvers: Resolvers = {
	Review: {
		author(review: any) {
			return { __typename: 'User', id: review.authorID };
		},
		product(review: any) {
			return { __typename: 'Product', upc: review.upc };
		},
	},
	User: {
		reviews(user) {
			return reviews.filter((review) => review.authorID === user.id);
		},
		numberOfReviews(user: Review) {
			return reviews.filter((review) => review.authorID === user.id)
				.length;
		},
		username(user) {
			const found = usernames.find((username) => username.id === user.id);
			return found ? found.username : null;
		},
	},
	Product: {
		reviews(product) {
			return reviews.filter(
				(review) => review.product.upc === product.upc
			);
		},
	},
};

export default resolvers;
