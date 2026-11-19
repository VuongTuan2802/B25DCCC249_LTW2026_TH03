import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useLocalStorage } from './hooks/useLocalStorage';
import { useDebounce } from './hooks/useDebounce';
import { hasSaved } from './store';
import { GRADES, SEMESTERS } from './data';
import { calcStats, getGrade } from './utils';
import { CourseRow } from './components/CourseRow';
import { AddCourseForm } from './components/AddCourseForm';
import { GoalPlanner } from './components/GoalPlanner';

const BUILD_TAG = 'ltw2026-th03-bai3';

const App = () => {
  const dispatch = useDispatch();
  const courses = useSelector(selectCourses);
  const { theme, toggleTheme } = useTheme();
  const { showNotice } = useNotice();

  const { data, loading, error } = useFetch('/data/courses.json');

  useEffect(() => {
    if (!hasSaved && data) {
      dispatch(setCourses(data));
    }
  }, [data, dispatch]);

  const [selectedSemester, setSelectedSemester] = useLocalStorage(
    'ltw_sodiem_semester',
    'all'
  );
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const searchInputRef = useRef(null);

  const handleCourseShift = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const handleKey = (e) => {
      const activeTag = document.activeElement
        ? document.activeElement.tagName.toLowerCase()
        : '';
      const isEditing =
        activeTag === 'input' ||
        activeTag === 'select' ||
        activeTag === 'textarea' ||
        Boolean(document.activeElement && document.activeElement.isContentEditable);

      if (e.key === '/' && !isEditing) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      } else if (
        e.key === 'Escape' &&
        searchInputRef.current &&
        document.activeElement === searchInputRef.current
      ) {
        setSearch('');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const semesterCourses = useMemo(() => {
    if (selectedSemester === 'all') {
      return courses;
    }
    return courses.filter((course) => course.semester === selectedSemester);
  }, [courses, selectedSemester]);

  const visibleCourses = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase();
    if (!keyword) {
      return semesterCourses;
    }
    return semesterCourses.filter(
      (course) =>
        course.name.toLowerCase().includes(keyword) ||
        course.code.toLowerCase().includes(keyword)
    );
  }, [semesterCourses, debouncedSearch]);

  const stats = useMemo(() => calcStats(semesterCourses), [semesterCourses]);
  const cumulativeStats = useMemo(() => calcStats(courses), [courses]);

  const gradeDistribution = useMemo(() => {
    const countsMap = semesterCourses.reduce((acc, course) => {
      const letter = getGrade(course.score).letter;
      acc[letter] = (acc[letter] || 0) + 1;
      return acc;
    }, {});

    return GRADES.map((gradeItem) => ({
      letter: gradeItem.letter,
      count: countsMap[gradeItem.letter] || 0,
    }));
  }, [semesterCourses]);

  useEffect(() => {
    if (courses.length > 0) {
      document.title = `GPA ${cumulativeStats.gpa.toFixed(2)} – Sổ điểm`;
    } else {
      document.title = 'Sổ điểm';
    }
  }, [courses.length, cumulativeStats.gpa]);

  const handleScore = useCallback(
    (id, score) => {
      dispatch(setScore({ id, score }));
    },
    [dispatch]
  );

  const handleRemove = useCallback(
    (course) => {
      dispatch(removeCourse(course.id));
      showNotice(`Đã xóa môn ${course.name}`);
    },
    [dispatch, showNotice]
  );

  const handleResetSample = () => {
    if (Array.isArray(data)) {
      dispatch(setCourses(data));
    }
    showNotice('Đã đặt lại dữ liệu mẫu');
  };

  return (
    <div className={`app ${theme}`} data-build={BUILD_TAG}>
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

        <h3>Phân bố điểm chữ</h3>
        <ul className="grade-list">
          {gradeDistribution.map((item) => (
            <li key={item.letter} className="grade-item">
              <span>{item.letter}: {item.count}</span>
              <span
                className="grade-bar"
                style={{ width: `${item.count * 24}px` }}
              />
            </li>
          ))}
        </ul>
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

          <label htmlFor="search-course">Tìm môn học</label>
          <input
            id="search-course"
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={handleCourseShift}
          />
        </div>

        <p>Tìm thấy {visibleCourses.length} môn</p>

        {!hasSaved && loading && <p>Đang tải bảng điểm...</p>}
        {!hasSaved && error && <p>Không tải được bảng điểm</p>}
        {visibleCourses.length === 0 && (
          <p>Chưa có môn học nào</p>
        )}

        {visibleCourses.length > 0 && (
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
                <th>Số lần render</th>
                <th>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {visibleCourses.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  onScore={handleScore}
                  onRemove={handleRemove}
                />
              ))}
            </tbody>
          </table>
        )}

        <div className="table-actions">
          <button type="button" onClick={handleResetSample}>
            Đặt lại dữ liệu mẫu
          </button>
        </div>
      </section>

      <AddCourseForm />
      <GoalPlanner />
    </div>
  );
};

export default App;