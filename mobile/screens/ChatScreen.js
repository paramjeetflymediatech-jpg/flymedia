import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { io } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import api from "../api";

const BASE_URL = "http://10.0.2.2:5000";

const ChatScreen = ({ route, navigation }) => {
  const { receiverId, receiverName } = route.params;
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await api.get("/auth/me");
        const userData = res.data.data;
        setUser(userData);

        const msgRes = await api.get(`/messages/${receiverId}`);
        setMessages(msgRes.data.data);

        socketRef.current = io(BASE_URL, {
          transports: ["websocket"],
        });

        socketRef.current.on("connect", () => {
          socketRef.current.emit("join", userData._id);
        });

        socketRef.current.on("newMessage", (newMsg) => {
          if (newMsg.senderId === receiverId || newMsg.receiverId === receiverId) {
            setMessages((prev) => [...prev, newMsg]);
          }
        });

      } catch (err) {
        console.error("Error initializing chat:", err);
      } finally {
        setLoading(false);
      }
    };

    initChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [receiverId]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() && !selectedImage) return;

    try {
      const formData = new FormData();
      if (message.trim()) formData.append("message", message.trim());
      
      if (selectedImage) {
        const uri = selectedImage.uri;
        const name = uri.split("/").pop();
        const match = /\.(\w+)$/.exec(name);
        const type = match ? `image/${match[1]}` : `image`;
        
        formData.append("files", {
          uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
          name,
          type,
        });
      }

      const res = await api.post(`/messages/send/${receiverId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setMessage("");
        setSelectedImage(null);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.senderId === user?._id;
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        {item.message ? (
          <Text style={isMe ? styles.myMessageText : styles.theirMessageText}>
            {item.message}
          </Text>
        ) : null}
        
        {item.attachments && item.attachments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {item.attachments.map((file, idx) => (
              <View key={idx} style={styles.attachment}>
                {file.fileType.startsWith("image/") ? (
                  <Image
                    source={{ uri: `${BASE_URL}${file.url}`.replace("localhost", "10.0.2.2") }}
                    style={styles.attachedImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.fileAttachment}>
                    <Text style={isMe ? styles.myMessageText : styles.theirMessageText}>
                      📄 {file.name}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <Text style={[styles.timeText, isMe ? styles.myTimeText : styles.theirTimeText]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{receiverName}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {selectedImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          <TouchableOpacity style={styles.removeImage} onPress={() => setSelectedImage(null)}>
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
          <Text style={styles.attachButtonText}>⊕</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  backButton: {
    color: "#007bff",
    fontSize: 16,
  },
  listContent: {
    padding: 20,
  },
  messageContainer: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007bff",
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 2,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#333",
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
  },
  myTimeText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  theirTimeText: {
    color: "#999",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    color: "#333",
  },
  sendButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  attachButton: {
    padding: 8,
    marginRight: 5,
  },
  attachButtonText: {
    fontSize: 24,
    color: "#007bff",
  },
  previewContainer: {
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  removeImage: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#fff",
    fontSize: 12,
  },
  attachmentsContainer: {
    marginTop: 5,
  },
  attachedImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
});

export default ChatScreen;
