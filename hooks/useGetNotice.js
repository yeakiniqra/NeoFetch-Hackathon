import { getNotice } from "../utils/api";
import { useState, useEffect, useMemo } from 'react';

const useNotices = (options = {}) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch notices data
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        const data = await getNotice();
        
        if (Array.isArray(data)) {
          setNotices(data);
        } else {
          throw new Error("Invalid notice data format received");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch notices");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, [refreshTrigger]);

  // Filter notices based on category and priority if provided
  const filteredNotices = useMemo(() => {
    const { category, priority, search } = options;
    
    return notices.filter(notice => {
      if (category && notice.category !== category) return false;
      if (priority && notice.priority !== priority) return false;
      if (search && !notice.headline.toLowerCase().includes(search.toLowerCase()) && 
          !notice.short_Description.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [notices, options]);

  // Group notices by category
  const noticesByCategory = useMemo(() => {
    return notices.reduce((acc, notice) => {
      if (!acc[notice.category]) {
        acc[notice.category] = [];
      }
      acc[notice.category].push(notice);
      return acc;
    }, {});
  }, [notices]);

  // Get important notices
  const importantNotices = useMemo(() => {
    return notices.filter(notice => notice.priority === "Important");
  }, [notices]);

  // Sort notices by date (most recent first)
  const sortedNotices = useMemo(() => {
    return [...notices].sort((a, b) => 
      new Date(b.datetime) - new Date(a.datetime)
    );
  }, [notices]);

  // Function to refresh notices
  const refreshNotices = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return {
    notices,
    filteredNotices,
    noticesByCategory,
    importantNotices,
    sortedNotices,
    loading,
    error,
    refreshNotices
  };
};

export default useNotices;