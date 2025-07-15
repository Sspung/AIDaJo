import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Trash2, Edit, Package, DollarSign, Calendar } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { authApiRequest } from "../lib/auth-request";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";
import { isUnauthorizedError } from "../lib/authUtils";
import type { CustomPackage } from "@shared/schema";

export default function MyPackages() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery<CustomPackage[]>({
    queryKey: ["/api/custom-packages"],
    enabled: isAuthenticated,
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (packageId: number) => {
      return await apiRequest("DELETE", `/api/custom-packages/${packageId}`);
    },
    onSuccess: () => {
      toast({
        title: "삭제 완료",
        description: "패키지가 성공적으로 삭제되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/custom-packages"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "권한 없음",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "삭제 실패",
        description: "패키지 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-8">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-4">
              내 커스텀 패키지를 보려면 로그인해주세요.
            </p>
            <Button onClick={() => window.location.href = "/api/login"}>
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeletePackage = (packageId: number, packageName: string) => {
    if (confirm(`"${packageName}" 패키지를 정말 삭제하시겠습니까?`)) {
      deletePackageMutation.mutate(packageId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">내 커스텀 패키지</h1>
          <p className="text-gray-600">
            직접 만든 AI 도구 패키지들을 관리하세요.
          </p>
        </div>

        {packages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                아직 생성된 패키지가 없습니다
              </h3>
              <p className="text-gray-600 mb-4">
                첫 번째 커스텀 AI 패키지를 만들어보세요!
              </p>
              <Button onClick={() => window.location.href = "/"}>
                패키지 만들기
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeletePackage(pkg.id, pkg.name)}
                        disabled={deletePackageMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                  {pkg.description && (
                    <p className="text-sm text-gray-600">{pkg.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">포함된 도구</span>
                      <Badge variant="outline">
                        {Array.isArray(pkg.tools) ? pkg.tools.length : 0}개
                      </Badge>
                    </div>
                    
                    {pkg.estimatedCost && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          {pkg.estimatedCost}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(pkg.createdAt!).toLocaleDateString('ko-KR')} 생성
                      </span>
                    </div>

                    {Array.isArray(pkg.tools) && pkg.tools.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-500 mb-2">포함된 도구:</p>
                        <div className="space-y-1">
                          {pkg.tools.slice(0, 3).map((tool: any, index: number) => (
                            <div key={index} className="text-xs text-gray-700">
                              • {tool.name}
                            </div>
                          ))}
                          {pkg.tools.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{pkg.tools.length - 3}개 더...
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}