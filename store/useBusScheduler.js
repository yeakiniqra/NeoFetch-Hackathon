import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

const useBusSchedulerStore = create((set, get) => ({
  // State variables
  loading: true,
  routeData: [],
  error: null,
  selectedRoute: null,
  buses: [],
  stops: [],
  selectedRouteId: null,
  dropdownItems: [],
  announcements: [
    {
      id: 1,
      title: "Route Change Notice",
      date: "2025-03-01",
      content: "Due to construction, Route A will be diverted via Main Street starting Monday."
    },
    {
      id: 2,
      title: "Special Holiday Schedule",
      date: "2025-03-02",
      content: "All buses will operate on a reduced schedule during the upcoming holiday."
    }
  ],
  mapboxToken: "pk.eyJ1IjoiaXFyYXJ0eiIsImEiOiJjbTFlaW15MHAyenF1MmtwdWpyMG15dTk3In0.K3KP0ZbtsG1M5w7dH5dZhA",

  // Actions
  saveRoutePreference: async (routeId) => {
    try {
      await AsyncStorage.setItem('@transport_preferred_route', routeId);
    } catch (error) {
      console.error("Error saving route preference:", error);
    }
  },

  loadRoutePreference: async () => {
    try {
      const savedRouteId = await AsyncStorage.getItem('@transport_preferred_route');
      if (savedRouteId !== null) {
        return savedRouteId;
      }
    } catch (error) {
      console.error("Error loading route preference:", error);
    }
    return null;
  },

  fetchRouteData: async () => {
    try {
      set({ loading: true });
      
      // Get all routes from the bus_schedules collection
      const routesSnapshot = await getDocs(collection(db, "bus_schedules"));
      
      // Format the data
      const routesData = [];
      routesSnapshot.forEach((doc) => {
        routesData.push({ id: doc.id, ...doc.data() });
      });
      
      // Format for dropdown
      const items = routesData.map(route => ({
        label: route.route_name || `Route ${route.route_id || route.id}`,
        value: route.id
      }));
      
      // Load saved preference
      const savedRouteId = await get().loadRoutePreference();
      
      // Set the preferred route or first route as selected by default
      let initialRoute;
      let initialRouteId;
      
      if (savedRouteId && routesData.find(r => r.id === savedRouteId)) {
        initialRoute = routesData.find(r => r.id === savedRouteId);
        initialRouteId = savedRouteId;
      } else if (routesData.length > 0) {
        initialRoute = routesData[0];
        initialRouteId = routesData[0].id;
      }
      
      let initialBuses = [];
      let initialStops = [];
      
      if (initialRoute) {
        // Format stops and buses for the initial route
        if (initialRoute.stops) initialStops = initialRoute.stops;
        if (initialRoute.buses) {
          // Format buses for the map component
          initialBuses = initialRoute.buses.map(bus => ({
            ...bus,
            // Ensure current_location is properly formatted
            current_location: bus.current_location || { lat: 0, long: 0 }
          }));
        }
      }
      
      set({
        routeData: routesData,
        dropdownItems: items,
        selectedRouteId: initialRouteId,
        selectedRoute: initialRoute,
        buses: initialBuses,
        stops: initialStops,
        loading: false,
        error: null
      });
      
    } catch (err) {
      console.error("Error fetching route data:", err);
      set({ 
        error: "Failed to load bus schedule data",
        loading: false
      });
    }
  },

  handleRouteSelect: (routeId) => {
    const { routeData } = get();
    const route = routeData.find(r => r.id === routeId);
    
    if (route) {
      // Format buses
      let updatedBuses = [];
      if (route.buses) {
        updatedBuses = route.buses.map(bus => ({
          ...bus,
          current_location: bus.current_location || { lat: 0, long: 0 }
        }));
      }
      
      // Save user preference
      get().saveRoutePreference(routeId);
      
      set({
        selectedRoute: route,
        selectedRouteId: routeId,
        stops: route.stops || [],
        buses: updatedBuses
      });
    }
  },
  
  retryFetch: () => {
    get().fetchRouteData();
  }
}));

export default useBusSchedulerStore;