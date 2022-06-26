## QUERY SAMPLES
### REVIEW
```
query {
  reviews {
    id
    body
    author {
      username
      name
    }
    product {
      name
      inStock
    }
  }
}
```

Response data:

```
{
  "data": {
    "reviews": [
      {
        "id": "1",
        "body": "Love it!",
        "author": {
          "username": "@ada",
          "name": "Ada Lovelace"
        },
        "product": {
          "name": "Table",
          "inStock": true
        }
      },
      {
        "id": "2",
        "body": "Too expensive.",
        "author": {
          "username": "@ada",
          "name": "Ada Lovelace"
        },
        "product": {
          "name": "Couch",
          "inStock": false
        }
      },
      {
        "id": "3",
        "body": "Could be better.",
        "author": {
          "username": "@ada",
          "name": "Alan Turing"
        },
        "product": {
          "name": "Chair",
          "inStock": true
        }
      },
      {
        "id": "4",
        "body": "Prefer something else.",
        "author": {
          "username": "@ada",
          "name": "Alan Turing"
        },
        "product": {
          "name": "Table",
          "inStock": true
        }
      }
    ]
  }
}
```