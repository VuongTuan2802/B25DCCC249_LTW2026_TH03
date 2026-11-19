import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { CREDIT_OPTIONS, SEMESTERS, formatPoint } from './data';
import { useFetch } from './hooks/useFetch';
import { calcStats, getGrade } from './utils';
import { coursesReducer } from './coursesReducer';
import './index.css';

const App = () => {
  const { data, loading, error } = useFetch('/data/courses.json');
  const [courses, dispatch] = useReducer(coursesReducer, []);

  useEffect(() => {
    if (data) {
      dispatch({ type: 'LOAD', payload: data });
    }
  }, [data]);

  const [selectedSemester, setSelectedSemester] = useState('all');

  // Form Thêm môn học (controlled)
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState('Học kỳ 1');
  const [score, setScore] = useState('');

  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [scoreError, setScoreError] = useState('');

  const codeInputRef = useRef(null);

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
      dispatch({ type: 'SET_SCORE', payload: { id, score: val } });
    }
  };

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE', payload: id });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();

    const trimmedCode = code.trim();
    const trimmedName = name.trim();
    const numericScore = score === '' ? NaN : Number(score);

    let nextCodeError = '';
    let nextNameError = '';
    let nextScoreError = '';

    if (!trimmedCode) {
      nextCodeError = 'Hãy nhập mã môn';
    } else {
      const duplicated = courses.some(
        (item) => item.code.trim().toLowerCase() === trimmedCode.toLowerCase()
      );
      if (duplicated) {
        nextCodeError = 'Mã môn đã tồn tại';
      }
    }

    if (!trimmedName) {
      nextNameError = 'Hãy nhập tên môn';
    }

    if (score === '' || Number.isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      nextScoreError = 'Điểm phải từ 0 đến 10';
    }

    setCodeError(nextCodeError);
    setNameError(nextNameError);
    setScoreError(nextScoreError);

    if (nextCodeError || nextNameError || nextScoreError) {
      return;
    }

    dispatch({
      type: 'ADD',
      payload: {
        code: trimmedCode.toUpperCase(),
        name: trimmedName,
        credits: Number(credits),
        semester,
        score: numericScore,
      },
    });

    setCode('');
    setName('');
    setCredits(3);
    setSemester('Học kỳ 1');
    setScore('');
    setCodeError('');
    setNameError('');
    setScoreError('');

    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  };

  return (
    <div className="app">
      <h1>Sổ điểm sinh viên</h1>

      {/* Khu vực Thống kê */}
      <section aria-label="Thống kê" className="stats-box">
        <h2>Thống kê</h2>
        <p>Số môn: {stats.count}</p>
        <p>Tổng tín chỉ: {stats.credits}</p>
        <p>GPA (hệ 4): {stats.gpa.toFixed(2)}</p>
        <p>Xếp loại: {stats.rank}</p>
        <p>GPA tích lũy: {cumulativeStats.gpa.toFixed(2)}</p>
      </section>

      {/* Lọc học kỳ & Bảng điểm */}
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
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        aria-label={`Điểm ${course.name}`}
                        value={course.score}
                        onChange={(e) => handleScoreChange(course.id, e)}
                      />
                    </td>
                    <td>{isFail ? 'F – Học lại' : grade.letter}</td>
                    <td>{formatPoint(grade.point)}</td>
                    <td>
                      <button type="button" onClick={() => handleRemove(course.id)}>
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

      {/* Form Thêm môn học */}
      <section aria-label="Thêm môn học" className="form-box">
        <h2>Thêm môn học</h2>
        <form onSubmit={handleAddSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="course-code">Mã môn</label>
            <input
              id="course-code"
              ref={codeInputRef}
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {codeError && <p role="alert" className="error-text">{codeError}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="course-name">Tên môn</label>
            <input
              id="course-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {nameError && <p role="alert" className="error-text">{nameError}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="course-credits">Số tín chỉ</label>
            <select
              id="course-credits"
              value={credits}
              onChange={(e) => setCredits(Number(e.target.value))}
            >
              {CREDIT_OPTIONS.map((creditOption) => (
                <option key={creditOption} value={creditOption}>
                  {creditOption}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="course-semester">Học kỳ</label>
            <select
              id="course-semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
            >
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="course-score">Điểm hệ 10</label>
            <input
              id="course-score"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            />
            {scoreError && <p role="alert" className="error-text">{scoreError}</p>}
          </div>

          <button type="submit">Thêm môn</button>
        </form>
      </section>
    </div>
  );
};

export default App;