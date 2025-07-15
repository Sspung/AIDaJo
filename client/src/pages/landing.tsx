import React from "react";
import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Star, Users, TrendingUp, Shield, Zap, Target } from "lucide-react";

export default function Landing() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-6">
            {t("landing.hero.badge")}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            {t("landing.hero.title")}
            <span className="text-blue-600">{t("landing.hero.highlight")}</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t("landing.hero.subtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              {t("landing.hero.cta")}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>{t("landing.hero.rating")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900">500+</div>
              <div className="text-sm text-gray-600">{t("landing.stats.tools")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">10K+</div>
              <div className="text-sm text-gray-600">{t("landing.stats.users")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">98%</div>
              <div className="text-sm text-gray-600">{t("landing.stats.satisfaction")}</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">20+</div>
              <div className="text-sm text-gray-600">{t("landing.stats.categories")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("landing.features.title")}
            </h2>
            <p className="text-lg text-gray-600">
              {t("landing.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6">
                <Target className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {t("landing.features.personalized.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("landing.features.personalized.desc")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Zap className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {t("landing.features.curated.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("landing.features.curated.desc")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {t("landing.features.analytics.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("landing.features.analytics.desc")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">
                  {t("landing.features.secure.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("landing.features.secure.desc")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t("landing.cta.title")}
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            {t("landing.cta.subtitle")}
          </p>
          
          <Button size="lg" variant="secondary" className="mb-8">
            {t("landing.cta.button")}
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center text-blue-100">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{t("landing.cta.benefit1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span>{t("landing.cta.benefit2")}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}