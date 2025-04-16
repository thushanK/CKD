// import { View, Text, StyleSheet } from "react-native";
// import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

const GITHUB_AVATAR_URI = "https://i.pinimg.com/originals/ef/a2/8d/efa28d18a04e7fa40ed49eeb0ab660db.jpg";

// export default function Tab() {
// 	return (
// 		<View style={styles.container}>
// 			<Avatar alt="Zach Nugent's Avatar">
// 				<AvatarImage source={{ uri: GITHUB_AVATAR_URI }} />
// 				<AvatarFallback>
// 					<Text>ZN</Text>
// 				</AvatarFallback>
// 			</Avatar>
// 		</View>
// 	);
// }

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		justifyContent: "center",
// 		alignItems: "center",
// 		backgroundColor: "white",
// 	},
// });
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { Home, Smile, Droplet, Activity, Thermometer, Settings, Search, Calendar, MoreHorizontal } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from "expo-router";

const HomePage: React.FC = () => {
  const userName = 'John Doe';
  const profilePicUrl = GITHUB_AVATAR_URI;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Link href="/(tabs)/profile" asChild>
          <TouchableOpacity>
            <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
          </TouchableOpacity>
        </Link>

        <Text style={styles.userName}>Hello, {userName}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Search size={22} color="#4f46e5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Settings size={22} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search..."
        placeholderTextColor="#999"
      />

      <View style={styles.motivationPanel}>
        <Smile size={28} color="#4f46e5" />
        <Text style={styles.motivationText}>"Stay strong, your health journey is worth it!"</Text>
      </View>

      <View style={styles.tilesContainer}>
      <Link href="/(tabs)/moodTracker" asChild>
        <TouchableOpacity style={styles.tile}>
          <Smile size={32} color="white" />
          <Text style={styles.tileText}>Mood Tracking</Text>
        </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/fluidTracker" asChild>
          <TouchableOpacity style={styles.tile}>
            <Droplet size={32} color="white" />
            <Text style={styles.tileText}>Fluid Tracking</Text>
          </TouchableOpacity>
        </Link>

        {/* <Link href="/(tabs)/fluids/index" asChild> */}
        <TouchableOpacity style={styles.tile}>
          <Activity size={32} color="white" />
          <Text style={styles.tileText}>Weight Report</Text>
        </TouchableOpacity>
      {/* </Link> */}
        <TouchableOpacity style={styles.tile}>
          <Thermometer size={32} color="white" />
          <Text style={styles.tileText}>Symptoms</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNavFull}>
        <TouchableOpacity>
          <Home size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Search size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <MoreHorizontal size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Calendar size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  searchBar: {
    height: 40,
    backgroundColor: 'white',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  motivationPanel: {
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  motivationText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '500',
  },
  tilesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  tile: {
    backgroundColor: '#4f46e5',
    width: '48%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  tileText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  bottomNavFull: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#4f46e5',
    borderRadius: 30,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default HomePage;