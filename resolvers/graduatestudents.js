import { delegateToSchema } from "graphql-tools";
import {
  createField,
  createTWoLayeredField,
  graduateStudentByPk,
  WrapFields,
} from "./util";

const modifyWhereClause = (where) => {
  if (where.university) {
    if (where.university.nr) {
      where.university.nr = { _in: [parseInt(where.university.nr)] };
    }
  }
};

const modifyOrderClause = (args) => {
  const clauses = args.order;
  args.order_by = {};
  clauses.map((item) => {
    if (item === "id") args.order_by.nr = "asc";
    else args.order_by[item.toLowerCase()] = "asc";
  });
};

export const storeAndRemoveAdvisor = (selectionSet) => {
  let store = null;
  selectionSet.selections.map((item, i) => {
    if (item.name.value === "advisor") {
      store = selectionSet.selections[i];
      delete selectionSet.selections[i];
      selectionSet.selections = selectionSet.selections.filter((item) => {
        return item != null;
      });
    }
  });
  return store;
};

export const graduatestudents = (schema) => {
  return {
    graduateStudents: async (parent, args, context, info) => {
      const selectionSet = info.fieldNodes[0].selectionSet;
      const store = storeAndRemoveAdvisor(selectionSet);
      if (args.where) modifyWhereClause(args.where);
      if (args.order) modifyOrderClause(args);

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
    },
  };
};

export const GraduateStudent = (schema) => {
  return {
    id: async (parent, args, context, info) => {
      return parent.nr;
    },
    emailAddress: async (parent, args, context, info) => {
      if (!parent.emailaddress) {
        const student = await graduateStudentByPk(
          parent.nr,
          [createField("emailaddress")],
          schema,
          parent,
          context,
          info
        );
        if (!student || !student.emailaddress) return null;
        return student.emailaddress;
      }
      return parent.emailaddress;
    },
    advisor: async (parent, args, context, info) => {
      if (!parent.professor) {
        const student = await graduateStudentByPk(
          parent.nr,
          [createTWoLayeredField("professor", [createField("nr")])],
          schema,
          parent,
          context,
          info
        );
        if (!student || !student.professor) return null;
        return student.professor;
      }
      return parent.professor;
    },
    memberOf: async (parent, args, context, info) => {
      if (!parent.department) {
        const student = await graduateStudentByPk(
          parent.nr,
          [createTWoLayeredField("department", [createField("nr")])],
          schema,
          parent,
          context,
          info
        );
        if (!student || !student.department) return null;
        return student.department;
      }
      return parent.department;
    },
    takeGraduateCourses: async (parent, args, context, info) => {
      const field = createTWoLayeredField("graduatestudenttakecourses", [
        createTWoLayeredField("graduatecourse", [createField("nr")]),
      ]);
      const results = await graduateStudentByPk(
        parent.nr,
        [field],
        schema,
        parent,
        context,
        info
      );
      return results && results.graduatestudenttakecourses
        ? results.graduatestudenttakecourses.map((item) => item.graduatecourse)
        : null;
    },
  };
};
