import { getRoutine } from "../utils/api";
import { useState, useEffect, useMemo } from 'react';

const useRoutines = (filterOptions = {}) => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch routines data
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);
        const data = await getRoutine();
        
        if (Array.isArray(data)) {
          setRoutines(data);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch routines");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutines();
  }, [refreshTrigger]);

  // Filter routines based on semester and section if provided
  const filteredRoutines = useMemo(() => {
    if (!Array.isArray(routines)) return [];
    const { semester, section } = filterOptions || {};
  
    return routines.filter(routine => {
      if (semester && routine.semester !== semester) return false;
      if (section && routine.section !== section) return false;
      return true;
    });
  }, [routines, filterOptions]);

  // Group routines by semester
  const routinesBySemester = useMemo(() => {
    return routines.reduce((acc, routine) => {
      if (!acc[routine.semester]) {
        acc[routine.semester] = [];
      }
      acc[routine.semester].push(routine);
      return acc;
    }, {});
  }, [routines]);

  // Function to refresh routines
  const refreshRoutines = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return { 
    routines,
    filteredRoutines,
    routinesBySemester, 
    loading, 
    error,
    refreshRoutines
  };
};

export default useRoutines;