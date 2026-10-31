import React, { createContext, useContext, useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_BASE_URL || '/api';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  username: string;
  fullName: string;
  profession: string;
}

export interface StoredUser extends User {
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{success: boolean, message?: string}>;
  signup: (username: string, fullName: string, profession: string, password: string) => Promise<{success: boolean, message?: string}>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const DEFAULT_USERS: StoredUser[] = [
  {
    id: '1',
    username: 'grkumar',
    fullName: 'girish kumar',
    profession: 'farmer',
    password: 'grsharma',
  },
  {
    id: '2',
    username: 'Pandit',
    fullName: 'Nitin Pandit',
    profession: 'Software developer',
    password: 'pandit',
  },
  {
    id: '3',
    username: 'admin',
    fullName: 'Admin User',
    profession: 'Administrator',
    password: 'admin',
  },
];

const getStoredUsers = (): StoredUser[] => {
  try {
    const raw = localStorage.getItem('finance_users');
    if (!raw) {
      localStorage.setItem('finance_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem('finance_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    // Ensure default users exist in stored list
    let updated = false;
    for (const def of DEFAULT_USERS) {
      if (!parsed.some(u => u.username.toLowerCase() === def.username.toLowerCase())) {
        parsed.push(def);
        updated = true;
      }
    }
    if (updated) {
      localStorage.setItem('finance_users', JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem('finance_users', JSON.stringify(users));
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    // Initialize default users in localStorage if needed
    getStoredUsers();

    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = async (username: string, password: string): Promise<{success: boolean, message?: string}> => {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    // 1. Try real backend API if running
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUsername, password: cleanPassword }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success && data?.user) {
          setUser(data.user);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          return { success: true };
        }
        if (data && !data.success) {
          return { success: false, message: data.message || 'Invalid username or password' };
        }
      }
      // If 404 HTML (e.g. Netlify static hosting without backend), fall through to local fallback
    } catch {
      // Backend offline or network error, fall through to local fallback
    }

    // 2. Client-side LocalStorage Fallback (Works immediately on Netlify!)
    const users = getStoredUsers();
    const matched = users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase());

    if (matched && (!matched.password || matched.password === cleanPassword)) {
      const safeUser: User = {
        id: matched.id,
        username: matched.username,
        fullName: matched.fullName,
        profession: matched.profession,
      };
      setUser(safeUser);
      localStorage.setItem('auth_user', JSON.stringify(safeUser));
      return { success: true };
    }

    return { success: false, message: 'Invalid username or password' };
  };

  // ── Signup ───────────────────────────────────────────────────────────────
  const signup = async (
    username: string,
    fullName: string,
    profession: string,
    password: string
  ): Promise<{success: boolean, message?: string}> => {
    const cleanUsername = username.trim();
    const cleanFullName = fullName.trim();
    const cleanProfession = profession.trim();
    const cleanPassword = password.trim();

    // 1. Try backend API if running
    try {
      const res = await fetch(`${API}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          fullName: cleanFullName,
          profession: cleanProfession,
          password: cleanPassword,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json().catch(() => null);
        if (res.ok && data?.success && data?.user) {
          setUser(data.user);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          return { success: true };
        }
        if (data && !data.success) {
          return { success: false, message: data.message || 'Failed to create account. Username might already exist.' };
        }
      }
    } catch {
      // Backend offline, fall through to local fallback
    }

    // 2. Client-side LocalStorage Fallback
    const users = getStoredUsers();
    const exists = users.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (exists) {
      return { success: false, message: 'Username already exists. Please choose a different username.' };
    }

    const newUser: StoredUser = {
      id: 'usr_' + Date.now(),
      username: cleanUsername,
      fullName: cleanFullName,
      profession: cleanProfession,
      password: cleanPassword,
    };

    const updated = [...users, newUser];
    saveStoredUsers(updated);

    const safeUser: User = {
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      profession: newUser.profession,
    };
    setUser(safeUser);
    localStorage.setItem('auth_user', JSON.stringify(safeUser));
    return { success: true };
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = async (): Promise<void> => {
    if (user) {
      try {
        await fetch(`${API}/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            username: user.username,
            fullName: user.fullName,
          }),
        });
      } catch {
        // Backend offline, ignore
      }
    }
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
