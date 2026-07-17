import { useCallback, useEffect, useState } from 'react';
import { User, SavedCharacter } from '../types/game';
import {
  canUseLocalAuthFallback,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';

interface StoredUser extends User {
  password: string;
}

interface CharacterRow {
  id: string;
  name: string;
  data: SavedCharacter;
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

const showSupabaseConfigError = () => {
  alert(
    'Supabase não está configurado neste deploy. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel e faça um novo deploy.'
  );
};

const toSavedCharacter = (row: CharacterRow): SavedCharacter => ({
  ...row.data,
  id: row.id,
  name: row.data.name || row.name,
});

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSupabaseUser = useCallback(async () => {
    if (!supabase) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const authUser = sessionData.session?.user;

    if (!authUser) {
      setUser(null);
      return;
    }

    const { data, error } = await supabase
      .from('characters')
      .select('id, name, data')
      .order('created_at', { ascending: true });

    if (error) {
      alert(`Erro ao carregar personagens: ${error.message}`);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        characters: [],
      });
      return;
    }

    setUser({
      id: authUser.id,
      email: authUser.email || '',
      characters: (data as CharacterRow[]).map(toSavedCharacter),
    });
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      if (canUseLocalAuthFallback) {
        const savedUser = getStoredUser();
        if (savedUser) {
          setUser(savedUser);
        }
      }

      setIsLoading(false);
      return;
    }

    void loadSupabaseUser().finally(() => setIsLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadSupabaseUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadSupabaseUser]);

  const login = async (email: string, password: string) => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(`Email ou senha incorretos: ${error.message}`);
        return;
      }

      await loadSupabaseUser();
      return;
    }

    if (!canUseLocalAuthFallback) {
      showSupabaseConfigError();
      return;
    }

    const savedUser = getStoredUser();
    if (savedUser?.email === email && savedUser.password === password) {
      setUser(savedUser);
      return;
    }

    alert('Email ou senha incorretos');
  };

  const register = async (email: string, password: string) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(`Erro ao criar conta: ${error.message}`);
        return;
      }

      if (!data.session) {
        alert('Conta criada. Confirme seu email antes de entrar.');
        return;
      }

      await loadSupabaseUser();
      return;
    }

    if (!canUseLocalAuthFallback) {
      showSupabaseConfigError();
      return;
    }

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

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
  };

  const saveCharacter = async (character: SavedCharacter) => {
    if (!user) return;

    if (supabase) {
      const characterId = crypto.randomUUID();
      const savedCharacter = { ...character, id: characterId };
      const { error } = await supabase.from('characters').insert({
        id: characterId,
        user_id: user.id,
        name: savedCharacter.name,
        data: savedCharacter,
      });

      if (error) {
        alert(`Erro ao salvar personagem: ${error.message}`);
        return;
      }

      setUser({
        ...user,
        characters: [...user.characters, savedCharacter],
      });
      return;
    }

    const updatedUser = {
      ...user,
      characters: [...user.characters, character],
    };

    saveStoredUser(updatedUser as StoredUser);
    setUser(updatedUser);
  };

  const updateCharacter = async (character: SavedCharacter) => {
    if (!user) return;

    if (supabase) {
      const { error } = await supabase
        .from('characters')
        .update({
          name: character.name,
          data: character,
        })
        .eq('id', character.id);

      if (error) {
        alert(`Erro ao atualizar personagem: ${error.message}`);
        return;
      }
    }

    const updatedUser = {
      ...user,
      characters: user.characters.map((savedCharacter) =>
        savedCharacter.id === character.id ? character : savedCharacter
      ),
    };

    if (!supabase) {
      saveStoredUser(updatedUser as StoredUser);
    }

    setUser(updatedUser);
  };

  const deleteCharacter = async (characterId: string) => {
    if (!user) return;

    if (supabase) {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) {
        alert(`Erro ao excluir personagem: ${error.message}`);
        return;
      }
    }

    const updatedUser = {
      ...user,
      characters: user.characters.filter(
        (character) => character.id !== characterId
      ),
    };

    if (!supabase) {
      saveStoredUser(updatedUser as StoredUser);
    }

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
