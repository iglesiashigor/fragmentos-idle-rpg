import { useCallback, useEffect, useRef, useState } from 'react';
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

export type AuthFeedback = { type: 'error' | 'info'; message: string } | null;

const USER_STORAGE_KEY = 'user';
const SESSION_STORAGE_KEY = 'local-user-session';
const CHARACTER_SAVE_DEBOUNCE_MS = 5_000;

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

const supabaseConfigError =
  'Supabase não está configurado neste deploy. Verifique as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.';

const toSavedCharacter = (row: CharacterRow): SavedCharacter => ({
  ...row.data,
  id: row.id,
  name: row.data.name || row.name,
});

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const pendingCharacterSavesRef = useRef<Map<string, SavedCharacter>>(new Map());
  const characterSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushCharacterSaves = useCallback(() => {
    const client = supabase;
    if (!client || pendingCharacterSavesRef.current.size === 0) return saveQueueRef.current;

    const characters = [...pendingCharacterSavesRef.current.values()];
    pendingCharacterSavesRef.current.clear();
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      for (const character of characters) {
        const { error } = await client
          .from('characters')
          .update({ name: character.name, data: character })
          .eq('id', character.id);
        if (error) throw error;
      }
    }).catch((error: unknown) => {
      alert(`Erro ao salvar progresso: ${error instanceof Error ? error.message : 'tente novamente.'}`);
    });
    return saveQueueRef.current;
  }, []);

  useEffect(() => {
    const flushWhenHidden = () => {
      if (document.visibilityState === 'hidden') void flushCharacterSaves();
    };
    document.addEventListener('visibilitychange', flushWhenHidden);
    return () => {
      document.removeEventListener('visibilitychange', flushWhenHidden);
      if (characterSaveTimerRef.current) clearTimeout(characterSaveTimerRef.current);
      void flushCharacterSaves();
    };
  }, [flushCharacterSaves]);

  const loadSupabaseUser = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const authUser = sessionData.session?.user;

      if (!authUser) {
        setLoadError(null);
        setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from('characters')
        .select('id, name, data')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setLoadError(null);
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        characters: (data as CharacterRow[]).map(toSavedCharacter),
      });
    } catch (error) {
      setLoadError(`Não foi possível carregar seus personagens: ${error instanceof Error ? error.message : 'tente novamente.'}`);
    }
  }, []);

  const retryLoad = async () => {
    setIsLoading(true);
    try {
      await loadSupabaseUser();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      if (canUseLocalAuthFallback) {
        const savedUser = getStoredUser();
        if (savedUser && localStorage.getItem(SESSION_STORAGE_KEY) === savedUser.id) {
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

  const login = async (email: string, password: string): Promise<AuthFeedback> => {
    if (supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { type: 'error', message: `Não foi possível entrar: ${error.message}` };
      }

      await loadSupabaseUser();
      return null;
    }

    if (!canUseLocalAuthFallback) {
      return { type: 'error', message: supabaseConfigError };
    }

    const savedUser = getStoredUser();
    if (savedUser?.email === email && savedUser.password === password) {
      localStorage.setItem(SESSION_STORAGE_KEY, savedUser.id);
      setUser(savedUser);
      return null;
    }

    return { type: 'error', message: 'Email ou senha incorretos.' };
  };

  const register = async (email: string, password: string): Promise<AuthFeedback> => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { type: 'error', message: `Não foi possível criar a conta: ${error.message}` };
      }

      if (!data.session) {
        return { type: 'info', message: 'Conta criada. Confirme seu email antes de entrar.' };
      }

      await loadSupabaseUser();
      return null;
    }

    if (!canUseLocalAuthFallback) {
      return { type: 'error', message: supabaseConfigError };
    }

    const savedUser = getStoredUser();
    if (savedUser?.email === email) {
      return { type: 'error', message: 'Email já cadastrado.' };
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      email,
      password,
      characters: [],
    };

    saveStoredUser(newUser);
    localStorage.setItem(SESSION_STORAGE_KEY, newUser.id);
    setUser(newUser);
    return null;
  };

  const logout = async () => {
    if (characterSaveTimerRef.current) clearTimeout(characterSaveTimerRef.current);
    characterSaveTimerRef.current = null;
    await flushCharacterSaves();
    if (supabase) {
      await saveQueueRef.current;
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }

    setLoadError(null);
    setUser(null);
  };

  const saveCharacter = async (character: SavedCharacter): Promise<boolean> => {
    if (!user) return false;
    if (user.characters.length >= 5) {
      alert('Limite de 5 personagens atingido. Exclua um personagem para criar outro.');
      return false;
    }

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
        return false;
      }

      setUser({
        ...user,
        characters: [...user.characters, savedCharacter],
      });
      return true;
    }

    const updatedUser = {
      ...user,
      characters: [...user.characters, character],
    };

    saveStoredUser(updatedUser as StoredUser);
    setUser(updatedUser);
    return true;
  };

  const updateCharacter = (character: SavedCharacter) => {
    if (!user) return;

    if (supabase) {
      pendingCharacterSavesRef.current.set(character.id, character);
      if (!characterSaveTimerRef.current) {
        characterSaveTimerRef.current = setTimeout(() => {
          characterSaveTimerRef.current = null;
          void flushCharacterSaves();
        }, CHARACTER_SAVE_DEBOUNCE_MS);
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

  const deleteCharacter = async (characterId: string): Promise<boolean> => {
    if (!user) return false;

    if (supabase) {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) {
        alert(`Erro ao excluir personagem: ${error.message}`);
        return false;
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
    return true;
  };

  return {
    user,
    isLoading,
    loadError,
    retryLoad,
    login,
    register,
    logout,
    saveCharacter,
    updateCharacter,
    deleteCharacter,
  };
}
