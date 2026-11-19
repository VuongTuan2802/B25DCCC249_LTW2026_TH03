import { GRADES, RANKS } from './data';

export const getGrade = (score) => {
  return GRADES.find((item) => score >= item.min) || GRADES[GRADES.length - 1];
};

export const getRank = (gpa) => {
  const found = RANKS.find((item) => gpa >= item.min);
  return found ? found.title : 'Yếu';
};

export const calcStats = (courses) => {
  const count = courses.length;

  if (count === 0) {
    return {
      count: 0,
      credits: 0,
      points: 0,
      gpa: 0,
      rank: 'Chưa xếp loại',
    };
  }

  const credits = courses.reduce((sum, course) => sum + Number(course.credits), 0);
  const points = courses.reduce((sum, course) => {
    const grade = getGrade(course.score);
    return sum + Number(course.credits) * grade.point;
  }, 0);

  const rawGpa = credits > 0 ? points / credits : 0;
  const gpa = Math.round(rawGpa * 100) / 100;
  const rank = getRank(gpa);

  return {
    count,
    credits,
    points,
    gpa,
    rank,
  };
};