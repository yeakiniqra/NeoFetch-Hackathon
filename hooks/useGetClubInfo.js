import { getClubsinfo, getSingleClubinfo } from "../utils/api";
import { useEffect, useState, useCallback, useMemo } from "react";

export default function useClubInfo() {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all clubs
  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getClubsinfo();
        
        if (Array.isArray(data)) {
          setClubs(data);
        } else {
          throw new Error("Invalid clubs data format received");
        }
      } catch (error) {
        setError(error.message || "Failed to fetch clubs information");
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [refreshTrigger]);

  // Function to fetch a single club by ID
  const getClub = useCallback(async (id) => {
    setDetailLoading(true);
    setError(null);
    
    try {
      const data = await getSingleClubinfo(id);
      setSelectedClub(data);
      return data;
    } catch (error) {
      const errorMessage = error.message || "Failed to fetch club details";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Sort clubs alphabetically by name
  const sortedClubs = useMemo(() => {
    return [...clubs].sort((a, b) => 
      a.club_Name.localeCompare(b.club_Name)
    );
  }, [clubs]);

  // Search clubs by name
  const searchClubs = useCallback((searchTerm) => {
    if (!searchTerm) return clubs;
    
    return clubs.filter(club => 
      club.club_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clubs]);

  // Refresh clubs data
  const refreshClubs = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Clear selected club
  const clearSelectedClub = useCallback(() => {
    setSelectedClub(null);
  }, []);

  return { 
    clubs,
    sortedClubs,
    selectedClub,
    loading,
    detailLoading,
    error,
    getClub,
    searchClubs,
    refreshClubs,
    clearSelectedClub
  };
}