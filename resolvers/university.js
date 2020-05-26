import { delegateToSchema, WrapQuery } from "graphql-tools";
import {
  createField,
  createTWoLayeredField,
  getArguments,
  getSelections,
  universityByPk,
  WrapFields,
} from "./util";
import { storeAndRemoveAdvisor } from "./graduatestudents";

export const university = (schema) => {
  return {
    university: async (parent, args, context, info) => {
      const selectionSet = info.fieldNodes[0].selectionSet;
      const selections = selectionSet.selections.map((elem) => elem.name.value);

      //This is only to avoid asking for these fields twice
      let fields = [createField("nr")];
      if (selections.includes("doctoralDegreeObtainers")) {
        const s = getSelections(selectionSet, "doctoralDegreeObtainers");
        const a = getArguments(selectionSet, "doctoralDegreeObtainers");
        let field = createTWoLayeredField("facultiesByDoctoraldegreefrom", [
          createField("nr"),
          ...s,
        ]);
        modifyArguments(a);
        field.arguments = a;
        fields.push(field);
      }
      return await delegateToSchema({
        schema,
        operation: "query",
        fieldName: "university_by_pk",
        args: {
          nr: parseInt(args.nr),
        },
        context,
        info,
        transforms: [WrapFields("university_by_pk", fields)],
      });
    },
  };
};

const modifyArguments = (args) => {
  args.map((item) => {
    if (item.name.value === "where") {
      item.value.fields.map((item) => {
        if (item.name.value === "worksFor") {
          item.name.value = "worksfor";
          const field = item.value.fields[0];
          field.name.value = "_in";
          field.value.value = [field.value.value];
        }
      });
    }
  });
};

export const University = (schema) => {
  return {
    id: async (parent, args, context, info) => {
      return parent.nr;
    },
    doctoralDegreeObtainers: async (parent, args, context, info) => {
      if (!parent.facultiesByDoctoraldegreefrom) {
        const results = await delegateToSchema({
          schema,
          operation: "query",
          fieldName: "faculty",
          args: {
            where: {
              doctoraldegreefrom: {
                _in: [parent.nr],
              },
            },
          },
          context,
          info,
          transforms: [
            new WrapQuery(
              // path at which to apply wrapping and extracting
              ["faculty"],
              (subtree) => {
                subtree.selections = [...subtree.selections, createField("nr")];
                return subtree;
              },
              // how to process the data result at path
              (result) => {
                return result;
              }
            ),
          ],
        });
        return results;
      }
      return parent.facultiesByDoctoraldegreefrom;
    },
    undergraduateDegreeObtainedBystudent: async (
      parent,
      args,
      context,
      info
    ) => {
      if (!parent.graduatestudents) {
        const selectionSet = info.fieldNodes[0].selectionSet;
        //selectionSet.args = [];
        const store = storeAndRemoveAdvisor(selectionSet);
        let where = {};
        where.university = { nr: { _in: [parent.nr] } };

        if (args.where && args.where.advisor) {
          const adv = args.where.advisor;
          where.professor = {
            researchinterest: {
              _like: adv.researchInterest.pattern,
            },
          };
        }
        if (args.where && args.where.AND) {
          const AND = args.where.AND;
          where._and = {};
          AND.map((item) => {
            if (item.advisor) {
              where._and.professor = {
                researchinterest: {
                  _like: item.advisor.researchInterest.pattern,
                },
              };
            }
            if (item.age) {
              where._and.age = {
                _gt: item.age.pattern,
              };
            }
          });
        }
        args.where = where;
        const results = await delegateToSchema({
          schema,
          operation: "query",
          fieldName: "graduatestudent",
          args,
          context,
          info,
          transforms: [WrapFields("graduatestudent", [createField("nr")])],
        });
        if (store) selectionSet.selections.push(store);
        return results;
      }
      return parent.graduatestudents;
    },
    graduateStudentConnection: async (parent, args, context, info) => {
      const results = await universityByPk(
        parent.nr,
        [
          createTWoLayeredField("graduatestudents_aggregate", [
            createTWoLayeredField("aggregate", [
              createField("count"),
              createTWoLayeredField("avg", [createField("age")]),
              createTWoLayeredField("max", [createField("age")]),
              createTWoLayeredField("min", [createField("age")]),
            ]),
          ]),
        ],
        schema,
        parent,
        args,
        context,
        info
      );
      return results && results.graduatestudents_aggregate
        ? results.graduatestudents_aggregate
        : null;
    },
  };
};
