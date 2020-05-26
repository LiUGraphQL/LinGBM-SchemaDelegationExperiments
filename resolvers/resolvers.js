import { Faculty, faculty, Lecturer, Professor } from "./faculty";
import { University, university } from "./university";
import { ResearchGroup, researchGroup } from "./researchgroup";
import { Department, department } from "./department";
import { lecturer } from "./lecturer";
import { GraduateStudent, graduatestudents } from "./graduatestudents";
import { Publication, publicationSearch } from "./publications";
import { GraduateCourse } from "./graduatecourse";
import { AggregateUgStudents } from "./aggregation";

export default (schema) => {
  return {
    Query: {
      ...faculty(schema),
      ...university(schema),
      ...researchGroup(schema),
      ...lecturer(schema),
      ...department(schema),
      ...graduatestudents(schema),
      ...publicationSearch(schema),
    },
    Faculty,
    University: University(schema),
    ResearchGroup: ResearchGroup(schema),
    Department: Department(schema),
    Lecturer: Lecturer(schema),
    Professor: Professor(schema),
    GraduateStudent: GraduateStudent(schema),
    Publication: Publication(schema),
    GraduateCourse: GraduateCourse(schema),
    AggregateUgStudents: AggregateUgStudents(schema),
    Author: {
      __resolveType: (obj, context, info) => {
        if (obj.age) return "GraduateStudent";
        if (obj.profType || obj.researchInterest) return "Professor";
        return "Lecturer";
      },
    },
  };
};
