import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    address: string
  ) => Promise<{ message: string } | null>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create a default profile
  const createDefaultProfile = async (
    userId: string,
    email: string,
    fullName?: string,
    address?: string
  ) => {
    console.log('Creating default profile for user:', userId);
    const { data: profileData, error: createError } = await supabase
      .from('user_profiles')
      .insert([
        {
          id: userId,
          full_name: fullName ?? email.split('@')[0],
          address: address ?? 'Address not provided',
          tickets: 100, // Starting with 100 free tickets
          is_admin: false
        }
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating default profile:', createError);
      return null;
    }

    console.log('Default profile created successfully');
    return profileData;
  };

  // Check for logged in user on initial load
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log('Fetching initial user session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Session found, fetching user profile...');
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // If we can't fetch the profile, sign out the user
            await supabase.auth.signOut();
            setUser(null);
            setLoading(false);
            return;
          }
          
          let finalProfileData = profileData;
          
          if (!profileData) {
            console.log('No user profile found, attempting to create default profile');
            // Try to create a default profile
            finalProfileData = await createDefaultProfile(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata?.full_name,
              session.user.user_metadata?.address
            );
            
            if (!finalProfileData) {
              console.log('Failed to create default profile, logging out');
              await supabase.auth.signOut();
              setUser(null);
              setLoading(false);
              return;
            }
          }
          
          console.log('User profile ready, setting user state');
          // Transform Supabase profile data to match our User type
          setUser({
            id: session.user.id,
            name: finalProfileData.full_name,
            email: session.user.email || '',
            password: '', // We don't store or retrieve passwords
            address: finalProfileData.address,
            tickets: finalProfileData.tickets,
            isAdmin: finalProfileData.is_admin,
            createdAt: finalProfileData.created_at
          });
        } else {
          console.log('No session found');
        }
      } catch (error) {
        console.error('Session fetch error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`Auth state changed: ${event}`, session ? 'Session exists' : 'No session');
        
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, fetching profile...');
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error fetching user profile after sign in:', profileError);
            // If we can't fetch the profile, sign out the user
            await supabase.auth.signOut();
            setUser(null);
            return;
          }
          
          let finalProfileData = profileData;
          
          if (!profileData) {
            console.log('No profile found after sign in, attempting to create default profile');
            // Try to create a default profile
            finalProfileData = await createDefaultProfile(
              session.user.id,
              session.user.email || '',
              session.user.user_metadata?.full_name,
              session.user.user_metadata?.address
            );
            
            if (!finalProfileData) {
              console.error('Failed to create default profile after sign in');
              await supabase.auth.signOut();
              setUser(null);
              return;
            }
          }
          
          console.log('Profile ready after sign in');
          setUser({
            id: session.user.id,
            name: finalProfileData.full_name,
            email: session.user.email || '',
            password: '', // We don't store or retrieve passwords
            address: finalProfileData.address,
            tickets: finalProfileData.tickets,
            isAdmin: finalProfileData.is_admin,
            createdAt: finalProfileData.created_at
          });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing user state');
          setUser(null);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      if (data.user) {
        console.log('Login successful');
        // Profile data will be loaded by the auth state change listener
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    address: string
  ): Promise<{ message: string } | null> => {
    try {
      console.log('Attempting registration for:', email);
      // Create the user in Supabase Auth with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
          options: {
            data: {
              full_name: name,
              address
            }
          }
      });

      if (error) {
        console.error('Registration error:', error.message);
        return { message: error.message };
      }

      if (!data.session) {
        console.log('No session returned after sign up, attempting to sign in...');
        let attempts = 0;
        let signInError;
        do {
          ({ error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          }));
          if (signInError) {
            attempts += 1;
            if (attempts < 3) {
              console.warn('Sign-in failed, retrying...', signInError.message);
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }
        } while (signInError && attempts < 3);

        if (signInError) {
          console.error('Auto sign-in after registration failed:', signInError.message);
          return { message: signInError.message };
        }
      }
      console.log('Registration successful');
      // Profile will be created by the auth state change listener if needed
      return null;
    } catch (error) {
      console.error('Registration error:', error);
      return { message: (error as Error).message };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      console.log('Sending password reset email to:', email);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return !error;
    } catch (error) {
      console.error('Reset password error:', error);
      return false;
    }
  };

  const updateUser = async (updatedUser: User) => {
    if (!user) return;
    
    try {
      console.log('Updating user profile');
      // Update profile in user_profiles table
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: updatedUser.name,
          address: updatedUser.address,
          tickets: updatedUser.tickets,
          is_admin: updatedUser.isAdmin
        })
        .eq('id', user.id);
        
      if (error) {
        console.error('Profile update error:', error.message);
        return;
      }
      
      // If email has changed, update it in auth
      if (updatedUser.email !== user.email) {
        console.log('Email changed, updating in auth');
        const { error: emailError } = await supabase.auth.updateUser({
          email: updatedUser.email
        });
        
        if (emailError) {
          console.error('Email update error:', emailError.message);
          return;
        }
      }
      
      console.log('User profile updated successfully');
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};