"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CustomerProfile } from "@/lib/customerAuth";

interface CustomerUser {
  id: string;
  email: string;
}

interface CustomerContextType {
  user: CustomerUser | null;
  customer: CustomerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshCustomer: () => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setIsAuthenticated(false);
        setUser(null);
        setCustomer(null);
        return;
      }
      const data = await res.json();
      if (data.authenticated && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
        setCustomer(data.customer || null);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setCustomer(null);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    setIsAuthenticated(false);
    setUser(null);
    setCustomer(null);
  }, []);

  useEffect(() => {
    refreshCustomer();
  }, [refreshCustomer]);

  return (
    <CustomerContext.Provider
      value={{
        user,
        customer,
        isAuthenticated,
        isLoading,
        refreshCustomer,
        logout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return ctx;
}
