export const AggregateUgStudents = (schema) => {
  return {
    age: async (parent, args, context, info) => {
      return {
        avg: parent.avg.age,
        min: parent.min.age,
        max: parent.max.age,
      };
    },
  };
};
