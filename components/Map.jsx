import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import Mapbox, { MapView, Camera, MarkerView, LocationPuck, ShapeSource, SymbolLayer } from '@rnmapbox/maps';
import * as Location from 'expo-location';

// Component accepts routes, buses, and stops as props
const BusMap = ({ routes = [], buses = [], stops = [], accessToken, mapHeight = 300 }) => {
  // Set Mapbox access token
  Mapbox.setAccessToken(accessToken);

  // State variables
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStop, setSelectedStop] = useState(null);
  
  // Map reference
  const mapRef = useRef(null);
  
  // Default center position (fallback if location permission is denied)
  const defaultCenter = [90.3843, 23.7785]; // Center of Dhaka

  // Fetch user's current location on component mount
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }
        
        // Get current location
        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setLocation(userLocation);
      } catch (error) {
        setErrorMsg('Could not get location: ' + error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Format buses data for the map's ShapeSource
  const getBusesGeoJson = () => {
    if (!buses || buses.length === 0) return { type: 'FeatureCollection', features: [] };
    
    return {
      type: 'FeatureCollection',
      features: buses.map(bus => ({
        type: 'Feature',
        id: bus.bus_no,
        properties: {
          id: bus.bus_no,
          title: bus.bus_no,
          description: `Driver: ${bus.driver_name}`,
          icon: 'bus',
        },
        geometry: {
          type: 'Point',
          coordinates: [bus.current_location.long, bus.current_location.lat]
        }
      }))
    };
  };

  // Format stops data for the map's ShapeSource
  const getStopsGeoJson = () => {
    if (!stops || stops.length === 0) return { type: 'FeatureCollection', features: [] };
    
    return {
      type: 'FeatureCollection',
      features: stops.map((stop, index) => ({
        type: 'Feature',
        id: `stop-${index}`,
        properties: {
          id: `stop-${index}`,
          title: stop.name,
          icon: 'bus-stop',
        },
        geometry: {
          type: 'Point',
          coordinates: [stop.long, stop.lat]
        }
      }))
    };
  };

  // Get center coordinates for the map
  const getMapCenter = () => {
    if (location) {
      return [location.coords.longitude, location.coords.latitude];
    }
    
    // If no user location, center on the first stop
    if (stops && stops.length > 0) {
      return [stops[0].long, stops[0].lat];
    }
    
    // Default center if no stops or location
    return defaultCenter;
  };

  // Show loading indicator
  if (loading) {
    return (
      <View style={[styles.container, { height: mapHeight }]}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Show error message if any
  if (errorMsg) {
    return (
      <View style={[styles.container, { height: mapHeight }]}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: mapHeight }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        onPress={() => setSelectedStop(null)} 
      >
        <Camera
          zoomLevel={12}
          centerCoordinate={getMapCenter()}
          animationDuration={1000}
        />
        
        {/* User location */}
        {location && (
          <LocationPuck
            visible={true}
            pulsing={{ isEnabled: true }}
          />
        )}
        
        {/* Bus stops */}
        <ShapeSource id="stopsSource" shape={getStopsGeoJson()}>
          <SymbolLayer
            id="stopsLayer"
            style={{
              iconImage: 'marker-15',
              iconSize: 1.5,
              iconAllowOverlap: true,
              textField: ['get', 'title'],
              textSize: 12,
              textOffset: [0, 1.5],
              textAnchor: 'top',
              textColor: '#000000',
              textHaloColor: '#FFFFFF',
              textHaloWidth: 1,
            }}
            onPress={e => {
              setSelectedStop(e.features[0].properties);
            }}
          />
        </ShapeSource>
        
        {/* Buses */}
        <ShapeSource id="busesSource" shape={getBusesGeoJson()}>
          <SymbolLayer
            id="busesLayer"
            style={{
              iconImage: 'bus-15',
              iconSize: 1.8,
              iconAllowOverlap: true,
              textField: ['get', 'title'],
              textSize: 12,
              textOffset: [0, 1.5],
              textAnchor: 'top',
              textColor: '#0066FF',
              textHaloColor: '#FFFFFF',
              textHaloWidth: 1,
            }}
          />
        </ShapeSource>
      </MapView>
      
      {/* Selected stop info */}
      {selectedStop && (
        <View style={styles.stopInfo}>
          <Text style={styles.stopTitle}>{selectedStop.title}</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setSelectedStop(null)}
          >
            <Text>×</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  stopInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    height: 24,
    width: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
});

export default BusMap;