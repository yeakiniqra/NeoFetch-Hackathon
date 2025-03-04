import { useState, useEffect } from 'react';
import { getFaculties } from '../utils/api';

const useGetFaculties = () => {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const data = await getFaculties();
        const filteredFaculties = data.filter(faculty => faculty.status === 'full');
        setFaculties(filteredFaculties);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaculties();
  }, []);

  return { faculties, loading, error };
};

export default useGetFaculties;
