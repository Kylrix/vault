import { useAppwriteVault } from '@/hooks/use-appwrite-vault';

export const useAuth = () => {
    const { user, loading, isAuthenticated, openIDMWindow, logout } = useAppwriteVault();

    return {
        user,
        isLoading: loading,
        isAuthenticated,
        login: openIDMWindow,
        logout
    };
};
