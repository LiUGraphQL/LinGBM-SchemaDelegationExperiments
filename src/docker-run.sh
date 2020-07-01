#! /bin/bash
docker run -d --name hasura_engine -p 8080:8080 \
  -e HASURA_GRAPHQL_DATABASE_URL=postgres://USERNAME:PASSWORD@host.docker.internal:5432/linbenchmark \
  -e HASURA_GRAPHQL_ENABLE_CONSOLE=true \
  hasura/graphql-engine:v1.2.1