import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { 
  Video, 
  PenTool, 
  BarChart3, 
  ShoppingCart, 
  GraduationCap, 
  Code 
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { AiBundle } from "@shared/schema";

interface BundleCardProps {
  bundle: AiBundle;
}

const iconMap = {
  "video": Video,
  "pen-fancy": PenTool,
  "chart-bar": BarChart3,
  "shopping-cart": ShoppingCart,
  "graduation-cap": GraduationCap,
  "code": Code,
};

const colorMap = {
  "red": {
    bg: "from-red-50 to-pink-50",
    border: "border-red-200",
    icon: "bg-red-500",
    button: "bg-red-500 hover:bg-red-600"
  },
  "blue": {
    bg: "from-blue-50 to-indigo-50", 
    border: "border-blue-200",
    icon: "bg-blue-500",
    button: "bg-blue-500 hover:bg-blue-600"
  },
  "green": {
    bg: "from-green-50 to-teal-50",
    border: "border-green-200", 
    icon: "bg-green-500",
    button: "bg-green-500 hover:bg-green-600"
  },
  "purple": {
    bg: "from-purple-50 to-pink-50",
    border: "border-purple-200",
    icon: "bg-purple-500", 
    button: "bg-purple-500 hover:bg-purple-600"
  },
  "yellow": {
    bg: "from-yellow-50 to-orange-50",
    border: "border-yellow-200",
    icon: "bg-yellow-500",
    button: "bg-yellow-500 hover:bg-yellow-600"
  },
  "gray": {
    bg: "from-gray-50 to-blue-50",
    border: "border-gray-300",
    icon: "bg-gray-700",
    button: "bg-gray-700 hover:bg-gray-800"
  }
};

const pricingColors = {
  "free": "green",
  "freemium": "yellow", 
  "paid": "red"
};

export default function BundleCard({ bundle }: BundleCardProps) {
  const { language, t } = useLanguage();
  const IconComponent = iconMap[bundle.icon as keyof typeof iconMap] || Video;
  const colors = colorMap[bundle.color as keyof typeof colorMap] || colorMap.blue;

  return (
    <Card className={`bundle-card bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all duration-200`}>
      <CardContent className="p-0">
        <div className="mb-4">
          <div className={`w-12 h-12 ${colors.icon} rounded-lg flex items-center justify-center mb-3`}>
            <IconComponent className="text-white h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">{language === "ko" ? bundle.name : bundle.nameEn || bundle.name}</h3>
          <p className="text-gray-600 text-sm mt-2">{language === "ko" ? bundle.description : bundle.descriptionEn || bundle.description}</p>
        </div>

        <div className="space-y-3 mb-6">
          {bundle.tools.map((tool, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center">
                <div className={`w-8 h-8 ${colors.icon.replace('bg-', 'bg-').replace('-500', '-100')} rounded-full flex items-center justify-center mr-3`}>
                  <IconComponent className={`${colors.icon.replace('bg-', 'text-').replace('-500', '-600')} h-4 w-4`} />
                </div>
                <div>
                  <div className="font-medium text-sm">{tool.name}</div>
                  <div className="text-xs text-gray-500">{tool.role}</div>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs px-2 py-1 rounded-full font-medium bg-${pricingColors[tool.pricing as keyof typeof pricingColors]}-100 text-${pricingColors[tool.pricing as keyof typeof pricingColors]}-800`}
              >
                {tool.pricing === 'free' ? t("tools.pricing_free") : 
                 tool.pricing === 'freemium' ? t("tools.pricing_freemium") : 
                 t("tools.pricing_paid")}
              </Badge>
            </div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">{t("bundle.estimated_cost")}</span>
            <span className="text-lg font-bold text-gray-900">{bundle.estimatedCost}</span>
          </div>
          <Button 
            className={`w-full ${colors.button} text-white py-2 rounded-lg transition-colors`}
            onClick={() => window.location.href = `/bundle-detail/${bundle.id}`}
          >
            {t("bundle.start_package")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
