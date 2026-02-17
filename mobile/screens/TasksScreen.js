import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import api from "../api";
import * as SecureStore from "expo-secure-store";

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndTasks();
  }, []);

  const loadUserAndTasks = async () => {
    try {
      const userData = await SecureStore.getItemAsync("user");
      console.log(userData, "userData");
      if (userData) setUser(JSON.parse(userData));

      const res = await api.get("/tasks");
    
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error(error,'------------------------------');
      // If auth error, redirect to login
      if (error.response?.status === 401) {
        navigation.replace("Login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    navigation.replace("Login");
  };

  const renderTask = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.taskTitle}>{item.title}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === "done"
              ? styles.statusDone
              : item.status === "in-progress"
                ? styles.statusProgress
                : styles.statusTodo,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === "done"
                ? styles.textDone
                : item.status === "in-progress"
                  ? styles.textProgress
                  : styles.textTodo,
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.projectName}>{item.project?.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.dueDate}>
          Due: {new Date(item.dueDate).toLocaleDateString()}
        </Text>
        <Text
          style={[
            styles.priority,
            item.priority === "high"
              ? styles.priorityHigh
              : item.priority === "medium"
                ? styles.priorityMedium
                : styles.priorityLow,
          ]}
        >
          {item.priority}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name}</Text>
          <Text style={styles.subtext}>Here are your assigned tasks</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No tasks assigned yet.</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#111",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  subtext: {
    color: "#888",
    marginTop: 4,
  },
  logoutText: {
    color: "#ff4444",
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
    marginRight: 8,
  },
  projectName: {
    color: "#2563EB",
    fontSize: 14,
    marginBottom: 8,
  },
  description: {
    color: "#ccc",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
    paddingTop: 12,
  },
  dueDate: {
    color: "#888",
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusDone: {
    borderColor: "#00C851",
    backgroundColor: "rgba(0, 200, 81, 0.1)",
  },
  statusProgress: {
    borderColor: "#33b5e5",
    backgroundColor: "rgba(51, 181, 229, 0.1)",
  },
  statusTodo: {
    borderColor: "#888",
    backgroundColor: "rgba(136, 136, 136, 0.1)",
  },
  statusText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  textDone: { color: "#00C851" },
  textProgress: { color: "#33b5e5" },
  textTodo: { color: "#888" },
  priority: { fontSize: 12, fontWeight: "bold", textTransform: "uppercase" },
  priorityHigh: { color: "#ff4444" },
  priorityMedium: { color: "#ffbb33" },
  priorityLow: { color: "#2563EB" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
});
