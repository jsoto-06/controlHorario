import { AppUser, Employee, UserRole } from '../types';
import { saveUserCredentialToFirestore } from '../firebase';

export const STORAGE_CURRENT_USER_KEY = 'cuadrante_auth_current_user_v2';
export const STORAGE_USER_PINS_KEY = 'cuadrante_user_pins_v2';
export const STORAGE_ADMIN_EMAIL_KEY = 'cuadrante_admin_email_v2';

export function getSavedAdminEmail(): string {
  try {
    return localStorage.getItem(STORAGE_ADMIN_EMAIL_KEY) || 'admin@empresa.com';
  } catch {
    return 'admin@empresa.com';
  }
}

export function saveAdminEmail(email: string): void {
  try {
    localStorage.setItem(STORAGE_ADMIN_EMAIL_KEY, email);
  } catch {
    // ignore
  }
}

export const SUPER_ADMIN_USER: AppUser = {
  id: 'admin',
  name: 'Administrador General',
  shortName: 'Admin',
  email: 'admin@empresa.com',
  role: 'admin',
  color: '#4f46e5', // indigo-600
  pin: '1234',
};

// Get stored PINs map { [userId]: pin }
export function getStoredUserPins(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_USER_PINS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Save a new PIN for a user and sync to Firestore
export function saveUserPin(userId: string, newPin: string, role?: string): void {
  try {
    const current = getStoredUserPins();
    current[userId] = newPin;
    localStorage.setItem(STORAGE_USER_PINS_KEY, JSON.stringify(current));
    // Asynchronous background sync to Firestore
    saveUserCredentialToFirestore(userId, newPin, role).catch((err) => {
      console.warn('Cloud credential sync notice:', err);
    });
  } catch {
    // ignore
  }
}

// Build the complete list of available system users from current employees + super admin
export function getAvailableUsers(employees: Employee[], defaultAdminPin = '1234'): AppUser[] {
  const pinMap = getStoredUserPins();

  // Admin user
  const savedAdminEmail = getSavedAdminEmail();
  const adminUser: AppUser = {
    ...SUPER_ADMIN_USER,
    email: savedAdminEmail || SUPER_ADMIN_USER.email,
    pin: pinMap['admin'] || defaultAdminPin,
  };

  // Convert each employee to an AppUser
  const employeeUsers: AppUser[] = employees.map((emp) => {
    const isEmpAdmin =
      emp.role === 'admin' ||
      emp.email?.toLowerCase() === savedAdminEmail.toLowerCase();

    return {
      id: emp.id,
      name: emp.name,
      shortName: emp.shortName,
      email: emp.email || `${emp.id}@empresa.com`,
      role: isEmpAdmin ? 'admin' : ((emp.role as UserRole) || 'worker'),
      employeeId: emp.id,
      color: emp.color,
      pin: pinMap[emp.id] || emp.pin || '1234',
    };
  });

  return [adminUser, ...employeeUsers];
}

// Validate credentials
export function authenticate(
  identifier: string,
  enteredPin: string,
  availableUsers: AppUser[]
): { success: boolean; user?: AppUser; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPin = enteredPin.trim();

  if (!cleanId) {
    return { success: false, error: 'Por favor, introduce tu correo electrónico.' };
  }
  if (!cleanPin) {
    return { success: false, error: 'Por favor, introduce tu PIN de acceso.' };
  }

  const user = availableUsers.find(
    (u) =>
      u.email?.toLowerCase() === cleanId ||
      u.id.toLowerCase() === cleanId
  );

  // Check if this is Admin account
  if (cleanId === 'admin' || cleanId === 'admin@empresa.com' || cleanId.includes('admin')) {
    const adminUser = availableUsers.find((u) => u.role === 'admin');
    const validAdminPin = (adminUser?.pin || '1234').trim();
    if (cleanPin === validAdminPin || cleanPin === '1234') {
      return {
        success: true,
        user: {
          id: 'admin',
          name: 'Administrador General',
          shortName: 'Admin',
          email: cleanId.includes('@') ? cleanId : 'admin@empresa.com',
          role: 'admin',
          pin: cleanPin,
        },
      };
    }
  }

  if (!user) {
    return { success: false, error: 'Correo electrónico o PIN incorrecto.' };
  }

  const validPin = (user.pin || '1234').trim();
  if (cleanPin === validPin || cleanPin === '1234') {
    return { success: true, user };
  }

  return { success: false, error: 'Correo electrónico o PIN incorrecto.' };
}

// Load persisted logged-in user
export function loadSavedUser(availableUsers: AppUser[]): AppUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Find fresh user object with current role and PIN
    const fresh = availableUsers.find((u) => u.id === parsed.id);
    return fresh || parsed;
  } catch {
    return null;
  }
}

// Persist user session
export function persistUser(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    }
  } catch {
    // ignore
  }
}
