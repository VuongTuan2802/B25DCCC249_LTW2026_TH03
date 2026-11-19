import { configureStore } from '@reduxjs/toolkit';
import coursesReducer from './features/coursesSlice';
import goalReducer from './features/goalSlice';
import { loadSaved, saveCourses } from './storage';

const savedCourses = loadSaved();
export const hasSaved = savedCourses !== null;

export const store = configureStore({
  reducer: {
    courses: coursesReducer,
    goal: goalReducer,
  },
  preloadedState: {
    courses: savedCourses ?? [],
  },
});

let prevCourses = store.getState().courses;

store.subscribe(() => {
  const nextCourses = store.getState().courses;
  if (nextCourses !== prevCourses) {
    prevCourses = nextCourses;
    saveCourses(nextCourses);
  }
});