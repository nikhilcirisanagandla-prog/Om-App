// App.js

import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider } from 'react-native-paper';

import { AuthProvider, useAuth } from './components/AuthContext';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Holy Guidance" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState(null);

  useEffect(() => {
    async function checkOnboarding() {
      if (user) {
        const completed = await AsyncStorage.getItem('onboarding_complete');
        setOnboardingComplete(completed === 'true');
      } else {
        setOnboardingComplete(false);
      }
    }
    checkOnboarding();
  }, [user]);

  if (loading || onboardingComplete === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
          <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Create Account' }} />
        </>
      ) : onboardingComplete ? (
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Onboarding' }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </PaperProvider>
    </AuthProvider>
  );
}