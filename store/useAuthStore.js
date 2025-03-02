import { create } from 'zustand';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const useAuthStore = create((set, get) => ({

  user: null,
  loading: false,
  error: null,


  init: () => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        set({ user, loading: false, error: null });
      } else {
        set({ user: null, loading: false, error: null });
      }
    });
    return unsubscribe;
  },

  // Register with email validation
  register: async (username, email, password) => {

    if (!email.endsWith('@uap-bd.edu')) {
      set({ error: 'Only university email addresses are allowed (@uap-bd.edu)' });
      return false;
    }

    set({ loading: true, error: null });
    try {
     
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the profile
      await updateProfile(user, { displayName: username });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
       
      });

      set({ user, loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  // Login with email and password
  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: userCredential.user, loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  // Logout
  logout: async () => {
    set({ loading: true, error: null });
    try {
      await signOut(auth);
      set({ user: null, loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },

  // Update user profile
  updateUserProfile: async (updates) => {
    const { user } = get();
    if (!user) {
      set({ error: 'User not authenticated' });
      return false;
    }

    set({ loading: true, error: null });
    try {
     
      if (updates.username) {
        await updateProfile(user, { displayName: updates.username });
      }

     
      const userRef = doc(db, 'users', user.uid);
      
      
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

     
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });

      
      const updatedUser = auth.currentUser;
      set({ user: updatedUser, loading: false });
      return true;
    } catch (error) {
      set({ error: error.message, loading: false });
      return false;
    }
  },


  isAuthenticated: () => {
    return !!get().user;
  },

 
  resetError: () => set({ error: null })
}));

export default useAuthStore;