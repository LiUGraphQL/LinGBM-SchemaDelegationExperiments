import { delegateToSchema } from "graphql-tools";
import { createField, WrapFields } from "./util";

export const lecturer = (schema) => {
  return {
    lecturer: async (parent, args, context, info) => {
      const results = await delegateToSchema({
        schema,
        operation: "query",
        fieldName: "lecturer_by_pk",
        args: {
          nr: parseInt(args.nr),
        },
        context,
        info,
        transforms: [
          {
            transformResult: (result) => {
              return result;
            },
          },
          WrapFields("lecturer_by_pk", [createField("nr")]),
        ],
      });
      return results;
    },
  };
};
