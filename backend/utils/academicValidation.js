export const calculateWeightedAverage = (grades, courses) => {
  if (!grades.length || !courses.length) return 0;
  const coeffMap = new Map();
  for (const c of courses) {
    const id = typeof c._id === 'object' ? c._id.toString() : String(c._id);
    coeffMap.set(id, c.coefficient ?? 1);
  }

  let totalWeighted = 0;
  let totalCoeff = 0;

  for (const g of grades) {
    const courseId =
      typeof g.course === 'object' && g.course._id
        ? g.course._id.toString()
        : String(g.course);
    const coeff = coeffMap.get(courseId) ?? 1;

    totalWeighted += g.value * coeff;
    totalCoeff += coeff;
  }

  if (totalCoeff === 0) return 0;
  return Math.round((totalWeighted / totalCoeff) * 100) / 100;
};

export const validateUE = (grades, ue) => {
  const threshold = ue.eliminatoryThreshold ?? 6;
  const courses = ue.courses || [];

  const details = courses.map((course) => {
    const courseId =
      typeof course._id === 'object' ? course._id.toString() : String(course._id || course);
    const grade = grades.find((g) => {
      const gCourseId =
        typeof g.course === 'object' && g.course._id
          ? g.course._id.toString()
          : String(g.course);
      return gCourseId === courseId;
    });

    return {
      course: course.name || courseId,
      courseId,
      coefficient: course.coefficient ?? 1,
      grade: grade ? grade.value : null,
      isEliminatory: grade ? grade.value < threshold : false,
      hasGrade: !!grade,
    };
  });

  const gradedDetails = details.filter((d) => d.hasGrade);
  const average = calculateWeightedAverage(
    gradedDetails.map((d) => ({ value: d.grade, course: d.courseId })),
    courses
  );

  const hasEliminatory = details.some((d) => d.isEliminatory);
  const allGraded = details.every((d) => d.hasGrade);
  const validated = allGraded && !hasEliminatory && average >= 10;

  return { validated, average, hasEliminatory, allGraded, details };
};

export const validateDiploma = (ueResults) => {
  const validated = ueResults.length > 0 && ueResults.every((r) => r.validated);
  return { validated, ues: ueResults };
};
