
> Detail steps how to set up infrastructure and run the services will be documented at https://hahoangv.gitbook.io/graphql-federation-started/

# Architectures
## Microservice Architecture

```mermaid
  graph TD
      gateway--> products & inventory & accounts & reviews
      products--> P[products database]
      inventory--> I[inventory database]
      accounts--> A[accounts database]
      reviews--> R[reviews database]
  
```

## Graph Federation Architecture
![Graph Federation Architecture](./docs/f_architecture..png)
