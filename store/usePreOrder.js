import { create } from 'zustand';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const usePreOrderStore = create((set) => ({
  preOrderMeals: [],
  loading: false,
  error: null,

  fetchPreOrderMeals: async () => {
    set({ loading: true, error: null });
    try {
      const preOrderMealsRef = collection(db, 'pre_order_meals');
      const preOrderMealsSnapshot = await getDocs(preOrderMealsRef);
      
      const fetchedPreOrderMeals = preOrderMealsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      set({ 
        preOrderMeals: fetchedPreOrderMeals, 
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching pre-order meals:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        loading: false 
      });
    }
  },

  fetchPreOrderMealById: async (id) => {
    set({ loading: true, error: null });
    try {
      const preOrderMealRef = doc(db, 'pre_order_meals', id);
      const preOrderMealSnapshot = await getDoc(preOrderMealRef);

      if (preOrderMealSnapshot.exists()) {
        const preOrderMeal = {
          id: preOrderMealSnapshot.id,
          ...preOrderMealSnapshot.data()
        };

        set({ loading: false });
        return preOrderMeal;
      } else {
        set({ 
          error: `No pre-order meal found with ID: ${id}`, 
          loading: false 
        });
        return null;
      }
    } catch (error) {
      console.error('Error fetching pre-order meal:', error);
      set({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred', 
        loading: false 
      });
      return null;
    }
  }
}));
