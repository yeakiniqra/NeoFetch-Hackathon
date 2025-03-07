import { create } from "zustand";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import useAuthStore from './useAuthStore';

const useSafety = create((set, get) => ({
  safetyConcerns: [],
  loading: false,
  error: null,

  fetchSafetyConcerns: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch all safety concerns instead of just the current user's
      const q = query(collection(db, 'safetyConcerns'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const concerns = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ safetyConcerns: concerns, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  reportSafetyConcern: async (concern) => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      await addDoc(collection(db, 'safetyConcerns'), {
        ...concern,
        uid: user.uid,
        timestamp: serverTimestamp(),
      });
      get().fetchSafetyConcerns(); // Refresh the list
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateSafetyConcern: async (id, updatedConcern) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, 'safetyConcerns', id), updatedConcern);
      get().fetchSafetyConcerns(); // Refresh the list
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteSafetyConcern: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'safetyConcerns', id));
      get().fetchSafetyConcerns(); // Refresh the list
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useSafety;