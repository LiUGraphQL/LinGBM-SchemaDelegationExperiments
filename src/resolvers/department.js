import { delegateToSchema, WrapQuery } from "graphql-tools";
import {
  createField,
  createTWoLayeredField,
  getSelections,
  WrapFields,
} from "./util";

export const department = (schema) => {
  return {
    department: async (parent, args, context, info) => {
      let fields = [createField("nr")];
      return await delegateToSchema({
        schema,
        operation: "query",
        fieldName: "department_by_pk",
        args: {
          nr: parseInt(args.nr),
        },
        context,
        info,
        transforms: [WrapFields("department_by_pk", fields)],
      });
    },
  };
};

export const Department = (schema) => {
  return {
    id: async (parent, args, context, info) => {
      return parent.nr;
    },
    head: async (parent, args, context, info) => {
      const results = await delegateToSchema({
        schema,
        operation: "query",
        fieldName: "professor",
        args: {
          where: { headof: { _in: [parseInt(parent.nr)] } },
        },
        context,
        info,
        transforms: [WrapFields("professor", [createField("nr")])],
      });
      return results && results[0] ? results[0] : null;
    },
    subOrganizationOf: async (parent, args, context, info) => {
      if (!parent.subOrganizationOf) {
        const org = await delegateToSchema({
          schema,
          operation: "query",
          fieldName: "department_by_pk",
          args: {
            nr: parseInt(parent.nr),
          },
          context,
          info,
          transforms: [
            new WrapQuery(
              // path at which to apply wrapping and extracting
              ['department_by_pk'],
              (subtree) => {
                if (!subtree)
                  return {
                    kind: "SelectionSet",
                    selections: [
                      createTWoLayeredField("university", [createField("nr")]),
                    ],
                  };
                subtree.selections = [
                  ...subtree.selections,
                  createTWoLayeredField("university", [createField("nr")]),
                ];
                return subtree;
              },
              // how to process the data result at path
              (result) => {
                return result && result.university;
              }
            ),
          ],
        });
        return org;
      }
      return parent.subOrganizationOf;
    },
    faculties: async (parent, args, context, info) => {
      if (!parent.faculties) {
        const faculty = await delegateToSchema({
          schema,
          operation: "query",
          fieldName: "department_by_pk",
          args: {
            nr: parseInt(parent.nr),
          },
          context,
          info,
          transforms: [
            new WrapQuery(
                ['department_by_pk'],
                (subtree) => {
                  if (!subtree)
                    return {
                      kind: "SelectionSet",
                      selections: [
                        createTWoLayeredField("faculties", [createField("nr")]),
                      ],
                    };
                  subtree.selections = [
                    ...subtree.selections,
                    createTWoLayeredField("faculties", [createField("nr")]),
                  ];
                  return subtree;
                },
                (result) => {
                  return result && result.faculties;
                }
            ),
          ],
        });
        return faculty;
      }
      return parent.faculties;
    },
  };
};
