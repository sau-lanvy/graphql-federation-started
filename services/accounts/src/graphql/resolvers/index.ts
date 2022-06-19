//import users data
import { users } from '../../models';
import { Resolvers, User } from '../generated/schema-types';

const resolvers: Resolvers = {
  Query: {
    me() {
      return users[0];
    }
  },
  User: {
    __resolveReference(user: User) {
      return users.find(u => u.id === user.id);
    }
  }
};

export default resolvers;