import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import useAuthStore from '../../../store/useAuthStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { format } from 'date-fns';

export default function OrderHistory() {
    const { user } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilter, setSelectedFilter] = useState('All');

    useEffect(() => {
        if (!user) return;
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);
            const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setOrders(userOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 border-amber-300';
            case 'Completed': return 'bg-green-100 border-green-300';
            case 'Cancelled': return 'bg-red-100 border-red-300';
            default: return 'bg-gray-100 border-gray-300';
        }
    };

    const filterOptions = ['All', 'Pending', 'Completed', 'Cancelled'];

    const filteredOrders = selectedFilter === 'All' 
        ? orders 
        : orders.filter(order => order.orderStatus === selectedFilter);

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#6200ee" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Filter Section */}
            <View className="flex-row justify-center my-4 space-x-2">
                {filterOptions.map((filter) => (
                    <TouchableOpacity
                        key={filter}
                        onPress={() => setSelectedFilter(filter)}
                        className={`px-4 py-2 rounded-full ${
                            selectedFilter === filter 
                                ? 'bg-blue-600' 
                                : 'bg-gray-200'
                        }`}
                    >
                        <Text className={`${
                            selectedFilter === filter 
                                ? 'text-white' 
                                : 'text-gray-700'
                        } font-semibold`}>
                            {filter}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Empty State */}
            {filteredOrders.length === 0 ? (
                <View className="flex-1 items-center justify-center p-6">
                    <MaterialIcons name="shopping-basket" size={80} color="#6200ee" />
                    <Text className="text-xl text-gray-600 mt-4 text-center">
                        No {selectedFilter === 'All' ? '' : selectedFilter.toLowerCase()} orders found
                    </Text>
                    <Text className="text-gray-400 mt-2 text-center">
                        Your recent orders will appear here
                    </Text>
                </View>
            ) : (
                <ScrollView 
                    className="px-4"
                    showsVerticalScrollIndicator={false}
                >
                    {filteredOrders.map((order) => (
                        <View 
                            key={order.id} 
                            className="bg-white rounded-xl shadow-md mb-4 overflow-hidden border-l-4"
                            style={{
                                borderLeftColor: 
                                    order.orderStatus === 'Pending' ? '#fbbf24' :
                                    order.orderStatus === 'Completed' ? '#10b981' :
                                    order.orderStatus === 'Cancelled' ? '#ef4444' : 
                                    '#6b7280'
                            }}
                        >
                            <View className="p-4">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-xl font-bold text-gray-800">
                                        {order.name || 'Meal Order'}
                                    </Text>
                                    <View 
                                        className={`px-3 py-1 rounded-full border ${getStatusColor(order.orderStatus)}`}
                                    >
                                        <Text className={`font-semibold ${
                                            order.orderStatus === 'Pending' ? 'text-amber-600' :
                                            order.orderStatus === 'Completed' ? 'text-green-600' :
                                            order.orderStatus === 'Cancelled' ? 'text-red-600' : 
                                            'text-gray-600'
                                        }`}>
                                            {order.orderStatus}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center">
                                    <View>
                                        <Text className="text-gray-600">
                                            Quantity: {order.quantity}
                                        </Text>
                                        <Text className="text-gray-600 font-semibold">
                                            Total: ৳{order.totalPrice.toFixed(2)}
                                        </Text>
                                        <Text className="text-gray-400 text-sm">
                                            {order.createdAt
                                                ? format(
                                                    order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt),
                                                    'dd MMM yyyy, hh:mm a'
                                                )
                                                : 'Unknown Date'}
                                        </Text>
                                    </View>
                                    <MaterialIcons 
                                        name={
                                            order.orderStatus === 'Pending' ? 'hourglass-empty' :
                                            order.orderStatus === 'Completed' ? 'check-circle' :
                                            order.orderStatus === 'Cancelled' ? 'cancel' :
                                            'help-outline'
                                        } 
                                        size={32} 
                                        color={
                                            order.orderStatus === 'Pending' ? '#f59e0b' :
                                            order.orderStatus === 'Completed' ? '#10b981' :
                                            order.orderStatus === 'Cancelled' ? '#ef4444' : 
                                            '#6b7280'
                                        } 
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
            <View className="mb-12" />
              <Text className="text-center font-bold text-red-400 text-sm mb-12"> 
                 Orders are delivered within 30 minutes of placing the order
              </Text>
        </View>
    );
}