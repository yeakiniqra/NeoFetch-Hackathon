import { create } from "zustand";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy, 
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import useAuthStore from './useAuthStore';

const useLostFound = create((set, get) => ({
  lostItems: [],
  loading: false,
  error: null,

  fetchLostItems: async () => {
    set({ loading: true, error: null });
    try {
      // Fetch all lost items instead of just the current user's
      const q = query(collection(db, 'lostItems'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ lostItems: items, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  reportLostItem: async (item) => {
    set({ loading: true, error: null });
    try {
      const { user } = useAuthStore.getState();
      await addDoc(collection(db, 'lostItems'), {
        ...item,
        uid: user.uid,
        timestamp: serverTimestamp(),
      });
      get().fetchLostItems(); // Refresh the list
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateLostItem: async (id, updatedItem) => {
    set({ loading: true, error: null });
    try {
      await updateDoc(doc(db, 'lostItems', id), updatedItem);
      get().fetchLostItems(); // Refresh the list
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  deleteLostItem: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'lostItems', id));
      get().fetchLostItems(); // Refresh the list
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

export default useLostFound;