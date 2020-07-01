import {
  makeRemoteExecutableSchema,
  introspectSchema,
  makeExecutableSchema,
} from "graphql-tools";
import { HttpLink } from "apollo-link-http";
import { ApolloServer } from "apollo-server";
import typeDefs from "./typedefs";
import resolvers from "./resolvers/resolvers";
import fetch from "node-fetch";

// Apollo link with the uri of GraphQL API
const link = new HttpLink({
  uri: "http://127.0.0.1:8080/v1/graphql",
  fetch,
});

// create executable schemas from remote GraphQL API
const createRemoteExecutableSchema = async () => {
  try{
    const remoteSchema = await introspectSchema(link);
    return makeRemoteExecutableSchema({
      schema: remoteSchema,
      link,
    });
  } catch(err){
    console.log(err);
  }
};

const createNewSchema = async () => {
  try{
  // get remote executable schema
    const schema = await createRemoteExecutableSchema();

    // write a resolver to write custom logic
    return makeExecutableSchema({
      typeDefs: typeDefs,
      resolvers: resolvers(schema),
    });
  } catch(err){
    console.log(err);
  }
};

const runServer = async () => {
  // Get newly merged schema
  try{
    const schema = await createNewSchema();
    // start server with the new schema
    const server = new ApolloServer({
      schema,
    });
    server.listen().then(({ url }) => {
      console.log(`Running at ${url}`);
    });
  } catch(err){
    console.log(err);
  }
};

try {
  runServer();
} catch (err) {
  console.log(err);
}
