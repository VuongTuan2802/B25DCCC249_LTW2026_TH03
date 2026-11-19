import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeCourse,
  selectCourses,
  setCourses,
  setScore,
} from './features/coursesSlice';
import { useTheme } from './context/ThemeContext';
import { useNotice } from './context/NoticeContext';
import { useFetch } from './hooks/useFetch';
import { SEMESTERS, formatPoint } from './data';
import { calcStats, getGrade } from './utils';
import { AddCourseForm } from './components/AddCourseForm';
import { GoalPlanner } from './components/GoalPlanner';

const App = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const { theme, toggleTheme } = useTheme();
  const { showNotice } = useNotice();

  const { data, loading, error } = useFetch('/data/courses.json');
  const [selectedSemester, setSelectedSemester] = useState('all');

  useEffect(() => {
    if (data) {
      dispatch(setCourses(data));
    }
  }, [data, dispatch]);

  const visibleCourses = useMemo(() => {
    if (selectedSemester === 'all') {
      return courses;
    }
    return courses.filter((course) => course.semester === selectedSemester);
  }, [courses, selectedSemester]);

  const stats = useMemo(() => calcStats(visibleCourses), [visibleCourses]);
  const cumulativeStats = useMemo(() => calcStats(courses), [courses]);

  const handleScoreChange = (id, e) => {
    const val = e.target.valueAsNumber;
    if (!Number.isNaN(val) && val >= 0 && val <= 10) {
      dispatch(setScore({ id, score: val }));
    }
  };

  const handleRemove = (course) => {
    dispatch(removeCourse(course.id));
    showNotice(`Đã xóa môn ${course.name}`);
  };

  return (
    <div className={`app ${theme}`}>
      <header className="page-header">
        <h1>Sổ điểm sinh viên</h1>
        <button type="button" onClick={toggleTheme}>
          {theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
        </button>
      </header>

      <section aria-label="Thống kê" className="stats-box">
        <h2>Thống kê</h2>
        <p>Số môn: {stats.count}</p>
        <p>Tổng tín chỉ: {stats.credits}</p>
        <p>GPA (hệ 4): {stats.gpa.toFixed(2)}</p>
        <p>Xếp loại: {stats.rank}</p>
        <p>GPA tích lũy: {cumulativeStats.gpa.toFixed(2)}</p>
      </section>

      <section aria-label="Bảng điểm" className="table-box">
        <h2>Bảng điểm</h2>
        <div className="filter-row">
          <label htmlFor="semester-filter">Xem học kỳ</label>
          <select
            id="semester-filter"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
          >
            <option value="all">Tất cả</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem}
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Đang tải bảng điểm...</p>}
        {!loading && error && <p>Không tải được bảng điểm</p>}
        {!loading && !error && visibleCourses.length === 0 && (
          <p>Chưa có môn học nào</p>
        )}

        {!loading && !error && visibleCourses.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Mã môn</th>
                <th>Tên môn</th>
                <th>Tín chỉ</th>
                <th>Học kỳ</th>
                <th>Điểm (hệ 10)</th>
                <th>Điểm chữ</th>
                <th>Điểm (hệ 4)</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((course) => {
                const grade = getGrade(course.score);
                const isFail = grade.letter === 'F';

                return (
                  <tr
                    key={course.id}
                    className={isFail ? 'row-fail' : undefined}
                  >
                    <td>{course.code}</td>
                    <td>{course.name}</td>
                    <td>{course.credits}</td>
                    <td>{course.semester}</td>
                    <td>
                      <input
                        key={`${course.id}-${course.score}`}
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        aria-label={`Điểm ${course.name}`}
                        defaultValue={course.score}
                        onChange={(e) => handleScoreChange(course.id, e)}
                      />
                    </td>
                    <td>{isFail ? 'F – Học lại' : grade.letter}</td>
                    <td>{formatPoint(grade.point)}</td>
                    <td>
                      <button type="button" onClick={() => handleRemove(course)}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <AddCourseForm />
      <GoalPlanner />
    </div>
  );
};

export default App;