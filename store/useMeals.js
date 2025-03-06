import { create } from 'zustand';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const useMealsStore = create((set) => ({
  meals: [],
  loading: false,
  error: null,

  fetchMeals: async () => {
    
    set({ loading: true, error: null });

    try {
      if (!db) {
        console.error('Firebase database instance is undefined');
        set({ error: 'Database connection error', loading: false });
        return;
      }

      const mealsRef = collection(db, 'meals');
    //   console.log('Fetching meals from collection:', mealsRef.path);

      const mealsSnapshot = await getDocs(mealsRef);

      if (mealsSnapshot.empty) {
        console.warn('No meals found in the database');
      }

      const fetchedMeals = mealsSnapshot.docs.map((doc) => {
        // console.log(`Meal ID: ${doc.id}, Data:`, doc.data());
        return {
          id: doc.id,
          ...doc.data(),
        };
      });

      set({ meals: fetchedMeals, loading: false });
    //   console.log('Meals fetched successfully:', fetchedMeals);
    } catch (error) {
      console.error('Error fetching meals:', error);
      set({ error: error.message || 'An unknown error occurred', loading: false });
    }
  },

  fetchMealById: async (id) => {
    // console.log(`Fetching meal by ID: ${id}`);
    set({ loading: true, error: null });

    try {
      if (!db) {
        console.error('Firebase database instance is undefined');
        set({ error: 'Database connection error', loading: false });
        return null;
      }

      const mealRef = doc(db, 'meals', id);
    //   console.log('Fetching meal from document:', mealRef.path);

      const mealSnapshot = await getDoc(mealRef);

      if (mealSnapshot.exists()) {
        const meal = {
          id: mealSnapshot.id,
          ...mealSnapshot.data(),
        };

        // console.log('Meal fetched successfully:', meal);
        set({ loading: false });
        return meal;
      } else {
        console.warn(`No meal found with ID: ${id}`);
        set({ error: `No meal found with ID: ${id}`, loading: false });
        return null;
      }
    } catch (error) {
      console.error('Error fetching meal:', error);
      set({ error: error.message || 'An unknown error occurred', loading: false });
      return null;
    }
  },
}));
