"use client";
import * as React from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from '../src/auth/AuthProvider';
import { ToastProvider } from '../components/ui/Toast';
import EmotionRegistry from './EmotionRegistry';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <EmotionRegistry>
      <ChakraProvider>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </ChakraProvider>
    </EmotionRegistry>
  );
}
