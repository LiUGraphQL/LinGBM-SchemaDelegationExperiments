import { delegateToSchema } from "graphql-tools";
import {
  createField,
  createTWoLayeredField,
  getSelections,
  WrapFields,
} from "./util";

export const researchGroup = (schema) => {
  return {
    researchGroup: async (parent, args, context, info) => {
      const selectionSet = info.fieldNodes[0].selectionSet;
      const selections = selectionSet.selections.map((elem) => elem.name.value);
      //This is only to avoid asking for these fields twice
      let fields = [createField("nr")];
      if (selections.includes("subOrgnizationOf")) {
        let s = getSelections(selectionSet, "subOrgnizationOf");
        fields.push(
          createTWoLayeredField("department", [createField("nr"), ...s])
        );
      }
      return await delegateToSchema({
        schema,
        operation: "query",
        fieldName: "researchgroup_by_pk",
        args: {
          nr: parseInt(args.nr),
        },
        context,
        info,
        transforms: [WrapFields("researchgroup_by_pk", fields)],
      });
    },
  };
};

export const ResearchGroup = (schema) => {
  return {
    id: async (parent, args, context, info) => {
      return parent.nr;
    },
    subOrgnizationOf: async (parent, args, context, info) => {
      if (!parent.department) {
        const results = await delegateToSchema({
          schema,
          operation: "query",
          fieldName: "researchgroup_by_pk",
          args: {
            nr: parent.nr,
          },
          context,
          info,
          transforms: [
            WrapFields("researchgroup_by_pk", [
              createTWoLayeredField("department", [createField("nr")]),
            ]),
          ],
        });
        return results && results.department ? results.department : null;
      }
      return parent.department;
    },
  };
};
