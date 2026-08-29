// src/services/privilegedAccessService.ts
import { auth } from '../config/firebase';

/**
 * Lista de emails con acceso privilegiado gratuito.
 * Incluye: superusuarios, cuentas de prueba, alianzas B2G/B2B.
 * Esta lista es PÚBLICA (solo define quién tiene acceso gratuito;
 * el backend valida realmente contra Firestore al activar la cuenta).
 */
export const PRIVILEGED_EMAILS: string[] = [
  'jorge.orlando.gonzalez@gmail.com'
];

export interface PrivilegedStatus {
  isPrivileged: boolean;
  type?: 'superuser' | 'b2g' | 'b2b' | 'test';
  label?: string;
  color?: string;
}

/**
 * Verifica si el usuario actual tiene acceso privilegiado.
 * - Primero revisa la lista pública (rápido, offline)
 * - Opcionalmente verifica contra Firestore (en Fase 1.5)
 */
export const checkPrivilegedAccess = (): PrivilegedStatus => {
  const user = auth?.currentUser;
  if (!user?.email) return { isPrivileged: false };
  
  const email = user.email.toLowerCase().trim();
  
  if (PRIVILEGED_EMAILS.includes(email)) {
    return {
      isPrivileged: true,
      type: 'superuser',
      label: '👑 Superusuario Pruebas',
      color: 'amber'
    };
  }
  
  // Futuro: verificar en Firestore colecciones 'b2g_accounts' y 'b2b_accounts'
  
  return { isPrivileged: false };
};

/**
 * Verifica si el email tiene acceso privilegiado (sin depender de auth state).
 * Útil para validaciones tempranas.
 */
export const isPrivilegedEmail = (email: string): boolean => {
  return PRIVILEGED_EMAILS.includes(email.toLowerCase().trim());
};
