"use client";

import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation"; // Replace react-router-dom with Next.js navigation

interface ChatbotContextType {
  context: string;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider = ({ children }: ChatbotProviderProps) => {
  const pathname = usePathname(); // Use Next.js pathname instead of location
  const [context, setContext] = useState<string>("");
  
  useEffect(() => {
    const pageContextMap: { [key: string]: string } = {
      "/home": "You are on the Home page. Here, users can see their dashboard.",
      "/vault": "You are in the Vault where you can view saved images and videos.",
      "/settings": "You are in the Settings page where you can configure preferences.",
      "/charity": "You are on the Charity page where users can contribute funds to charity projects.",
    };
    setContext(pageContextMap[pathname] || "General assistance mode.");
  }, [pathname]);
  
  return (
    <ChatbotContext.Provider value={{ context }}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbotContext = () => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbotContext must be used within a ChatbotProvider");
  }
  return context;
};