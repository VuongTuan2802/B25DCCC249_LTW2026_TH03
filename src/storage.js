const COURSES_STORAGE_KEY = 'ltw_sodiem_courses';

export const loadSaved = () => {
  try {
    const raw = window.localStorage.getItem(COURSES_STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch (err) {
    return null;
  }
};

export const saveCourses = (courses) => {
  try {
    window.localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  } catch (err) {
    // Bỏ qua lỗi ghi storage
  }
};