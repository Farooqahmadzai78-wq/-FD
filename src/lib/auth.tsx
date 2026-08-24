import { createContext, useContext, useMemo, type ReactNode } from "react";

type AuthCtx = {
  session: null;
  user: null;
  guest: true;
  loading: false;
  isRecovery: false;
  setGuest: (v: boolean) => void;
  setIsRecovery: (v: boolean) => void;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  guest: true,
  loading: false,
  isRecovery: false,
  setGuest: () => {},
  setIsRecovery: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo(
    () => ({
      session: null,
      user: null,
      guest: true as const,
      loading: false as const,
      isRecovery: false as const,
      setGuest: () => {},
      setIsRecovery: () => {},
    }),
    [],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
