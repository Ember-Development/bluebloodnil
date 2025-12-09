import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export interface SocialProfile {
  id?: string;
  platform: string;
  handle: string;
  followers: number;
  avgEngagementRate?: number;
  avgViews?: number;
  postingCadence?: string;
}

export interface Interest {
  id?: string;
  label: string;
  color?: string;
}

export interface ParentContact {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface AthleteProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  position?: string;
  position1?: string;
  position2?: string;
  school?: string;
  teamName?: string;
  jerseyNumber?: number;
  classYear?: number;
  gradYear?: number;
  ageGroup?: string;
  address?: string;
  location?: string;
  bio?: string;
  sport?: string;
  primaryPosition?: string;
  avatarUrl?: string;
  nilScore?: number;
  profileComplete: boolean;
  socialProfiles?: SocialProfile[];
  interests?: Interest[];
  parentContacts?: ParentContact[];
}

export interface User {
  id: string;
  email: string;
  role: string;
  profileComplete: boolean;
  athlete: AthleteProfile | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isGuest: boolean;
  setGuestMode: (isGuest: boolean) => void;
  exitGuestMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem("guestMode") === "true";
  });

  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);

      // For development: get userId from localStorage or mock it
      // In production, this would come from session/JWT
      const userId = localStorage.getItem("userId");

      if (!userId) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Add userId to headers for mock auth
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api/auth/me`,
        {
          headers: {
            "x-user-id": userId,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("userId");
          setUser(null);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch user");
      }

      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      console.error("Auth refresh error:", err);
      setError(err instanceof Error ? err.message : "Authentication error");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest);
    if (guest) {
      localStorage.setItem("guestMode", "true");
    } else {
      localStorage.removeItem("guestMode");
    }
  };

  const exitGuestMode = () => {
    setIsGuest(false);
    localStorage.removeItem("guestMode");
  };

  const logout = () => {
    localStorage.removeItem("userId");
    setUser(null);
    setError(null);
    // Don't clear guest mode on logout - let user continue browsing as guest
  };

  useEffect(() => {
    // Only refresh user if not in guest mode
    if (!isGuest) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [isGuest]);

  const isAuthenticated = !!user && !isGuest;
  // Admins and other non-athlete roles don't need onboarding
  const isProfileComplete =
    user?.role !== "ATHLETE" ? true : (user?.profileComplete ?? false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setUser,
        refreshUser,
        logout,
        isAuthenticated,
        isProfileComplete,
        isGuest,
        setGuestMode,
        exitGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
