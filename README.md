# Architectures
## Microservice Architecture

```mermaid
  graph TD
      ingress--> gateway
      gateway--> products & inventory & accounts & reviews
      products--> P[product database]
      inventory--> I[inventory database]
      accounts--> A[accounts database]
      reviews--> R[review database]
  
```

## Graph Federation Architecture
![Graph Federation Architecture](./docs/f_architecture..png)
