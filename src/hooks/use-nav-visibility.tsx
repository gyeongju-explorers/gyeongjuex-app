import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const NavVisibilityContext = createContext<{
  visible: boolean;
  setVisible: (visible: boolean) => void;
} | null>(null);

export function NavVisibilityProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(true);

  return (
    <NavVisibilityContext.Provider value={{ visible, setVisible }}>
      {children}
    </NavVisibilityContext.Provider>
  );
}

export function useNavVisibility() {
  const context = useContext(NavVisibilityContext);
  if (!context) {
    throw new Error('useNavVisibility must be used within a NavVisibilityProvider');
  }
  return context;
}

// 화면에 특정 상태(팝업 등)가 떠 있는 동안 하단 Nav를 숨기고, 사라지면 다시 보여줌.
export function useHideNavWhile(hidden: boolean) {
  const { setVisible } = useNavVisibility();

  useEffect(() => {
    if (!hidden) return;
    setVisible(false);
    return () => setVisible(true);
  }, [hidden, setVisible]);
}
