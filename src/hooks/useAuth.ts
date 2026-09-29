import { useCallback, useEffect, useRef, useState } from 'react';
import { User, SavedCharacter } from '../types/game';
import {
  canUseLocalAuthFallback,
  isSupabaseConfigured,
  supabase,
} from '../lib/supabase';
import { getPendingSave, pendingSaveKey, storePendingSave } from '../utils/pendingSave';

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
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const queuePendingSaves = useCallback((userId: string, characterIds: string[]) => {
    if (!supabase) return saveQueueRef.current;
    const client = supabase;
    saveQueueRef.current = saveQueueRef.current.then(async () => {
      let saveFailure: Error | null = null;
      for (const characterId of characterIds) {
        const key = pendingSaveKey(userId, characterId);
        const snapshot = localStorage.getItem(key);
        if (!snapshot) continue;
        const character = getPendingSave(userId, characterId);
        if (!character) continue;
        try {
          const { error } = await client
            .from('characters')
            .update({ name: character.name, data: character })
            .eq('id', characterId)
            .eq('user_id', userId)
            .select('id')
            .single();
          if (error) throw error;
          if (localStorage.getItem(key) === snapshot) localStorage.removeItem(key);
        } catch (error) {
          saveFailure = error instanceof Error ? error : new Error('tente novamente.');
        }
      }
      if (saveFailure) throw saveFailure;
      setSaveError(characterIds.some((id) => getPendingSave(userId, id))
        ? 'Há progresso aguardando sincronização.'
        : null);
    }).catch((error: unknown) => {
      setSaveError(`Progresso pendente de sincronização: ${error instanceof Error ? error.message : 'tente novamente.'}`);
    });
    return saveQueueRef.current;
  }, []);

  const loadSupabaseUser = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      const authUser = sessionData.session?.user;

      if (!authUser) {
        setLoadError(null);
        setSaveError(null);
        setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from('characters')
        .select('id, name, data')
        .order('created_at', { ascending: true });

      if (error) throw error;

      setLoadError(null);
      const characters = (data as CharacterRow[]).map(toSavedCharacter).map((character) =>
        getPendingSave(authUser.id, character.id) || character
      );
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        characters,
      });
      if (characters.some((character) => getPendingSave(authUser.id, character.id))) {
        setSaveError('Há progresso salvo neste navegador aguardando sincronização.');
        void queuePendingSaves(authUser.id, characters.map((character) => character.id));
      }
    } catch (error) {
      setLoadError(`Não foi possível carregar seus personagens: ${error instanceof Error ? error.message : 'tente novamente.'}`);
    }
  }, [queuePendingSaves]);

  useEffect(() => {
    if (!user || !supabase) return;
    const retry = () => void queuePendingSaves(user.id, user.characters.map((character) => character.id));
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [user, queuePendingSaves]);

  const retrySave = () => {
    if (user) void queuePendingSaves(user.id, user.characters.map((character) => character.id));
  };

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
      try {
        storePendingSave(user.id, character);
        void queuePendingSaves(user.id, user.characters.map((savedCharacter) => savedCharacter.id));
      } catch {
        setSaveError('Não foi possível guardar o progresso neste navegador. Verifique o armazenamento disponível.');
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
      await saveQueueRef.current;
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId);

      if (error) {
        alert(`Erro ao excluir personagem: ${error.message}`);
        return false;
      }
      localStorage.removeItem(pendingSaveKey(user.id, characterId));
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
    saveError,
    retrySave,
    retryLoad,
    login,
    register,
    logout,
    saveCharacter,
    updateCharacter,
    deleteCharacter,
  };
}
