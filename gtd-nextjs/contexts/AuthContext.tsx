'use client';

import React, { createContext, useContext } from 'react';
import { User } from '@/lib/types';
import { SessionProvider, useSession } from 'next-auth/react';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

function AuthProviderContent({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const isLoading = status === 'loading';

    // Cast session user to our User type (it might differ slightly, but for now map it)
    const user = session?.user as User | null;

    // @ts-ignore - role might not be fully typed in session yet depending on module augmentation
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, isLoading, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <AuthProviderContent>{children}</AuthProviderContent>
        </SessionProvider>
    );
};

