"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  VStack,
  Flex,
  Text,
  Icon,
  Button,
} from "@chakra-ui/react";
import { useAuth } from '../../src/auth/AuthProvider';
import { FiGrid, FiUsers, FiUser, FiBriefcase, FiCheckSquare, FiClock, FiSettings } from "react-icons/fi";


const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: FiGrid },
  { href: "/accounts", label: "Accounts", icon: FiUsers },
  { href: "/contacts", label: "Contacts", icon: FiUser, admin: true },
  { href: "/deals", label: "Deals", icon: FiBriefcase },
  { href: "/tasks", label: "Tasks", icon: FiCheckSquare },
  { href: "/time", label: "Time Tracking", icon: FiClock, admin: true },

  { href: "/profile", label: "Profile", icon: FiUser },
  { href: "/reports", label: "Reports", icon: FiSettings, admin: true },
];



export default function Sidebar({ className = "", onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const handleLogout = () => {
    logout();
    router.replace('/login');
    if (onClose) onClose();
  };
  return (
    <Box
      className={className}
      bg="#f8fafc"
      minH="100vh"
      w="240px"
      px={0}
      py={0}
      position="fixed"
      left={0}
      top={0}
      borderRight="1px solid #e5e7eb"
      zIndex={10}
      fontFamily="'Inter', system-ui, 'Segoe UI', 'Roboto', 'Arial', sans-serif"
    >
      <Flex align="center" mb={6} gap={2} px={4} py={5} bg="transparent" borderBottom="1px solid #e5e7eb">
        <Icon viewBox="0 0 32 32" boxSize={7} color="#2563eb">
          <circle cx="16" cy="16" r="16" fill="#2563eb" />
          <text x="16" y="21" textAnchor="middle" fontSize="16" fill="#fff" fontFamily="Arial">CRM</text>
        </Icon>
        <Text fontWeight={700} fontSize="lg" color="#23272f">CRM</Text>
        {onClose && (
          <Button aria-label="Close sidebar" onClick={onClose} ml="auto" size="sm" bg="#f8fafc" color="#23272f" _hover={{ bg: '#e5e7eb' }}>
            ×
          </Button>
        )}
      </Flex>
      <VStack align="stretch" spacing={0} px={1}>
        {navItems.map((item) => {
          if (item.admin && !isAdmin) return null;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <Button
                leftIcon={<item.icon size={18} color={isActive ? '#2563eb' : '#64748b'} />}
                variant="ghost"
                fontWeight={isActive ? 600 : 400}
                justifyContent="flex-start"
                w="full"
                size="md"
                borderRadius="md"
                bg={isActive ? '#e9effd' : 'transparent'}
                color={isActive ? '#23272f' : '#64748b'}
                _hover={{ bg: '#f1f5f9', color: '#23272f' }}
                mb={0}
                fontSize="14px"
                pl={5}
                pr={2}
                style={{ letterSpacing: 0.2, transition: 'background 0.15s, color 0.15s' }}
                onClick={onClose}
              >
                {item.label}
              </Button>
            </Link>
          );
        })}
      </VStack>
      <Box px={4} mt={8}>
        <Button
          onClick={handleLogout}
          w="full"
          colorScheme="red"
          variant="outline"
          borderRadius="md"
          fontWeight={700}
          fontSize="15px"
          leftIcon={<span style={{fontWeight:900}}>&#x21bb;</span>}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
