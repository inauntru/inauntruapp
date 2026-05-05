"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ADMIN_USERS, type AdminUser } from "@/lib/mockData";

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
