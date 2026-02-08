"use client";
import * as React from "react";

import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from '../src/auth/AuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider>
      <AuthProvider>{children}</AuthProvider>
    </ChakraProvider>
  );
}
