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
  { href: "/accounts", label: "Kunden", icon: FiUsers },
  { href: "/contacts", label: "Kontakte", icon: FiUser, admin: true },
  { href: "/deals", label: "Deals", icon: FiBriefcase },
  { href: "/tasks", label: "Aufgaben", icon: FiCheckSquare },
  { href: "/time", label: "Zeiterfassung", icon: FiClock, admin: true },
  { href: "/users", label: "Benutzer", icon: FiUsers, admin: true },
  { href: "/profile", label: "Profil", icon: FiUser },
  { href: "/reports", label: "Berichte", icon: FiSettings, admin: true },
];



export default function Sidebar({ className = "", onClose }: { className?: string; onClose?: () => void }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { user, logout } = useAuth();
  console.log('[Sidebar] user from useAuth:', JSON.stringify(user, null, 2));
  const isAdmin = user?.role === 'ADMIN';
  const handleLogout = () => {
    logout();
    router.replace('/login');
    if (onClose) onClose();
  };
  return (
    <Box
      className={className}
      bg="#f4f5f7"
      minH="100vh"
      w="220px"
      px={0}
      py={0}
      position="fixed"
      left={0}
      top={0}
      borderRight="1px solid #d1d5db"
      boxShadow="0 0 8px 0 rgba(0,0,0,0.03)"
      zIndex={10}
      fontFamily="'Inter', system-ui, 'Segoe UI', 'Roboto', 'Arial', sans-serif"
    >
      <Flex align="center" mb={4} gap={0} px={3} py={3} bg="transparent" borderBottom="1px solid #d1d5db">
        <img src="/logoip3.png" alt="Logo" style={{ height: 36, marginRight: 12, display: 'block' }} />
        {onClose && (
          <Button aria-label="Close sidebar" onClick={onClose} ml="auto" size="sm" bg="#f4f5f7" color="#23272f" _hover={{ bg: '#e5e7eb' }} borderRadius="sm">
            ×
          </Button>
        )}
      </Flex>
      <Box px={3} pt={2} pb={1}>
        <Text fontSize="13px" fontWeight={600} color="#23272f" mb={2} letterSpacing="0.02em">Navigation</Text>
      </Box>
      <VStack align="stretch" spacing={0} px={2}>
        {navItems.map((item) => {
          if (item.admin && !isAdmin) return null;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <Button
                leftIcon={<item.icon size={17} color={isActive ? '#1e293b' : '#6b7280'} />}
                variant="solid"
                fontWeight={isActive ? 700 : 500}
                justifyContent="flex-start"
                w="full"
                size="sm"
                borderRadius="sm"
                bg={isActive ? '#e5e7eb' : 'transparent'}
                color={isActive ? '#1e293b' : '#6b7280'}
                _hover={{ bg: '#e5e7eb', color: '#23272f' }}
                mb={0}
                fontSize="13px"
                pl={4}
                pr={2}
                style={{ letterSpacing: '0.02em', transition: 'background 0.15s, color 0.15s' }}
                onClick={onClose}
              >
                {item.label}
              </Button>
            </Link>
          );
        })}
      </VStack>
      <Box px={3} pt={2} pb={1} mt={6} borderTop="1px solid #d1d5db">
        <Text fontSize="13px" fontWeight={600} color="#23272f" mb={2} letterSpacing="0.02em">Account</Text>
        <Button
          onClick={handleLogout}
          w="full"
          bg="#f4f5f7"
          color="#1e293b"
          variant="outline"
          borderRadius="sm"
          fontWeight={600}
          fontSize="13px"
          leftIcon={<FiSettings size={16} color="#1e293b" />}
          borderColor="#d1d5db"
          _hover={{ bg: '#e5e7eb', color: '#23272f', borderColor: '#d1d5db' }}
        >
          Abmelde
        </Button>
      </Box>
    </Box>
  );
}
