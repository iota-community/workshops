import React, { createContext, useContext, useState } from "react";
import { CelebrationContextType, CelebrationModalProps } from "../types";
import CelebrationModal from "../components/molecules/CelebrationModal";

const CelebrationContext = createContext<CelebrationContextType | undefined>(undefined);

export const useCelebration = () => {
  const context = useContext(CelebrationContext);
  if (context === undefined) {
    throw new Error("useCelebration must be used within a CelebrationProvider");
  }
  return context;
};

export const CelebrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [celebrationState, setCelebrationState] = useState<Omit<CelebrationModalProps, 'onClose'> & { isOpen: boolean }>({
    isOpen: false,
    title: "🎉 Congratulations! 🎉",
    message: "You've successfully completed the action!",
  });

  const triggerCelebration = (config?: {
    title?: string;
    message?: string;
    badge?: CelebrationModalProps['badge'];
  }) => {
    setCelebrationState({
      isOpen: true,
      title: config?.title || "🎉 Congratulations! 🎉",
      message: config?.message || "You've successfully completed the action!",
      badge: config?.badge,
    });
  };

  const handleClose = () => {
    setCelebrationState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <CelebrationContext.Provider value={{ triggerCelebration }}>
      {children}
      <CelebrationModal
        isOpen={celebrationState.isOpen}
        onClose={handleClose}
        title={celebrationState.title}
        message={celebrationState.message}
        badge={celebrationState.badge}
      />
    </CelebrationContext.Provider>
  );
};