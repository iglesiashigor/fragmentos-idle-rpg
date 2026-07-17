import { useState, useEffect } from 'react';
import { User, SavedCharacter } from '../types/game';

interface StoredUser extends User {
  password: string;
}

const USER_STORAGE_KEY = 'user';

const getStoredUser = (): StoredUser | null => {
  const savedUser = localStorage.getItem(USER_STORAGE_KEY);
  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser) as StoredUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const saveStoredUser = (user: StoredUser) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = getStoredUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    const savedUser = getStoredUser();
    if (savedUser?.email === email && savedUser.password === password) {
      setUser(savedUser);
      return;
    }

    alert('Email ou senha incorretos');
  };

  const register = (email: string, password: string) => {
    const savedUser = getStoredUser();
    if (savedUser?.email === email) {
      alert('Email já cadastrado');
      return;
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      email,
      password,
      characters: [],
    };

    saveStoredUser(newUser);
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  const saveCharacter = (character: SavedCharacter) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      characters: [...user.characters, character],
    };

    saveStoredUser(updatedUser as StoredUser);
    setUser(updatedUser);
  };

  const updateCharacter = (character: SavedCharacter) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      characters: user.characters.map(c => 
        c.id === character.id ? character : c
      ),
    };

    saveStoredUser(updatedUser as StoredUser);
    setUser(updatedUser);
  };

  const deleteCharacter = (characterId: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      characters: user.characters.filter(c => c.id !== characterId),
    };

    saveStoredUser(updatedUser as StoredUser);
    setUser(updatedUser);
  };

  return { 
    user, 
    isLoading, 
    login,
    register,
    logout,
    saveCharacter,
    updateCharacter,
    deleteCharacter,
  };
}
