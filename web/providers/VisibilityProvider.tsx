import React, { createContext, useContext, useEffect, useState } from "react";
import { useNuiEvent } from "../hooks/useNUIEvent";
import { fetchNui } from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";

interface VisibilityProviderProps {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const VisibilityContext = createContext<VisibilityProviderProps | null>(null);

export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useNuiEvent<boolean>("setIsVisible", setIsVisible);

  // Handle pressing escape/backspace
  useEffect(() => {
    // Only attach listener when we are visible
    if (!isVisible) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (["Escape"].includes(event.code)) {
        if (isEnvBrowser()) {
          return setIsVisible(false);
        }

        // Gives mouse focus back to game, then dispates setIsVisible false event.
        return fetchNui("hideFrame");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  return (
    <VisibilityContext.Provider
      value={{
        isVisible,
        setIsVisible,
      }}
    >
      <div
        style={{ visibility: isVisible ? "visible" : "hidden", height: "100%" }}
      >
        {children}
      </div>
    </VisibilityContext.Provider>
  );
};

export function useVisibility() {
  const currentVisibilityContext = useContext(VisibilityContext);

  if (!currentVisibilityContext) {
    throw new Error(
      "useVisibility has to be used within <VisibilityContext.Provider>"
    );
  }

  return currentVisibilityContext;
}
