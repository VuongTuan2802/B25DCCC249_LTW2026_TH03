import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addCourse, selectCourses } from '../features/coursesSlice';
import { useNotice } from '../context/NoticeContext';
import { CREDIT_OPTIONS, SEMESTERS } from '../data';

export const AddCourseForm = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const { showNotice } = useNotice();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState('Học kỳ 1');
  const [score, setScore] = useState('');

  const [codeError, setCodeError] = useState('');
  const [nameError, setNameError] = useState('');
  const [scoreError, setScoreError] = useState('');

  const codeInputRef = useRef(null);

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

    const normalizedName = trimmedName;
    dispatch(
      addCourse({
        code: trimmedCode.toUpperCase(),
        name: normalizedName,
        credits: Number(credits),
        semester,
        score: numericScore,
      })
    );
    showNotice(`Đã thêm môn ${normalizedName}`);

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
  );
};