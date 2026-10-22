import { useCallback, useEffect, useState } from 'react';
import type { AppUser, AppUserInput } from '@/types';
import { usersApi } from '@/api/endpoints/users.api';

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    usersApi
      .getUsers()
      .then((loaded) => {
        if (!cancelled) setUsers(loaded);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const replaceUser = (updated: AppUser) =>
    setUsers((previous) => previous.map((user) => (user.id === updated.id ? updated : user)));

  const createUser = useCallback(async (input: AppUserInput) => {
    const created = await usersApi.createUser(input);
    setUsers((previous) => [created, ...previous]);
    return created;
  }, []);

  const updateUser = useCallback(async (id: string, input: AppUserInput) => {
    const updated = await usersApi.updateUser(id, input);
    replaceUser(updated);
    return updated;
  }, []);

  const toggleActive = useCallback(async (user: AppUser) => {
    const updated = await usersApi.setUserActive(user.id, !user.active);
    replaceUser(updated);
    return updated;
  }, []);

  const restoreUser = useCallback(async (user: AppUser) => {
    const restored = await usersApi.restoreUser(user.id);
    replaceUser(restored);
    return restored;
  }, []);

  return { users, loading, createUser, updateUser, toggleActive, restoreUser };
}
