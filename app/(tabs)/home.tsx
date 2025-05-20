import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View, TextInput, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";

// import motivationQuotes from './motivationTalks';
import { Feather } from '@expo/vector-icons';
export default function Screen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [currentQuote, setCurrentQuote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  type TilePath =
    | "/mood"
    | "/fluid"
    | "/weight"
    | "/symptom"
    | "/contact"
    | "/medicationToday";

  type Tile = {
    label: string;
    icon: React.ReactNode;
    path: TilePath;
  };

  const allTiles: Tile[] = [
    { label: "Mood Tracking", icon: <Feather name="smile" size={32} color="white" />, path: "/mood" },
    { label: "Fluid Tracking", icon: <Feather name="droplet" size={32} color="white" />, path: "/fluid" },
    { label: "Weight Report", icon: <Feather name="activity" size={32} color="white" />, path: "/weight" },
    { label: "Symptoms", icon: <Feather name="thermometer" size={32} color="white" />, path: "/symptom" },
    { label: "Contacts", icon: <Feather name="phone" size={32} color="white" />, path: "/contact" },
    { label: "Medication", icon: <Feather name="box" size={32} color="white" />, path: "/medicationToday" } // No "pill" icon; "box" is a close substitute
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
            <Feather name="search" size={22} color="#2196F3" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/settings")}>
            <Feather name="settings" size={22} color="#2196F3" />
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
        <Feather name="smile" size={24} color="#2196F3" />
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
        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/home")}>
          <Feather name="home" size={24} color="white" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/contact")}>
          <Feather name="phone" size={24} color="white" />
          <Text style={styles.navText}>Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/medicationToday")}>
          <Feather name="activity" size={24} color="white" />
          <Text style={styles.navText}>Meds</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/profile")}>
          <Feather name="user" size={24} color="white" />
          <Text style={styles.navText}>Profile</Text>
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


const motivationQuotes = [
  "Believe in yourself and all that you are.",
  "Push yourself, because no one else is going to do it for you.",
  "Small changes make a big difference.",
  "Your only limit is your mind.",
  "Progress, not perfection.",
  "Don’t give up. Great things take time.",
  "Every step forward matters.",
  "Stay positive, work hard, make it happen.",
  "Success doesn’t come from what you do occasionally, it comes from what you do consistently.",
  "Doubt kills more dreams than failure ever will.",
  "Act as if what you do makes a difference. It does.",
  "Start where you are. Use what you have. Do what you can.",
  "Don’t watch the clock; do what it does. Keep going.",
  "The harder you work for something, the greater you’ll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "It’s going to be hard, but hard does not mean impossible.",
  "Don’t stop when you’re tired. Stop when you’re done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Little things make big days.",
  "It always seems impossible until it’s done.",
  "Push through the pain. You’re stronger than you think.",
  "Success is what comes after you stop making excuses.",
  "Believe you can and you’re halfway there.",
  "You don’t have to be great to start, but you have to start to be great.",
  "The key to success is to focus on goals, not obstacles.",
  "Difficult roads often lead to beautiful destinations.",
  "Work hard in silence. Let your success be your noise.",
  "Great things never come from comfort zones.",
  "Be proud of how far you’ve come.",
  "Start each day with a grateful heart.",
  "Hustle in silence and let your success make the noise.",
  "You’re closer than you were yesterday.",
  "Make today so awesome yesterday gets jealous.",
  "Turn your wounds into wisdom.",
  "Every accomplishment starts with the decision to try.",
  "Stay humble. Work hard. Be kind.",
  "If you’re going through hell, keep going.",
  "The only way to do great work is to love what you do.",
  "Push yourself to be your best self.",
  "Be stronger than your excuses.",
  "The future depends on what you do today.",
  "Focus on being productive instead of busy.",
  "Create a life you can’t wait to wake up to.",
  "Don’t let yesterday take up too much of today.",
  "Discipline is doing what needs to be done, even if you don’t want to do it.",
  "Train your mind to see the good in every situation.",
  "Success isn’t always about greatness. It’s about consistency.",
  "You were born to be real, not perfect.",
  "Do something today that your future self will thank you for.",
  "A little progress each day adds up to big results.",
  "Your goals don’t care how you feel.",
  "Stay focused and never give up.",
  "Keep your eyes on the stars and your feet on the ground.",
  "Focus on the step in front of you, not the whole staircase.",
  "Believe in your infinite potential.",
  "It’s never too late to be what you might have been.",
  "The best way out is always through.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Start small. Think big.",
  "One day or day one. You decide.",
  "When you feel like quitting, think about why you started.",
  "Be the energy you want to attract.",
  "Strength doesn’t come from what you can do. It comes from overcoming the things you thought you couldn’t.",
  "Keep going. Everything you need will come to you.",
  "Every day is a second chance.",
  "You have to fight through some bad days to earn the best days.",
  "Keep your face always toward the sunshine—and shadows will fall behind you.",
  "Growth is growth, no matter how small.",
  "Don’t be afraid to start over. It’s a chance to build something better.",
  "If it doesn’t challenge you, it won’t change you.",
  "Don’t limit your challenges. Challenge your limits.",
  "Life is tough, but so are you.",
  "You are enough just as you are.",
  "Fall seven times, stand up eight.",
  "Consistency is more important than perfection.",
  "Take the risk or lose the chance.",
  "Every next level of your life will demand a different you.",
  "It’s not about having time. It’s about making time.",
  "You don’t get what you wish for. You get what you work for.",
  "Stay patient and trust your journey.",
  "The comeback is always stronger than the setback.",
  "Breathe. You’re going to make it.",
  "Work for it more than you hope for it.",
  "It’s okay to rest. Just don’t quit.",
  "Strive for progress, not perfection.",
  "There’s no elevator to success. You have to take the stairs.",
  "A winner is just a loser who tried one more time.",
  "Stay strong. The weekend is coming.",
  "Let your hustle be louder than your voice.",
  "One small positive thought can change your whole day.",
  "Today’s struggle is tomorrow’s strength.",
  "Think big. Trust yourself. Make it happen.",
  "Start with one step, just one.",
  "Stars can’t shine without darkness.",
  "Nothing worth having comes easy.",
  "Let your dreams be bigger than your fears.",
  "You are doing better than you think.",
  "Courage doesn’t always roar. Sometimes it’s the quiet voice at the end of the day saying, ‘I will try again tomorrow.’",
];

