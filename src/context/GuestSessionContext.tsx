"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface GuestSession {
  email: string;
  isGuest: true;
}

interface GuestSessionContextType {
  guestSession: GuestSession | null;
  setGuestSession: (session: GuestSession | null) => void;
  isGuestLoggedIn: boolean;
}

const GuestSessionContext = createContext<GuestSessionContextType | undefined>(
  undefined
);

export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [guestSession, setGuestSessionState] = useState<GuestSession | null>(
    null
  );

  // Load guest session from localStorage on mount
  useEffect(() => {
    const savedGuestSession = localStorage.getItem("guestSession");
    if (savedGuestSession) {
      try {
        const parsed = JSON.parse(savedGuestSession);
        setGuestSessionState(parsed);
      } catch (error) {
        console.error("Failed to parse guest session:", error);
        localStorage.removeItem("guestSession");
      }
    }
  }, []);

  const setGuestSession = (session: GuestSession | null) => {
    setGuestSessionState(session);
    if (session) {
      localStorage.setItem("guestSession", JSON.stringify(session));
    } else {
      localStorage.removeItem("guestSession");
    }
  };

  const isGuestLoggedIn = !!guestSession;

  return (
    <GuestSessionContext.Provider
      value={{
        guestSession,
        setGuestSession,
        isGuestLoggedIn,
      }}
    >
      {children}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSession() {
  const context = useContext(GuestSessionContext);
  if (context === undefined) {
    throw new Error(
      "useGuestSession must be used within a GuestSessionProvider"
    );
  }
  return context;
}
