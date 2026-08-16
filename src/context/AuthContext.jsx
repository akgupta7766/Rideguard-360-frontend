import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { getCurrentUser } from "../services/api";

const AuthContext = createContext(null);


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () =>
      localStorage.getItem("access_token")
  );

  const [loading, setLoading] =
    useState(true);


  // ==========================================
  // VERIFY SAVED LOGIN
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const verifyUser = async () => {

      if (!token) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }

        return;
      }


      try {
        const result =
          await getCurrentUser(token);


        if (!mounted) {
          return;
        }


        setUser(
          result?.user || null
        );


        // Keep localStorage user
        // synchronized with backend.
        if (result?.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(
              result.user
            )
          );
        }

      } catch (error) {

        console.error(
          "Authentication verification failed:",
          error
        );


        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "user"
        );


        if (mounted) {
          setToken(null);
          setUser(null);
        }

      } finally {

        if (mounted) {
          setLoading(false);
        }

      }
    };


    verifyUser();


    return () => {
      mounted = false;
    };

  }, [token]);


  // ==========================================
  // LOGIN
  // ==========================================

  const login = (loginResult) => {

    const newToken =
      loginResult?.access_token;

    const newUser =
      loginResult?.user;


    if (!newToken || !newUser) {
      console.error(
        "Invalid login response:",
        loginResult
      );

      return;
    }


    localStorage.setItem(
      "access_token",
      newToken
    );

    localStorage.setItem(
      "user",
      JSON.stringify(newUser)
    );


    setToken(newToken);
    setUser(newUser);
  };


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    localStorage.removeItem(
      "access_token"
    );

    localStorage.removeItem(
      "user"
    );


    setToken(null);
    setUser(null);
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        isAuthenticated:
          Boolean(
            token && user
          ),

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(
    AuthContext
  );
}