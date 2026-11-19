export const coursesReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD': {
      return Array.isArray(action.payload) ? [...action.payload] : [];
    }
    case 'ADD': {
      const maxId = state.reduce((max, item) => (item.id > max ? item.id : max), 0);
      const newCourse = {
        ...action.payload,
        id: maxId + 1,
      };
      return [...state, newCourse];
    }
    case 'REMOVE': {
      return state.filter((item) => item.id !== action.payload);
    }
    case 'SET_SCORE': {
      const { id, score } = action.payload;
      return state.map((item) =>
        item.id === id ? { ...item, score } : item
      );
    }
    default:
      return state;
  }
};