import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const useAssignment = create((set, get) => ({
  // State
  assignments: [],
  loading: false,
  error: null,
  formOpen: false,
  currentAssignment: {
    id: null,
    title: '',
    date: new Date(),
    notes: '',
  },
  
  // Load user assignments from Firestore
  fetchAssignments: async (uid) => {
    if (!uid) return;
    
    try {
      set({ loading: true, error: null });
      
      const assignmentsRef = collection(db, 'assignments');
      const q = query(assignmentsRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      
      const assignments = [];
      querySnapshot.forEach((doc) => {
        assignments.push({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate() || new Date(), // Convert Firestore timestamp to JS Date
        });
      });
      
      // Sort assignments by date (nearest first)
      assignments.sort((a, b) => a.date - b.date);
      
      set({ assignments, loading: false });
      
      // Cache assignments in AsyncStorage
      await AsyncStorage.setItem(`assignments-${uid}`, JSON.stringify(assignments));
    } catch (error) {
      console.error('Error fetching assignments:', error);
      set({ error: error.message, loading: false });
      
      // Try to load from cache if Firestore fetch fails
      try {
        const cachedData = await AsyncStorage.getItem(`assignments-${uid}`);
        if (cachedData) {
          const assignments = JSON.parse(cachedData);
          assignments.forEach(assignment => {
            assignment.date = new Date(assignment.date);
          });
          set({ assignments });
        }
      } catch (cacheError) {
        console.error('Error loading from cache:', cacheError);
      }
    }
  },
  
  // Open form to add new assignment
  openAddForm: () => {
    set({
      formOpen: true,
      currentAssignment: {
        id: null,
        title: '',
        date: new Date(),
        notes: '',
      }
    });
  },
  
  // Open form to edit existing assignment
  openEditForm: (assignment) => {
    set({
      formOpen: true,
      currentAssignment: {
        ...assignment,
        date: assignment.date instanceof Date ? assignment.date : new Date(assignment.date),
      }
    });
  },
  
  // Close form
  closeForm: () => {
    set({ formOpen: false });
  },
  
  // Update current assignment data (used while editing in form)
  updateFormField: (field, value) => {
    set(state => ({
      currentAssignment: {
        ...state.currentAssignment,
        [field]: value
      }
    }));
  },
  
  // Save assignment (create new or update existing)
  saveAssignment: async (uid) => {
    if (!uid) return;
    
    try {
      set({ loading: true, error: null });
      
      const { currentAssignment } = get();
      const { id, title, date, notes } = currentAssignment;
      
      if (!title.trim()) {
        set({ error: 'Title is required', loading: false });
        return;
      }
      
      const assignmentData = {
        title,
        date,
        notes,
        userId: uid,
        updatedAt: serverTimestamp()
      };
      
      let updatedAssignments = [...get().assignments];
      
      if (id) {
        // Update existing assignment
        const assignmentRef = doc(db, 'assignments', id);
        await updateDoc(assignmentRef, assignmentData);
        
        // Update local state
        const index = updatedAssignments.findIndex(a => a.id === id);
        if (index !== -1) {
          updatedAssignments[index] = {
            ...assignmentData,
            id,
            updatedAt: new Date() // Use local date until sync
          };
        }
      } else {
        // Add new assignment
        assignmentData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'assignments'), assignmentData);
        
        // Add to local state
        updatedAssignments.push({
          ...assignmentData,
          id: docRef.id,
          createdAt: new Date(), // Use local date until sync
          updatedAt: new Date() // Use local date until sync
        });
      }
      
      // Sort assignments by date
      updatedAssignments.sort((a, b) => a.date - b.date);
      
      set({ 
        assignments: updatedAssignments,
        loading: false,
        formOpen: false
      });
      
      // Update cache
      await AsyncStorage.setItem(`assignments-${uid}`, JSON.stringify(updatedAssignments));
      
      return true;
    } catch (error) {
      console.error('Error saving assignment:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  },
  
  // Delete assignment
  deleteAssignment: async (assignmentId, uid) => {
    if (!assignmentId || !uid) return;
    
    try {
      set({ loading: true, error: null });
      
      // Delete from Firestore
      const assignmentRef = doc(db, 'assignments', assignmentId);
      await deleteDoc(assignmentRef);
      
      // Update local state
      const updatedAssignments = get().assignments.filter(
        assignment => assignment.id !== assignmentId
      );
      
      set({ assignments: updatedAssignments, loading: false });
      
      // Update cache
      await AsyncStorage.setItem(`assignments-${uid}`, JSON.stringify(updatedAssignments));
      
      return true;
    } catch (error) {
      console.error('Error deleting assignment:', error);
      set({ error: error.message, loading: false });
      return false;
    }
  }
}));

export default useAssignment;