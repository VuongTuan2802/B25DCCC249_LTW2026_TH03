import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCourses } from '../features/coursesSlice';
import { selectGoal, setRemaining, setTarget } from '../features/goalSlice';
import { calcRequired } from '../utils';

export const GoalPlanner = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const goal = useSelector(selectGoal);

  const message = useMemo(
    () => calcRequired(courses, goal.target, goal.remaining),
    [courses, goal.target, goal.remaining]
  );

  return (
    <section aria-label="Mục tiêu GPA" className="goal-box">
      <h2>Mục tiêu GPA</h2>
      <div className="form-field">
        <label htmlFor="goal-target">GPA mục tiêu</label>
        <input
          id="goal-target"
          type="number"
          step="0.01"
          min="0"
          max="4"
          value={goal.target}
          onChange={(e) => dispatch(setTarget(e.target.value))}
        />
      </div>
      <div className="form-field">
        <label htmlFor="goal-remaining">Số tín chỉ còn lại</label>
        <input
          id="goal-remaining"
          type="number"
          step="1"
          min="1"
          value={goal.remaining}
          onChange={(e) => dispatch(setRemaining(e.target.value))}
        />
      </div>
      <p>{message}</p>
    </section>
  );
};