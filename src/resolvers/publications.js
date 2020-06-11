import { delegateToSchema } from "graphql-tools";
import { createField, WrapFields } from "./util";

export const publicationSearch = (schema) => {
  return {
    publicationSearch: async (parent, args, context, info) => {
      args.where = {};
      args.where[args.field] = {
        _like: args.pattern,
      };
      return await delegateToSchema({
        schema,
        operation: "query",
        fieldName: "publication",
        args,
        context,
        info,
        transforms: [WrapFields("publication", [createField("nr")])],
      });
    },
  };
};

export const Publication = (schema) => {
  return {
    id: async (parent, args, context, info) => {
      return parent.nr;
    },
  };
};
