import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import LoginScreen from "./screens/LoginScreen";
import TasksScreen from "./screens/TasksScreen";
import ChatScreen from "./screens/ChatScreen";
import UserListScreen from "./screens/UserListScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: "#000" },
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Tasks" component={TasksScreen} />
          <Stack.Screen name="UserList" component={UserListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
