import React, { useRef } from 'react';
import { formatPoint } from '../data';
import { getGrade } from '../utils';

export const CourseRow = React.memo(({ course, onScore, onRemove }) => {
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;

  const grade = getGrade(course.score);
  const isFail = grade.letter === 'F';

  const handleChange = (e) => {
    const val = e.target.valueAsNumber;
    if (!Number.isNaN(val) && val >= 0 && val <= 10) {
      onScore(course.id, val);
    }
  };

  return (
    <tr className={isFail ? 'row-fail' : undefined}>
      <td>{course.code}</td>
      <td>{course.name}</td>
      <td>{course.credits}</td>
      <td>{course.semester}</td>
      <td>
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          aria-label={`Điểm ${course.name}`}
          value={course.score}
          onChange={handleChange}
        />
      </td>
      <td>{isFail ? 'F – Học lại' : grade.letter}</td>
      <td>{formatPoint(grade.point)}</td>
      <td>{renderCountRef.current}</td>
      <td>
        <button type="button" onClick={() => onRemove(course)}>
          Xóa
        </button>
      </td>
    </tr>
  );
});