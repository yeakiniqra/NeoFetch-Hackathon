import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const useEvents = create((set, get) => ({
  // State
  events: [],
  myEvents: [],
  currentEvent: null,
  loading: false,
  refreshing: false,
  error: null,
  
  // Fetch all events
  fetchEvents: async () => {
    try {
      set({ loading: true, error: null });
      
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const events = [];
      querySnapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date || '',
        });
      });
      
      set({ events, loading: false });
      
      // Cache events
      await AsyncStorage.setItem('events', JSON.stringify(events));
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ error: error.message, loading: false });
      
      // Try to load from cache
      try {
        const cachedData = await AsyncStorage.getItem('events');
        if (cachedData) {
          const events = JSON.parse(cachedData);
          set({ events });
          return events;
        }
      } catch (cacheError) {
        console.error('Error loading from cache:', cacheError);
      }
      return [];
    }
  },
  
  // Refresh events (for pull-to-refresh)
  refreshEvents: async () => {
    try {
      set({ refreshing: true, error: null });
      await get().fetchEvents();
      set({ refreshing: false });
    } catch (error) {
      set({ error: error.message, refreshing: false });
    }
  },
  
  // Fetch a single event by ID
  fetchEventById: async (eventId) => {
    if (!eventId) return null;
    
    try {
      set({ loading: true, error: null });
      
      // Try to find in current events first
      let event = get().events.find(e => e.id === eventId);
      
      if (!event) {
        // Fetch from Firestore
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await getDoc(eventRef);
        
        if (eventDoc.exists()) {
          event = { 
            id: eventDoc.id, 
            ...eventDoc.data(),
            date: eventDoc.data().date || '',
          };
        } else {
          throw new Error('Event not found');
        }
      }
      
      set({ currentEvent: event, loading: false });
      return event;
    } catch (error) {
      console.error('Error fetching event:', error);
      set({ error: error.message, loading: false });
      return null;
    }
  },
  
  // Fetch events that user has RSVP'd to
  fetchMyEvents: async (uid) => {
    if (!uid) return [];
    
    try {
      set({ loading: true, error: null });
      
      // Fetch all events the user has RSVP'd to
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('attendees', 'array-contains', uid), orderBy('date', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const myEvents = [];
      querySnapshot.forEach((doc) => {
        myEvents.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date || '',
        });
      });
      
      set({ myEvents, loading: false });
      
      // Cache my events
      await AsyncStorage.setItem(`my-events-${uid}`, JSON.stringify(myEvents));
      return myEvents;
    } catch (error) {
      console.error('Error fetching my events:', error);
      set({ error: error.message, loading: false });
      
      // Try to load from cache
      try {
        const cachedData = await AsyncStorage.getItem(`my-events-${uid}`);
        if (cachedData) {
          const myEvents = JSON.parse(cachedData);
          set({ myEvents });
          return myEvents;
        }
      } catch (cacheError) {
        console.error('Error loading from cache:', cacheError);
      }
      return [];
    }
  },
  
  // RSVP to an event
  rsvpToEvent: async (eventId, uid, userName = '') => {
    console.log('[rsvpToEvent] Starting RSVP with:', { eventId, uid, userName });
    if (!eventId || !uid) return false;
    
    try {
      set({ loading: true, error: null });
      
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }
      
      const eventData = eventDoc.data();
      // Make sure attendees array exists
      const attendees = eventData.attendees || [];
      const isAlreadyRsvp = attendees.includes(uid);
      
      if (isAlreadyRsvp) {
        throw new Error('You have already RSVP\'d to this event');
      }
      
      // Initialize attendeeDetails if it doesn't exist
      const attendeeDetails = eventData.attendeeDetails || [];
      
      // Add user to attendees array and increment RSVP count
      await updateDoc(eventRef, {
        attendees: arrayUnion(uid),
        rsvp_count: increment(1),
        attendeeDetails: arrayUnion({
          uid,
          name: userName,
          rsvpDate: new Date().toISOString()
        }),
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      const updatedEvents = get().events.map(event => {
        if (event.id === eventId) {
          const eventAttendees = event.attendees || [];
          const eventAttendeeDetails = event.attendeeDetails || [];
          
          return {
            ...event,
            attendees: [...eventAttendees, uid],
            rsvp_count: (event.rsvp_count || 0) + 1,
            attendeeDetails: [
              ...eventAttendeeDetails, 
              { uid, name: userName, rsvpDate: new Date().toISOString() }
            ]
          };
        }
        return event;
      });
      
      // If currentEvent is this event, update it too
      let updatedCurrentEvent = null;
      if (get().currentEvent && get().currentEvent.id === eventId) {
        const currentEvent = get().currentEvent;
        const currentAttendees = currentEvent.attendees || [];
        const currentAttendeeDetails = currentEvent.attendeeDetails || [];
        
        updatedCurrentEvent = {
          ...currentEvent,
          attendees: [...currentAttendees, uid],
          rsvp_count: (currentEvent.rsvp_count || 0) + 1,
          attendeeDetails: [
            ...currentAttendeeDetails,
            { uid, name: userName, rsvpDate: new Date().toISOString() }
          ]
        };
      }
      
      // Add to myEvents
      const isInMyEvents = get().myEvents.some(event => event.id === eventId);
      let updatedMyEvents = [...get().myEvents];
      
      if (!isInMyEvents) {
        const eventToAdd = updatedEvents.find(event => event.id === eventId);
        if (eventToAdd) {
          updatedMyEvents.push(eventToAdd);
          // Sort by date
          updatedMyEvents.sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
          });
        }
      }
      
      set({ 
        events: updatedEvents,
        currentEvent: updatedCurrentEvent || get().currentEvent,
        myEvents: updatedMyEvents,
        loading: false 
      });
      
      // Update caches
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      await AsyncStorage.setItem(`my-events-${uid}`, JSON.stringify(updatedMyEvents));
      
      return true;
    } catch (error) {
      console.error('Error RSVP\'ing to event:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  },
  
  // Cancel RSVP to an event
  cancelRsvp: async (eventId, uid) => {
    if (!eventId || !uid) return false;
    
    try {
      set({ loading: true, error: null });
      
      const eventRef = doc(db, 'events', eventId);
      const eventDoc = await getDoc(eventRef);
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }
      
      const eventData = eventDoc.data();
      const attendees = eventData.attendees || [];
      const isRsvpd = attendees.includes(uid);
      
      if (!isRsvpd) {
        throw new Error('You haven\'t RSVP\'d to this event');
      }
      
      // Find the attendee details to remove
      const attendeeDetails = eventData.attendeeDetails || [];
      const attendeeToRemove = attendeeDetails.find(
        attendee => attendee.uid === uid
      );
      
      // Remove user from attendees array and decrement RSVP count
      await updateDoc(eventRef, {
        attendees: arrayRemove(uid),
        rsvp_count: increment(-1),
        attendeeDetails: attendeeToRemove ? arrayRemove(attendeeToRemove) : arrayRemove(),
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      const updatedEvents = get().events.map(event => {
        if (event.id === eventId) {
          const eventAttendees = (event.attendees || []).filter(id => id !== uid);
          const eventAttendeeDetails = (event.attendeeDetails || []).filter(
            attendee => attendee?.uid !== uid
          );
          
          return {
            ...event,
            attendees: eventAttendees,
            rsvp_count: Math.max((event.rsvp_count || 0) - 1, 0),
            attendeeDetails: eventAttendeeDetails
          };
        }
        return event;
      });
      
      // If currentEvent is this event, update it too
      let updatedCurrentEvent = null;
      if (get().currentEvent && get().currentEvent.id === eventId) {
        const currentEvent = get().currentEvent;
        const currentAttendees = (currentEvent.attendees || []).filter(id => id !== uid);
        const currentAttendeeDetails = (currentEvent.attendeeDetails || []).filter(
          attendee => attendee?.uid !== uid
        );
        
        updatedCurrentEvent = {
          ...currentEvent,
          attendees: currentAttendees,
          rsvp_count: Math.max((currentEvent.rsvp_count || 0) - 1, 0),
          attendeeDetails: currentAttendeeDetails
        };
      }
      
      // Remove from myEvents
      const updatedMyEvents = get().myEvents.filter(event => event.id !== eventId);
      
      set({ 
        events: updatedEvents,
        currentEvent: updatedCurrentEvent || get().currentEvent,
        myEvents: updatedMyEvents,
        loading: false 
      });
      
      // Update caches
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      await AsyncStorage.setItem(`my-events-${uid}`, JSON.stringify(updatedMyEvents));
      
      return true;
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  },
  
  // Check if user has RSVP'd to an event
  hasUserRsvpd: (eventId, uid) => {
    if (!eventId || !uid) return false;
    
    // Try to find in currentEvent first for performance
    if (get().currentEvent && get().currentEvent.id === eventId) {
      const attendees = get().currentEvent.attendees || [];
      return attendees.includes(uid);
    }
    
    // Otherwise check in events array
    const event = get().events.find(e => e.id === eventId);
    if (!event) return false;
    
    const attendees = event.attendees || [];
    return attendees.includes(uid);
  },
  
  // Set current event (for event details page)
  setCurrentEvent: (event) => {
    set({ currentEvent: event });
  },
  
  // Clear current event
  clearCurrentEvent: () => {
    set({ currentEvent: null });
  },
  
  // Clear errors
  clearError: () => {
    set({ error: null });
  }
}));

export default useEvents;