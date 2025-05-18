import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View, TextInput, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  Smile, Droplet, Activity, Thermometer, Settings,
  Search, Phone, Pill, Home, User
} from 'lucide-react-native';
import motivationQuotes from './motivationTalks';

export default function Screen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentQuote, setCurrentQuote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  type TilePath =
    | "/(tabs)/moods"
    | "/(tabs)/fluid"
    | "/(tabs)/weights"
    | "/(tabs)/symptoms"
    | "/(tabs)/contacts"
    | "/medicationToday";

  type Tile = {
    label: string;
    icon: React.ReactNode;
    path: TilePath;
  };

  const allTiles: Tile[] = [
    { label: "Mood Tracking", icon: <Smile size={32} color="white" />, path: "/(tabs)/moods" },
    { label: "Fluid Tracking", icon: <Droplet size={32} color="white" />, path: "/(tabs)/fluid" },
    { label: "Weight Report", icon: <Activity size={32} color="white" />, path: "/(tabs)/weights" },
    { label: "Symptoms", icon: <Thermometer size={32} color="white" />, path: "/(tabs)/symptoms" },
    { label: "Contacts", icon: <Phone size={32} color="white" />, path: "/(tabs)/contacts" },
    { label: "Medication", icon: <Pill size={32} color="white" />, path: "/medicationToday" }
  ];

  const [filteredTiles, setFilteredTiles] = useState(allTiles);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        await db.runAsync(`CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullName TEXT,
          contact TEXT,
          bloodType TEXT,
          email TEXT,
          dob TEXT
        )`);
        const existing = await db.getAllAsync<{ fullName: string }>('SELECT * FROM user_profile LIMIT 1');
        setUserName(existing.length > 0 && existing[0]?.fullName ? existing[0].fullName : "Guest");
      } catch (error) {
        console.error("Failed to fetch user full name:", error);
        setUserName("Guest");
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    const updateQuote = () => {
      const randomIndex = Math.floor(Math.random() * motivationQuotes.length);
      setCurrentQuote(motivationQuotes[randomIndex]);
    };
    updateQuote();
    const intervalId = setInterval(updateQuote, 30000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filtered = allTiles.filter(tile =>
      tile.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTiles(filtered);
  }, [searchTerm]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>Hello, {userName}!</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={22} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/settings")}>
            <Settings size={22} color="#2196F3" />
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor="#999"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      <View style={styles.motivationPanel}>
        <Smile size={24} color="#2196F3" />
        <Text style={styles.motivationText}>{currentQuote}</Text>
      </View>

      <View style={styles.tilesContainer}>
        {filteredTiles.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#555', width: '100%', marginTop: 20 }}>
            No matching feature found.
          </Text>
        ) : (
          filteredTiles.map((tile, index) => (
            <TouchableOpacity
              key={index}
              style={styles.tile}
              onPress={() => router.push(tile.path)}
            >
              {tile.icon}
              <Text style={styles.tileText}>{tile.label}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/(tabs)/home")}>
          <Home size={24} color="white" /><Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/(tabs)/contacts")}>
          <Phone size={24} color="white" /><Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/(tabs)/medications")}>
          <Pill size={24} color="white" /><Text style={styles.navText}>Meds</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.push("/(tabs)/profile")}>
          <User size={24} color="white" /><Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', padding: 16, paddingBottom: 80, paddingTop: "15%" },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  userName: { flex: 1, fontSize: 18, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconButton: { padding: 6 },
  searchBar: {
    height: 40, backgroundColor: 'white', borderRadius: 10,
    paddingHorizontal: 16, fontSize: 14, marginBottom: 16,
    borderColor: '#ddd', borderWidth: 1,
  },
  motivationPanel: {
    backgroundColor: '#e0f2ff', borderRadius: 10, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  motivationText: {
    marginLeft: 12, fontSize: 14, color: '#1e40af', fontWeight: '500',
    flex: 1,
  },
  tilesContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: 12,
  },
  tile: {
    backgroundColor: '#2196F3', width: '48%', padding: 20,
    borderRadius: 12, alignItems: 'center', marginBottom: 12,
  },
  tileText: {
    color: 'white', marginTop: 8, fontSize: 14, textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#2196F3', flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 12, borderTopLeftRadius: 16, borderTopRightRadius: 16,
  },
  navButton: {
    alignItems: 'center',
  },
  navText: {
    color: 'white', fontSize: 12, marginTop: 4,
  }
});
