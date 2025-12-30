"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AIContextType {
  generateResponse: (prompt: string) => Promise<string>;
  isLoading: boolean;
  error: string | null;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (prompt: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      // This is a placeholder for the actual AI implementation.
      // In a real-world scenario, you would call an API route here.
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const data = await response.json();
      return data.text;
    } catch (err: any) {
      setError(err.message);
      return "I'm sorry, I encountered an error while processing your request.";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{ generateResponse, isLoading, error }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
