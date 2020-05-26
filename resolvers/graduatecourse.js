export const GraduateCourse = (schema) => {
  return {
    id: async (parent, args, context, info) => {
      return parent.nr;
    },
  };
};
