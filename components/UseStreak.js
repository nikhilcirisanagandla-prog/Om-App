import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';

export function useStreak() {
  const [streak, setStreak] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) loadStreak();
  }, [user]);

  const loadStreak = async () => {
    try {
      // Local first
      const local = await SecureStore.getItemAsync(`streak_${user.id}`);
      if (local) {
        const { count, date } = JSON.parse(local);
        const today = new Date().toDateString();
        let newCount = count;
        if (date !== today) {
          if (isYesterday(date)) newCount = count + 1;
          else newCount = 1;
        }
        setStreak(newCount);
        return;
      }

      // Supabase fetch
      const { data } = await supabase
        .from('streaks')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        // Similar logic as local
        const today = new Date().toDateString();
        let newCount = data.count;
        if (data.last_update !== today) {
          if (isYesterday(data.last_update)) newCount = data.count + 1;
          else newCount = 1;
        }
        setStreak(newCount);
        await updateStreak(newCount);  // Sync
      } else {
        setStreak(1);
        await updateStreak(1);
      }
    } catch (error) {
      console.error('Streak load error:', error);
      setStreak(1);
    }
  };

  const isYesterday = (dateStr) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return new Date(dateStr).toDateString() === yesterday.toDateString();
  };

  const updateStreak = async (newStreak) => {
    const today = new Date().toDateString();
    const data = { count: newStreak, last_update: today, updated_at: new Date().toISOString() };

    // Upsert Supabase
    const { error } = await supabase
      .from('streaks')
      .upsert({ id: user.id, ...data });
    if (error) throw error;

    // Cache local
    await SecureStore.setItemAsync(`streak_${user.id}`, JSON.stringify({ count: newStreak, date: today }));

    setStreak(newStreak);
  };

  return { streak, updateStreak };
}