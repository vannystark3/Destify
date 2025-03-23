import { StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import React, { useState } from "react";

const places = [
  { id: "1", name: "Taj Mahal, Agra" },
  { id: "2", name: "Jaipur, Rajasthan" },
  { id: "3", name: "Goa Beaches" },
  { id: "4", name: "Varanasi, Uttar Pradesh" },
  { id: "5", name: "Leh Ladakh" },
  { id: "6", name: "Shimla, Himachal Pradesh" },
  { id: "7", name: "Mysore Palace, Karnataka" },
  { id: "8", name: "Rann of Kutch, Gujarat" },
  { id: "9", name: "Andaman and Nicobar Islands" },
  { id: "10", name: "Rishikesh, Uttarakhand" },
];

export default function TabTwoScreen() {
  const [selectedPlace, setSelectedPlace] = useState(null);

  // const handlePlaceSelected = (data, details = null) => {
  //   setSelectedPlace(details);
  //   console.log(data);
  // };

  return (
    <View style={styles.container}>
      {/* <GooglePlacesAutocomplete
        placeholder="Search for a place"
        minLength={2}
        onPress={handlePlaceSelected}
        fetchDetails={true}
        query={{
          key: "YOUR_GOOGLE_MAPS_API_KEY",
          language: "en",
        }}
        styles={{
          textInput: styles.input,
          listView: styles.listView,
        }}
      /> */}

      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Text style={styles.placeName}>{item.name}</Text>
            <Ionicons name="ellipsis-vertical" size={24} color="#E94560" style={styles.icon} />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: "#1E1E1E",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
  },
  listView: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    marginTop: 5,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 15,
    padding: 15,
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 7,
  },
  placeName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    marginLeft: "auto",
  },
  listContainer: {
    paddingBottom: 20,
  },
});
