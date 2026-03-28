import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type User = {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
};

type Auth = {
  user: User;
  token: string;
};

type AuthContextType = {
  auth: Auth | null;
  setAuth: (auth: Auth | null) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuthState] = useState<Auth | null>(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = (newAuth: Auth | null) => {
    if (newAuth) {
      localStorage.setItem("auth", JSON.stringify(newAuth));
    } else {
      localStorage.removeItem("auth");
    }
    setAuthState(newAuth);
  };

  const logout = () => setAuth(null);

  useEffect(() => {
    const validateToken = async () => {
      const savedAuth = localStorage.getItem("auth");
      if (!savedAuth) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedAuth = JSON.parse(savedAuth);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/auth/verify`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${parsedAuth.token}`,
            },
          },
        );

        if (response.ok) {
          const data = await response.json();
          setAuthState({ user: data.user, token: parsedAuth.token });
        } else {
          setAuthState(null);
          localStorage.removeItem("auth");
        }
      } catch {
        setAuthState(null);
        localStorage.removeItem("auth");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
