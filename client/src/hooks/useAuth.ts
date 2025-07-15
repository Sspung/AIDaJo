import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("로그아웃 실패");
      }
      return response.json();
    },
    onSuccess: () => {
      // 로그아웃 성공 시 캐시를 무효화하고 홈페이지로 이동
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      window.location.href = "/";
    },
  });

  const loginWithGoogle = () => {
    window.location.href = "/api/auth/google";
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
    isLoggingOut: logoutMutation.isPending,
  };
}