export const AggregateUgStudents = (schema) => {
  return {
    age: async (parent, args, context, info) => {
      console.log(parent);
      return {
        avg: parent.avg.age,
        min: parent.min.age,
        max: parent.max.age,
      };
    },
  };
};
