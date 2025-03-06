import { create } from 'zustand';
import { db } from '../firebaseConfig';
import { doc, setDoc, collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';

export const useOrderStore = create((set) => ({
  loading: false,
  error: null,

  // Create order function, now with uid
  createOrder: async (orderData, uid, mealName) => {
    set({ loading: true, error: null });
    try {
      const completeOrderData = {
        ...orderData,
        name: mealName,
        orderStatus: 'Pending',
        createdAt: new Date(),
        userId: uid // Include uid in the order data
      };

      const orderRef = await addDoc(collection(db, 'orders'), completeOrderData);
      set({ loading: false });
      return orderRef.id;
    } catch (error) {
      console.error('Error creating order:', error);
      set({ 
        error: error.message || 'An unknown error occurred', 
        loading: false 
      });
      return null;
    }
  },

  // Fetch user orders by username, now with userId
  fetchUserOrders: async (uid) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'orders'), 
        where('userId', '==', uid), // Filter orders by userId
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const userOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      set({ loading: false });
      return userOrders;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      set({ 
        error: error.message || 'An unknown error occurred', 
        loading: false 
      });
      return [];
    }
  },

  // Fetch all orders, unchanged
  fetchAllOrders: async () => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, 'orders'), 
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const allOrders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      set({ loading: false });
      return allOrders;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      set({ 
        error: error.message || 'An unknown error occurred', 
        loading: false 
      });
      return [];
    }
  },

  // Update order status, unchanged
  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      await setDoc(doc(db, 'orders', orderId), 
        { orderStatus: status }, 
        { merge: true }
      );
      set({ loading: false });
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      set({ 
        error: error.message || 'An unknown error occurred', 
        loading: false 
      });
      return false;
    }
  }
}));
