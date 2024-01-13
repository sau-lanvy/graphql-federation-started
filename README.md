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
