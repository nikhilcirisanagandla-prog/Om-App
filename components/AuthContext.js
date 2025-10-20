// components/AuthContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database
  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for userId:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Profile fetch error:', error);
        return;
      }

      setProfile(data || {});
    } catch (error) {
      console.error('Get user error:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('Auth state changed: INITIAL_SESSION', data.session?.user?.id);
      const currentUser = data.session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    }).catch((error) => {
      console.error('Get session error:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        await fetchProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = { 
    user, 
    profile, 
    loading, 
    logout,
    refreshProfile: () => user && fetchProfile(user.id) 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}