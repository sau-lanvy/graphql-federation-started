export default {
  port: process.env.PORT || '6101',
  NODE_ENV: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'reviews',
  registryURL: process.env.REGISTRY_URL || 'http://localhost:6001',
  serviceURL: process.env.SERVICE_URL || 'http://localhost:6101/graphql',
  serviceVersion: process.env.SERVICE_VERSION || 'v4.4',
};
