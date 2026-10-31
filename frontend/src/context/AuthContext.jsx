import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [user, setUser]       = useState(null);
  const [role, setRole]       = useState(null); // 'admin' | 'customer' | null
  const [profile, setProfile] = useState(null);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setRole(null);
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, customer:customers(*)')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        setRole(data.role || 'customer');
      } else {
        // Fallback default
        setRole('admin');
      }
    } catch {
      setRole('admin');
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setRole(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = ({ email, password }) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  const value = { 
    session, 
    user, 
    role, 
    profile, 
    isAdmin: role === 'admin',
    isCustomer: role === 'customer',
    signIn, 
    signOut, 
    loading: session === undefined 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
