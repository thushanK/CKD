import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { useEffect, useState } from "react";
import { useSQLiteContext } from "expo-sqlite";
import * as Clipboard from "expo-clipboard";
import {
  Phone,
  PlusCircle,
  Trash2,
  Pencil,
  Smile, Droplet, Activity, Thermometer, Settings,
	Search,  Pill, Home, User
} from "lucide-react-native";

import { useRouter } from "expo-router"; // <-- Add this for navigation



export default function ContactsScreen() {
  const db = useSQLiteContext();
  const [name, setName] = useState("");
    const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [selectedColor, setSelectedColor] = useState("#2196F3");
  const [contacts, setContacts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewingContact, setViewingContact] = useState<any | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const colorOptions = [
    "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5",
    "#2196F3", "#009688", "#4CAF50", "#FF9800", "#795548",
  ];

  useEffect(() => {
    (async () => {
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS contacts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          phone TEXT,
          type TEXT,
          color TEXT
        )`
      );
      fetchContacts();
    })();
  }, []);

  const fetchContacts = async () => {
    const result = await db.getAllAsync("SELECT * FROM contacts");
    setContacts(result);
  };

  const saveContact = async () => {
    if (!name || !email || !phone || !type) {
      Alert.alert("Missing Fields", "Please fill all fields.");
      return;
    }
    try {
      if (editingId !== null) {
        await db.runAsync(
          "UPDATE contacts SET name = ?, email = ?, phone = ?, type = ?, color = ? WHERE id = ?",
          [name, email, phone, type, selectedColor, editingId]
        );
      } else {
        await db.runAsync(
          "INSERT INTO contacts (name, email, phone, type, color) VALUES (?, ?, ?, ?, ?)",
          [name, email, phone, type, selectedColor]
        );
      }
      resetForm();
      fetchContacts();
    } catch (err) {
      console.log("Save contact error:", err);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setType("");
    setSelectedColor("#2196F3");
    setEditingId(null);
    setModalVisible(false);
  };

  const confirmDelete = (id: number) => {
    Alert.alert("Delete Contact", "Are you sure you want to delete this contact?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await db.runAsync("DELETE FROM contacts WHERE id = ?", [id]);
          setViewModalVisible(false); // Close view modal
          fetchContacts();
        },
      },
    ]);
  };

  const startEditing = (item: any) => {
    setName(item.name);
    setEmail(item.email);
    setPhone(item.phone);
    setType(item.type);
    setSelectedColor(item.color || "#2196F3");
    setEditingId(item.id);
    setModalVisible(true);
    setViewModalVisible(false);
  };

  const openContactView = (item: any) => {
    setViewingContact(item);
    setViewModalVisible(true);
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setStringAsync(text);
    Alert.alert("Copied", `"${text}" copied to clipboard.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Contact Manager</Text>
      {contacts.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>No contacts found.</Text>
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openContactView(item)} style={styles.contactItem}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: item.color || "#2196F3",
                  }}
                />
                <View>
                  <Text style={styles.contactText}>{item.name}</Text>
                  <Text style={styles.contactPhone}>Email: {item.email}</Text>
                  <Text style={styles.contactPhone}>Phone: {item.phone}</Text>
                  <Text style={styles.contactPhone}>Type: {item.type}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => makeCall(item.phone)}>
                <Phone size={22} color="#2196F3" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <PlusCircle size={28} color="#2196F3" />
        <Text style={styles.addButtonText}>Add Contact</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={resetForm}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingId !== null ? "Edit Contact" : "Add Contact"}</Text>
            <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextInput style={styles.input} placeholder="Type (e.g. Front Desk)" value={type} onChangeText={setType} />
            <Text style={{ fontWeight: "bold", marginVertical: 10 }}>Select Color:</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {colorOptions.map((color) => (
                <TouchableOpacity key={color} onPress={() => setSelectedColor(color)}>
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      backgroundColor: color,
                      borderWidth: selectedColor === color ? 2 : 1,
                      borderColor: selectedColor === color ? "#000" : "#ccc",
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={saveContact}>
              <Text style={styles.addButtonText}>{editingId !== null ? "Update" : "Save"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetForm}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* View Modal */}
      <Modal animationType="fade" transparent={true} visible={viewModalVisible} onRequestClose={() => setViewModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Contact Details</Text>
            {viewingContact && (
              <>
                <View style={{ alignItems: "center", marginBottom: 16 }}>
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 25,
                      backgroundColor: viewingContact.color || "#2196F3",
                      marginBottom: 10,
                    }}
                  />
                  <Text style={styles.contactText}>{viewingContact.name}</Text>
                </View>
                <Text style={styles.contactPhone}>Email: {viewingContact.email}</Text>
                <TouchableOpacity onPress={() => copyToClipboard(viewingContact.email)}>
                  <Text style={styles.addButtonText}>Copy Email</Text>
                </TouchableOpacity>
                <Text style={styles.contactPhone}>Phone: {viewingContact.phone}</Text>
                <TouchableOpacity onPress={() => copyToClipboard(viewingContact.phone)}>
                  <Text style={styles.addButtonText}>Copy Phone</Text>
                </TouchableOpacity>
                <Text style={styles.contactPhone}>Type: {viewingContact.type}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
                  <TouchableOpacity onPress={() => startEditing(viewingContact)}>
                    <Pencil size={22} color="green" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(viewingContact.id)}>
                    <Trash2 size={22} color="red" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setViewModalVisible(false)}>
                  <Text style={styles.cancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
      <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/home")}>
                  <Home size={24} color="white" /><Text style={styles.navText}>Home</Text></TouchableOpacity>
        
                <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/contacts")}>
                  <Phone size={24} color="white" /><Text style={styles.navText}>Contact</Text></TouchableOpacity>
        
                <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/medications")}>
                  <Pill size={24} color="white" /><Text style={styles.navText}>Meds</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navButton} onPress={() => router.replace("/(tabs)/profile")}>
                  <User size={24} color="white" /><Text style={styles.navText}>Profile</Text></TouchableOpacity>
               </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "10%",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2196F3",
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: "12%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  addButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "600",
  },
  contactItem: {
    backgroundColor: "#f1f8ff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contactPhone: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: "#2196F3",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  cancelText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
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
