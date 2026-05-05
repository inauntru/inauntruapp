"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ADMIN_USERS, type AdminUser } from "@/lib/mockData";

const STORAGE_KEY = "inauntru_users";

function loadUsers(): AdminUser[] {
  if (typeof window === "undefined") return ADMIN_USERS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as AdminUser[];
  } catch {}
  return ADMIN_USERS;
}

type UsersContextType = {
  users: AdminUser[];
  addUser: (user: AdminUser) => void;
  updateUser: (id: number, updates: Partial<AdminUser>) => void;
};

const UsersContext = createContext<UsersContextType>({
  users: ADMIN_USERS,
  addUser: () => {},
  updateUser: () => {},
});

export function UsersProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<AdminUser[]>(ADMIN_USERS);

  // Load from localStorage after mount (avoids hydration mismatch)
  useEffect(() => {
    const stored = loadUsers();
    setUsers(stored);
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch {}
  }, [users]);

  function addUser(user: AdminUser) {
    setUsers((prev) => [user, ...prev]);
  }

  function updateUser(id: number, updates: Partial<AdminUser>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
  }

  return (
    <UsersContext.Provider value={{ users, addUser, updateUser }}>
      {children}
    </UsersContext.Provider>
  );
}

export const useUsers = () => useContext(UsersContext);
