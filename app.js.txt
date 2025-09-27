import React from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider } from './components/AuthContext';
import LoginScreen from './screens/LoginScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import { useStreak } from './components/useStreak';
import { View, Text } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { streak, updateStreak } = useStreak();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconText = '';
          if (route.name === 'Dashboard') iconText = '🏠';
          else if (route.name === 'Chat') iconText = '💬';
          else if (route.name === 'Profile') iconText = '👤';
          return <Text style={{ fontSize: 24, color: focused ? '#FFD700' : '#A9A9A9' }}>{iconText}</Text>;
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#A9A9A9',
        tabBarStyle: { backgroundColor: '#87CEEB' },
        headerStyle: { backgroundColor: '#87CEEB' },
        headerTintColor: '#FFD700',
      })}
    >
      <Tab.Screen name="Dashboard" options={{ title: 'Daily Devotion' }}>
        {() => <DashboardScreen streak={streak} updateStreak={updateStreak} />}
      </Tab.Screen>
      <Tab.Screen name="Chat" options={{ title: 'Holy Guidance' }}>
        {() => <ChatScreen streak={streak} />}
      </Tab.Screen>
      <Tab.Screen name="Profile" options={{ title: 'My Faith Journey' }}>
        {() => <ProfileScreen streak={streak} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function Navigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}

export default function App() {
    return (
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    );
  }
  // Add to Navigation function (or use useAuth in screens):
  function Navigation() {
    const { user, profileCompleted, loading } = useAuth();
    if (loading) return <View style={{ flex: 1, backgroundColor: '#87CEEB', justifyContent: 'center', alignItems: 'center' }}><Text>Loading...</Text></View>;
    
    if (!user) return <LoginScreen />;
    if (!profileCompleted) return <OnboardingScreen />;
    return <MainTabs />;
  }