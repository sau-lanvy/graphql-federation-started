export default {
  gatewayPort: process.env.GATEWAY_PORT || '6109',
  NODE_ENV: process.env.NODE_ENV || 'development',
  gatewayServiceName: process.env.GATEWAY_SERVICE_NAME || 'graphql-gateway',
  registryURL: process.env.REGISTRY_URL || 'http://localhost:6001',
};
