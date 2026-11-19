import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const NoticeContext = createContext(null);

export const NoticeProvider = ({ children }) => {
  const [notice, setNotice] = useState('');
  const [tick, setTick] = useState(0);

  const showNotice = useCallback((text) => {
    setNotice(text);
    setTick((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setNotice('');
    }, 3000);

    return () => clearTimeout(timer);
  }, [notice, tick]);

  const value = useMemo(() => ({ showNotice }), [showNotice]);

  return (
    <NoticeContext.Provider value={value}>
      {notice && <div role="status" className="notice-banner">{notice}</div>}
      {children}
    </NoticeContext.Provider>
  );
};

export const useNotice = () => {
  const ctx = useContext(NoticeContext);
  if (!ctx) {
    throw new Error('useNotice phải dùng bên trong NoticeProvider');
  }
  return ctx;
};