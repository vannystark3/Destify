import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, TextInput, Alert, Button, Image,TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline,PROVIDER_DEFAULT,UrlTile } from 'react-native-maps';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';


interface UserLocation {
  userId: number;
  userName:string;
  latitude: number;
  longitude: number;
}

export default function App() {
  const [user, setUser] = useState<string | null>('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [la, setLatitude] = useState<number | null>(null);
  const [lo, setLongitude] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [route, setRoute] = useState<any[]>([]);
  const [routeErr, setRouteErr] = useState<string | null>(null);
  const [isUserSet, setIsUserSet] = useState<boolean>(false);
  const [locations, setLocations] = useState<UserLocation[]>([]);
  const [userRoutes, setUserRoutes] = useState<any[]>([]); 
  const [distance,setDistance] = useState<number | null>(null);
  const [timetaken,setTimeTaken] = useState<number |null>(null);
  // const IP = ' 172.25.41.218';
  // const pin = ['', 'red', 'blue', 'green', 'orange'];
  const [destination,setDestination] = useState<string | 'Adi'>('Adi');

  const userIcon = require('./1.png'); 
  const usersIcon = require('./users.png'); 

  const updateLocation = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`https://81e3-2401-4900-3b18-46ad-e15f-4fa9-1b8d-77db.ngrok-free.app/putLocation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userID: user,
          latitude,
          longitude,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log('Location updated successfully: UserId: ',user,'\nLatitude: ',latitude,'\nLongitude: ',longitude);
      } else {
        console.error('Failed to update location');
      }
    } catch (error) {
      console.error('Error:', error);
      // console.log('Updating location error');
    }
  };

  const EmergencyAlert=()=>{
    Alert.alert(`User needs help!`);
  }

  const fetchDestinationLocationFromAPI = async () => {
    try {
      const userID = user;
      const response = await axios.get(`https://81e3-2401-4900-3b18-46ad-e15f-4fa9-1b8d-77db.ngrok-free.app/getLocation?userID=${userID}`);
      if (response.data.latitude && response.data.longitude) {
        setLatitude(parseFloat(response.data.latitude));
        setLongitude(parseFloat(response.data.longitude));
        setDestination(response.data.destination);
      } else {
        setApiError('Location not found!');
        // console.log(apiError);
      }
    } catch (error) {
      setApiError('Error fetching!');
      console.error('Location fetching Error:', apiError);
    }
  };

  useEffect(()=>{
    const getUserId = async()=>{
      const storedUserId = await AsyncStorage.getItem("userID");
      setUser(storedUserId);
      // handleUser();
    }
    getUserId(); 
  },[]);

  useEffect(() => {
    if (user !== null && user.trim() !== "") {
      setIsUserSet(true);
      getCurrentLocation();
    } 
  }, [user]);

  const getCurrentLocation = async () => {
    if (Platform.OS === 'android' && !Device.isDevice) {
      setErrorMsg(' Try it on your device!');
      return;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        "Location Permission",
        "Location access is required for tracking. Enable it in settings.",
        [{ text: "OK" }]
      );
      return;
    }
    

    let location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High, 
      timeInterval: 1000, 
      distanceInterval: 0, 
    });
    setLocation(location);
    if (location) {
      // console.log(location);
      updateLocation(location.coords.latitude, location.coords.longitude);
      if(location.coords.latitude==la && location.coords.longitude==lo){
        Alert.alert("Destination reached!");
      }
    }
    fetchDestinationLocationFromAPI();    
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`https://81e3-2401-4900-3b18-46ad-e15f-4fa9-1b8d-77db.ngrok-free.app/getUsers?userID=${user}`);
      const userIds = response.data.users;
      // console.log(userIds);

      const userLocationPromises = userIds.map(async (item: { userId: number }) => {
        try {
          const res = await axios.get(`https://81e3-2401-4900-3b18-46ad-e15f-4fa9-1b8d-77db.ngrok-free.app/getUserLocation?userID=${item.userId}`);
          // console.log(res.data);
          if (res.data.latitude && res.data.longitude) {
            return {
              userId: item.userId,
              userName:res.data.userName,
              latitude: parseFloat(res.data.latitude),
              longitude: parseFloat(res.data.longitude),
            };
          }
        } catch (error) {
          console.error('Error fetching user location:', error);
        }
        return null;
      });

      const locationsData = await Promise.all(userLocationPromises);
      setLocations(locationsData.filter(location => location !== null));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchRouteForUsers = async () => {      
    try {
      const userRoutesPromises = locations.map(async (userLocation) => {
        const response = await axios.get(
          `http://router.project-osrm.org/route/v1/driving/${lo},${la};${userLocation.longitude},${userLocation.latitude}?overview=full&geometries=geojson`
        );
        if (response.data.routes.length > 0) {
          return response.data.routes[0].geometry.coordinates;
        }
        return null;
      });

      const routesData = await Promise.all(userRoutesPromises);
      setUserRoutes(routesData.filter(route => route !== null));
    } catch (error) {
      // console.error('Error fetching routes:', error);
    }
  };


  useEffect(() => {
    if (isUserSet) {
      const intervalId = setInterval(async () => {
        await getCurrentLocation();
        fetchAllUsers(); 
        fetchRouteForUsers(); 
      }, 1000); 
      return () => clearInterval(intervalId);
    }
  }, [isUserSet, location]);

  // useEffect(() => {
  //   if (isUserSet) {
  //     fetchAllUsers();
  //   }
  // }, [isUserSet]);

  useEffect(() => {    
    if (location && la !== null && lo !== null && isUserSet) {
      const getRoute = async () => {  
        try { const response = await axios.get(
            `http://router.project-osrm.org/route/v1/driving/${location.coords.longitude},${location.coords.latitude};${lo},${la}?overview=full&geometries=geojson`
          );
          if (response.data.routes.length > 0) {
            setRoute(response.data.routes[0].geometry.coordinates);  
            const d = response.data.routes[0].legs[0].distance;
            const t = response.data.routes[0].legs[0].duration;
            console.log(parseFloat(t)/60);
            setTimeTaken(parseFloat((t/60+20).toFixed(0)));
            setDistance(parseFloat((d / 1000).toFixed(2)));
            console.log("Helllooooo : ",distance);     
          } else {
            setRouteErr('No route found');
          }
        } catch (error) {
          setRouteErr('Error fetching route');
          console.error(error);  
        }
      };
      getRoute();  
    }
  }, [location, la, lo]);

  let text = 'Waiting...';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = `Your coordinates: \nLatitude: ${location.coords.latitude} \nLongitude: ${location.coords.longitude}`;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <TextInput
        placeholder='Search Destination'
        style={styles.searchBox}
        autoCapitalize='none'
       /> */}
      {location && isUserSet ? (
        <MapView
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_DEFAULT}
          customMapStyle={darkMapStyle}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {/* Main user marker with custom icon */}
          <Marker
            coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }}
            title="Your location"
          >
            <Image
              source={userIcon}
              style={{width:35,height:35}}
            />
          </Marker>

          {la !== null && lo !== null && (
            <Marker coordinate={{ latitude: la, longitude: lo }} title="IIT PATNA" />
          )}

          {locations.map((userLocation) => (
            <Marker
              key={userLocation.userId}
              coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
              title={`${userLocation.userName}`}
              >
              <Image
              source={usersIcon}
              style={{width:35,height:35}}
            />
              </Marker>
          
          ))}

          {/* Yellow polylines: Current location to each other user's location */}
          {userRoutes.map((userRoute, index) => (
            <Polyline
              key={index}
              coordinates={userRoute.map((coord: any) => ({
                latitude: coord[1],
                longitude: coord[0],
              }))}
              strokeColor="yellow"
              strokeWidth={4}
              geodesic={true}
            />
          ))}

          {/* Blue polyline: Current location to destination */}
          {route.length > 0 && (
            <Polyline
              coordinates={route.map((coord) => ({
                latitude: coord[1],
                longitude: coord[0],
              }))}
              strokeColor="blue"
              strokeWidth={4}
              geodesic={true}
            />
          )}
          
        </MapView>
      ) : (
        <Text>Loading map...</Text>
      )}
        <TouchableOpacity
        style={styles.alert}
        onPress={EmergencyAlert}
        activeOpacity={0.8}
      >
        <Text style={styles.alertText}>!</Text>
      </TouchableOpacity>
       {/* Overlay */}
       {la && lo ?(
        <>
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>Destination ➡ {destination}</Text>
          </View>
          <View style={styles.overlayBottom}>
            <Text style={styles.overlayBottomText}>Distance : {distance} KM</Text>
            <Text style={styles.overlayBottomText}>ETA :5 min</Text>
          </View>
        </>
       ):(
        <View style={styles.overlay2}>
          <Text style={styles.overlayText}>UserId not set</Text>
        </View>
       )}
      
      {/* <Text style={styles.paragraph}>{text}</Text> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 20,
    width:'85%',
    left: '45%',
    transform: [{ translateX: -100 }],
    backgroundColor: '#BB86FC',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  overlay2:{
    display:'none',
  },
  overlayText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 15,
    width:'105%',
    height:'10%',
    left: '35%',
    transform: [{ translateX: -100 }],
    backgroundColor: '#BB86FC',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  overlayBottomText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
  },
  searchBox:{
    width:'110%',
    paddingHorizontal:20,
    paddingVertical:10,
    borderColor:"#ccc",
    borderWidth:1,
    borderRadius:1,
  },
  map: {
    width: '115%',
    height: '100%',
  },
  input: {
    width: '100%',
    height: '20%',
    backgroundColor: 'white',
  },
  alert:{
    backgroundColor: '#ff1744',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,  
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, 
    left:'45%',
    top:'30%',
  },
  alertText:{
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  }
});
const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1B1B1B' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#FFFFFF' }] }, // Brighter text
  { elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] }, // Darker stroke for clarity
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#444444' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#2A2A2A' }] }, // More contrast for POIs
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#4E4E4E' }] }, // Brightened roads
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#7F7F7F' }] }, // Highways more visible
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#636363' }] }, // Arterial roads pop out
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0D47A1' }] }, // Deep blue for water
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: 'black' }] }, // Contrast for landscape
];
