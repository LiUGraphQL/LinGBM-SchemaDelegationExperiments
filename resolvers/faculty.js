import { delegateToSchema, WrapQuery } from "graphql-tools";
import {
  createField,
  createTWoLayeredField,
  WrapFields,
  facultyByPk,
  ExtractField,
} from "./util";

export const faculty = (schema) => {
  return {
    faculty: async (parent, args, context, info) => {
      const selections = info.fieldNodes[0].selectionSet.selections.map(
        (elem) => elem.name.value
      );
      let fields = [createField("nr")];
      //This is only to avoid asking for these fields twice
      if (selections.includes("emailAddress")) {
        fields.push(createField("emailaddress"));
      }
      if (selections.includes("doctoralDegreeFrom")) {
        fields.push(
          createTWoLayeredField("universityByDoctoraldegreefrom", [
            createField("nr"),
          ])
        );
      }
      return await delegateToSchema({
        schema,
        operation: "query",
        fieldName: "faculty_by_pk",
        args: {
          nr: parseInt(args.nr),
        },
        context,
        info,
        transforms: [
          new WrapQuery(
            // path at which to apply wrapping and extracting
            ["faculty_by_pk"],
            (subtree) => {
              if (!subtree)
                return {
                  kind: "SelectionSet",
                  selections: [...fields],
                };
              subtree.selections = [...subtree.selections, ...fields];
              return subtree;
            },
            // how to process the data result at path
            (result) => {
              result.emailAddress = result.emailaddress;
              return result;
            }
          ),
        ],
      });
    },
  };
};

export const Faculty = {
  id: async (parent, args, context, info) => {
    return parent.nr;
  },
  __resolveType: (obj, context, info) => {
    if (obj.profType || obj.researchInterest) return "Professor";
    return "Lecturer";
  },
};

const shared = (schema) => {
  return {
    id: async (parent, args, context, info) => {
      return parent.nr;
    },
    doctoralDegreeFrom: async (parent, args, context, info) => {
      if (!parent.universityByDoctoraldegreefrom) {
        const results = await facultyByPk(
          parent.nr,
          [
            createTWoLayeredField("universityByDoctoraldegreefrom", [
              createField("nr"),
            ]),
          ],
          schema,
          parent,
          args,
          context,
          info
        );
        if (!results || !results.universityByDoctoraldegreefrom) return null;
        return results.universityByDoctoraldegreefrom;
      }
      return parent.universityByDoctoraldegreefrom;
    },
    emailAddress: async (parent, args, context, info) => {
      if (!parent.emailAddress) {
        return await delegateToSchema({
          schema,
          operation: "query",
          fieldName: "faculty_by_pk",
          args: {
            nr: parseInt(parent.nr),
          },
          context,
          info,
          transforms: [ExtractField("faculty_by_pk", "emailaddress")],
        });
      }
      return parent.emailAddress;
    },
    worksFor: async (parent, args, context, info) => {
      if (!parent.department) {
        const results = await facultyByPk(
          parent.nr,
          [createTWoLayeredField("department", [createField("nr")])],
          schema,
          parent,
          args,
          context,
          info
        );
        return results ? results.department : null;
      }
    },
    publications: async (parent, args, context, info) => {
      if (!parent.publications) {
        if (args.order) {
          const { field, direction } = args.order;
          args.order_by = [];
          args.order_by.push({});
          args.order_by[0][field] = direction == "ASC" ? "asc" : "desc";
        }
        args.where = { mainauthor: { _in: [parent.nr] } };
        return await delegateToSchema({
          schema,
          operation: "query",
          fieldName: "publication",
          args,
          context,
          info,
          transforms: [WrapFields("publication", [createField("nr")])],
        });
      }
      return parent.publications;
    },
  };
};

export const Lecturer = (schema) => {
  return {
    ...shared(schema),
  };
};

export const Professor = (schema) => {
  return {
    ...shared(schema),
  };
};
