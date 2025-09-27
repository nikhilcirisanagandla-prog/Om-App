import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../utils/supabase';
import { supabase } from '../utils/supabase';  // Import client

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser ] = useState(null);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [profileCompleted, setProfileCompleted] = useState(false);

  useEffect(() => {
    // Check session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser (session?.user ?? null);
      setLoading(false);
      if (session?.user) loadProfile(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser (session?.user ?? null);
      setLoading(false);
      if (session?.user) loadProfile(session.user.id);
      else clearLocal();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      // Local cache first
      const localProfile = await SecureStore.getItemAsync(`profile_${userId}`);
      if (localProfile) {
        const parsed = JSON.parse(localProfile);
        setProfile(parsed);
        setProfileCompleted(!!parsed.deity || !!parsed.practice);
        return;
      }

      // Fetch from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;  // No row OK
      if (data) {
        setProfile(data);
        setProfileCompleted(!!data.deity || !!data.practice);
        await SecureStore.setItemAsync(`profile_${userId}`, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data.user;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearLocal();
  };

  const completeProfile = async (data) => {
    const userId = user.id;
    const fullProfile = { ...profile, ...data, updated_at: new Date().toISOString() };
    
    // Upsert to Supabase
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...fullProfile });
    if (error) throw error;

    // Cache locally
    await SecureStore.setItemAsync(`profile_${userId}`, JSON.stringify(fullProfile));
    setProfile(fullProfile);
    setProfileCompleted(true);
  };

  const clearLocal = async () => {
    setUser (null);
    setProfile({});
    setProfileCompleted(false);
    await SecureStore.deleteItemAsync('profile');
    // Clear per-user if needed
  };

  const value = {
    user,
    profile,
    profileCompleted,
    loading,
    signUp,
    signIn,
    signOut,
    completeProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}