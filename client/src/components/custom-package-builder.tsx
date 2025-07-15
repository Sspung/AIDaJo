import React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Plus, 
  Minus, 
  MessageSquare, 
  Image, 
  Video, 
  Mic, 
  Code,
  Package,
  DollarSign,
  Save,
  X
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { AiTool } from "@shared/schema";

interface CustomPackageBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SelectedTool extends AiTool {
  role: string;
}

const categoryIcons = {
  "텍스트": MessageSquare,
  "이미지": Image,
  "영상": Video,
  "음성": Mic,
  "코딩": Code,
};

const pricingLabels = {
  "free": "무료",
  "freemium": "일부 무료", 
  "paid": "유료"
};

const pricingColors = {
  "free": "green",
  "freemium": "yellow",
  "paid": "red"
};

export default function CustomPackageBuilder({ isOpen, onClose }: CustomPackageBuilderProps) {
  const { language, t } = useLanguage();
  const [selectedTools, setSelectedTools] = useState<SelectedTool[]>([]);
  const [packageName, setPackageName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const { data: aiTools = [] } = useQuery<AiTool[]>({
    queryKey: ["/api/ai-tools"],
    enabled: isOpen
  });

  const categories = ["전체", "텍스트", "이미지", "영상", "음성", "코딩"];
  const filteredTools = selectedCategory === "전체" 
    ? aiTools 
    : aiTools.filter(tool => tool.category === selectedCategory);

  const addTool = (tool: AiTool) => {
    if (selectedTools.find(t => t.id === tool.id)) return;
    
    const role = prompt(`${tool.name}의 역할을 입력해주세요 (예: 텍스트 생성, 이미지 편집 등)`);
    if (!role) return;

    setSelectedTools(prev => [...prev, { ...tool, role }]);
  };

  const removeTool = (toolId: number) => {
    setSelectedTools(prev => prev.filter(t => t.id !== toolId));
  };

  const calculateEstimatedCost = () => {
    let minCost = 0;
    let maxCost = 0;

    selectedTools.forEach(tool => {
      if (tool.pricing === "free") {
        // Free tools don't add to cost
      } else if (tool.pricing === "freemium") {
        minCost += 0;
        maxCost += 15; // Estimated freemium upgrade cost
      } else if (tool.pricing === "paid") {
        minCost += 10;
        maxCost += 30; // Estimated paid tool cost range
      }
    });

    if (minCost === maxCost) {
      return minCost === 0 ? t("package.free") : `$${minCost}`;
    }
    return minCost === 0 ? `~$${maxCost}` : `$${minCost}-${maxCost}`;
  };

  const handleSave = () => {
    if (!packageName || selectedTools.length === 0) {
      alert(t("language") === "ko" ? "패키지 이름과 최소 1개의 AI 도구를 선택해주세요." : "Please enter a package name and select at least 1 AI tool.");
      return;
    }

    // Here you would typically save to backend
    const message = t("language") === "ko" 
      ? `"${packageName}" 패키지가 생성되었습니다!\n포함된 도구: ${selectedTools.length}개`
      : `"${packageName}" package has been created!\nIncluded tools: ${selectedTools.length}`;
    alert(message);
    handleClose();
  };

  const handleClose = () => {
    setSelectedTools([]);
    setPackageName("");
    setPackageDescription("");
    setSelectedCategory("전체");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <Package className="mr-2 h-5 w-5" />
            {t("package.create_title")}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Tool Selection */}
          <div className="border-r pr-6">
            <h3 className="text-lg font-semibold mb-4">{t("package.select_tools")}</h3>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid grid-cols-6 w-full">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category === "전체" ? t("tools.filter_all") :
                     category === "텍스트" ? t("tools.filter_text") :
                     category === "이미지" ? t("tools.filter_image") :
                     category === "영상" ? t("tools.filter_video") :
                     category === "음성" ? t("tools.filter_voice") :
                     category === "코딩" ? t("tools.filter_coding") : category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <div className="mt-4 max-h-[450px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredTools.map((tool) => {
                    const IconComponent = categoryIcons[tool.category as keyof typeof categoryIcons] || MessageSquare;
                    const isSelected = selectedTools.find(t => t.id === tool.id);
                    const pricingColor = pricingColors[tool.pricing as keyof typeof pricingColors] || "gray";
                    const pricingLabel = pricingLabels[tool.pricing as keyof typeof pricingLabels] || tool.pricing;

                    return (
                      <Card 
                        key={tool.id} 
                        className={`cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary hover:bg-primary/5'
                        }`}
                        onClick={() => isSelected ? removeTool(tool.id) : addTool(tool)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <IconComponent className="h-4 w-4 text-primary mr-2" />
                              <h4 className="font-medium text-sm">{tool.name}</h4>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge 
                                variant="secondary" 
                                className={`text-xs px-1 py-0 bg-${pricingColor}-100 text-${pricingColor}-800`}
                              >
                                {pricingLabel}
                              </Badge>
                              {isSelected ? (
                                <Minus className="h-4 w-4 text-red-500" />
                              ) : (
                                <Plus className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{language === "ko" ? tool.description : tool.descriptionEn || tool.description}</p>
                          <div className="text-xs text-gray-500">
                            {t("ranking.monthly_users")}: {tool.monthlyUsers}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </Tabs>
          </div>

          {/* Package Configuration */}
          <div className="flex flex-col">
            <div className="mb-4">
              <Label htmlFor="packageName" className="text-sm font-medium text-gray-700 mb-2 block">
                {t("package.name")}
              </Label>
              <Input
                id="packageName"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder={language === "ko" ? "예: 나만의 콘텐츠 제작 패키지" : "e.g. My Content Creation Package"}
                className="mb-3"
              />
              
              <Label htmlFor="packageDescription" className="text-sm font-medium text-gray-700 mb-2 block">
                {t("package.description")}
              </Label>
              <Textarea
                id="packageDescription"
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder={language === "ko" ? "이 패키지의 목적과 활용 방법을 설명해주세요..." : "Describe the purpose and usage of this package..."}
                rows={3}
                className="mb-4"
              />
            </div>

            {/* Selected Tools */}
            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                {t("package.selected_tools")} ({selectedTools.length}{language === "ko" ? "개" : ""})
              </Label>
              <div className="max-h-[200px] overflow-y-auto border rounded-lg p-2 bg-gray-50">
                {selectedTools.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    {language === "ko" ? "AI 도구를 선택해주세요" : "Please select AI tools"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedTools.map((tool) => (
                      <div 
                        key={tool.id} 
                        className="flex items-center justify-between p-2 bg-white rounded border"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm">{tool.name}</div>
                          <div className="text-xs text-gray-600">{tool.role}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTool(tool.id)}
                          className="h-6 w-6 text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cost Estimation */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{t("package.estimated_cost")}</span>
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-lg font-bold text-gray-900">
                    {calculateEstimatedCost()}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                {language === "ko" ? "실제 비용은 사용량과 요금제에 따라 달라질 수 있습니다." : "Actual costs may vary based on usage and pricing plans."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button 
                onClick={handleSave}
                className="flex-1"
                disabled={!packageName || selectedTools.length === 0}
              >
                <Save className="mr-2 h-4 w-4" />
                {t("package.save")}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                {t("package.cancel")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}