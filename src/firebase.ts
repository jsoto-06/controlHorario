import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  setDoc,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { YearSchedule } from './types';

// Initialize Firebase app once
const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

// CRITICAL: getFirestore with custom database ID from config
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Error logging helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Test connection to Firestore on app boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline. Please check network connection.');
    }
    return false;
  }
}

// Real-time synchronization of schedules
export function subscribeToSchedules(
  onUpdate: (schedules: YearSchedule[]) => void,
  onError?: (err: unknown) => void
): () => void {
  const schedulesCollection = collection(db, 'schedules');
  return onSnapshot(
    schedulesCollection,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => d.data() as YearSchedule);
      if (docs.length > 0) {
        onUpdate(docs);
      }
    },
    (error) => {
      console.warn('Firestore snapshot error on schedules:', error);
      if (onError) onError(error);
    }
  );
}

// Save or update an annual schedule in Firestore
export async function saveScheduleToFirestore(schedule: YearSchedule): Promise<void> {
  const path = `schedules/${schedule.year}`;
  try {
    const docRef = doc(db, 'schedules', String(schedule.year));
    await setDoc(docRef, schedule, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Real-time synchronization of user credentials (PINs and roles)
export function subscribeToUserCredentials(
  onUpdate: (credentials: Record<string, { pin: string; role?: string }>) => void
): () => void {
  const credsCollection = collection(db, 'user_credentials');
  return onSnapshot(
    credsCollection,
    (snapshot) => {
      const map: Record<string, { pin: string; role?: string }> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.userId && data.pin) {
          map[data.userId] = { pin: data.pin, role: data.role };
        }
      });
      onUpdate(map);
    },
    (error) => {
      console.warn('Firestore snapshot error on user_credentials:', error);
    }
  );
}

// Save or update user PIN in Firestore
export async function saveUserCredentialToFirestore(
  userId: string,
  pin: string,
  role?: string
): Promise<void> {
  const path = `user_credentials/${userId}`;
  try {
    const docRef = doc(db, 'user_credentials', userId);
    await setDoc(
      docRef,
      {
        userId,
        pin,
        role: role || 'worker',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
