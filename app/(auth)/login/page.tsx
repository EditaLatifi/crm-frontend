"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Input, Heading, Alert, VStack, Text, Flex, Icon } from '@chakra-ui/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, login } = require('../../../src/auth/AuthProvider').useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Login form submitted', { email, password });
    setError('');
    try {
      await login(email, password);
      console.log('Login success');
    } catch (err) {
      console.log('Login error', err);
      setError(err.message || 'Login failed');
    }
  }
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <Flex minH="100vh" bg="#f4f5f7" align="center" justify="center">
      <Box bg="#fff" p={10} rounded="2xl" boxShadow="2xl" w="full" maxW="sm" borderTop="8px solid #0052cc">
        <Flex direction="column" align="center" mb={6}>
          <Icon viewBox="0 0 32 32" boxSize={10} color="#0052cc">
            <circle cx="16" cy="16" r="16" fill="#0052cc" />
            <text x="16" y="21" textAnchor="middle" fontSize="16" fill="#fff" fontFamily="Arial">CRM</text>
          </Icon>
          <Heading size="md" mt={2} color="#0052cc">Sign in to CRM</Heading>
        </Flex>
        <form onSubmit={handleSubmit}>
          <VStack spacing={5} align="stretch">
            <Box>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                autoComplete="email"
                isRequired
                size="lg"
                focusBorderColor="#0052cc"
              />
            </Box>
            <Box>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                autoComplete="current-password"
                isRequired
                size="lg"
                focusBorderColor="#0052cc"
              />
            </Box>
            {error && (
              <Alert status="error" borderRadius="md">
                {error}
              </Alert>
            )}
            <Button type="submit" bg="#0052cc" color="#fff" _hover={{ bg: '#0747a6' }} size="lg" w="full" fontWeight="bold">
              Login
            </Button>
          </VStack>
        </form>
        <Text mt={8} textAlign="center" color="gray.500" fontSize="sm">
          Powered by CRM • Inspired by Trello & Jira
        </Text>
      </Box>
    </Flex>
  );
}

