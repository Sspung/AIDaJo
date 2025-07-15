import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { ExternalLink, MessageSquare, Image, Video, Mic, Code, BarChart3 } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { AiTool } from "@shared/schema";

interface AiCardProps {
  tool: AiTool;
}

const iconMap = {
  "comment-alt": MessageSquare,
  "image": Image,
  "video": Video,
  "microphone": Mic,
  "code": Code,
  "chart-bar": BarChart3,
};

const categoryColors = {
  "텍스트": "blue",
  "이미지": "purple", 
  "영상": "red",
  "음성": "orange",
  "코딩": "gray",
  "분석": "green"
};

const pricingColors = {
  "free": "green",
  "freemium": "yellow",
  "paid": "red"
};

export default function AiCard({ tool }: AiCardProps) {
  const { language, t } = useLanguage();
  const IconComponent = iconMap[tool.iconCategory as keyof typeof iconMap] || MessageSquare;
  const categoryColor = categoryColors[tool.category as keyof typeof categoryColors] || "gray";
  const pricingColor = pricingColors[tool.pricing as keyof typeof pricingColors] || "gray";
  const pricingLabel = tool.pricing === 'free' ? t("tools.pricing_free") : 
                       tool.pricing === 'freemium' ? t("tools.pricing_freemium") : 
                       t("tools.pricing_paid");

  return (
    <Card className="ai-card bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{tool.name}</h3>
            <p className="text-gray-600">{tool.company}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-xs px-2 py-1 bg-${pricingColor}-100 text-${pricingColor}-800 rounded-full font-medium`}>
              {pricingLabel}
            </Badge>
            <Badge variant="secondary" className={`text-xs px-2 py-1 bg-${categoryColor}-100 text-${categoryColor}-800 rounded-full font-medium`}>
              {tool.category === "텍스트" ? t("tools.filter_text") :
               tool.category === "이미지" ? t("tools.filter_image") :
               tool.category === "영상" ? t("tools.filter_video") :
               tool.category === "음성" ? t("tools.filter_voice") :
               tool.category === "코딩" ? t("tools.filter_coding") : tool.category}
            </Badge>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 text-sm">{language === "ko" ? tool.description : tool.descriptionEn || tool.description}</p>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{t("tools.ease_of_use")}</span>
            <span>{tool.rating}%</span>
          </div>
          <Progress value={tool.rating} className="h-2" />
        </div>

        <div className="pros-cons mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-600 mb-2">{t("tools.pros")}</h4>
              <ul className="text-gray-600 space-y-1">
                {(language === "ko" ? tool.pros : tool.prosEn || tool.pros).slice(0, 3).map((pro, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-1">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-600 mb-2">{t("tools.cons")}</h4>
              <ul className="text-gray-600 space-y-1">
                {(language === "ko" ? tool.cons : tool.consEn || tool.cons).slice(0, 3).map((con, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-1">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{t("tools.monthly_users")}:</span> {tool.monthlyUsers}
          </div>
          <a 
            href={tool.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-medium text-sm flex items-center"
          >
            {t("tools.visit_website")} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
