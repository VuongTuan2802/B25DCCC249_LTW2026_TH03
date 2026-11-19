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

export const calcRequired = (courses, target, remaining) => {
  const targetNum = Number(target);
  const remainingStr = String(remaining ?? '').trim();
  const isPositiveInt = /^[1-9]\d*$/.test(remainingStr);
  const remainingNum = Number(remainingStr);

  if (
    remainingStr === '' ||
    !isPositiveInt ||
    Number.isNaN(targetNum) ||
    targetNum < 0 ||
    targetNum > 4
  ) {
    return 'Hãy nhập GPA mục tiêu (0-4) và số tín chỉ còn lại (từ 1)';
  }

  const stats = calcStats(courses);
  const need =
    (targetNum * (stats.credits + remainingNum) - stats.points) / remainingNum;

  if (need > 4) {
    return 'Không thể đạt mục tiêu này';
  }
  if (need <= 0) {
    return 'Bạn đã đạt mục tiêu';
  }
  return `Cần đạt trung bình ${need.toFixed(2)} điểm (hệ 4) ở ${remainingNum} tín chỉ còn lại`;
};