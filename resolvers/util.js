import { delegateToSchema, WrapQuery } from "graphql-tools";

export const createField = (name) => {
  return {
    kind: "Field",
    name: {
      kind: "Name",
      value: name,
    },
    arguments: [],
    directives: [],
  };
};

export const createTWoLayeredField = (name, fields) => {
  const field = createField(name);
  field.selectionSet = {
    kind: "SelectionSet",
    selections: fields,
  };
  return field;
};

export const WrapFields = (path, fields) => {
  return new WrapQuery(
    // path at which to apply wrapping and extracting
    [path],
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
      return result;
    }
  );
};

export const ExtractField = (path, field) => {
  return new WrapQuery(
    // path at which to apply wrapping and extracting
    [path],
    (subtree) => {
      if (!subtree)
        return {
          kind: "SelectionSet",
          selections: [createField(field)],
        };
      subtree.selections = [...subtree.selections, createField(field)];
      return subtree;
    },
    // how to process the data result at path
    (result) => {
      return result[field];
    }
  );
};

export const universityByPk = async (
  pk,
  fields,
  schema,
  parent,
  args,
  context,
  info
) => {
  return await delegateToSchema({
    schema,
    operation: "query",
    fieldName: "university_by_pk",
    args: {
      nr: pk,
    },
    context,
    info,
    transforms: [
      WrapFields("university_by_pk", [createField("nr"), ...fields]),
    ],
  });
};

export const facultyByPk = async (
  pk,
  fields,
  schema,
  parent,
  args,
  context,
  info
) => {
  return await delegateToSchema({
    schema,
    operation: "query",
    fieldName: "faculty_by_pk",
    args: {
      nr: pk,
    },
    context,
    info,
    transforms: [WrapFields("faculty_by_pk", [createField("nr"), ...fields])],
  });
};

export const graduateStudentByPk = async (
  pk,
  fields,
  schema,
  parent,
  context,
  info
) => {
  return await delegateToSchema({
    schema,
    operation: "query",
    fieldName: "graduatestudent_by_pk",
    args: {
      nr: pk,
    },
    context,
    info,

    transforms: [
      WrapFields("graduatestudent_by_pk", [createField("nr"), ...fields]),
    ],
  });
};

export const getSelections = (selectionSet, name) => {
  let s = [];
  selectionSet.selections.map((elem) => {
    if (elem.name.value === name) s = elem.selectionSet.selections;
  });
  return s;
};

export const getArguments = (selectionSet, name) => {
  let a = [];
  selectionSet.selections.map((elem) => {
    if (elem.name.value === name) a = elem.arguments;
  });
  return a;
};
