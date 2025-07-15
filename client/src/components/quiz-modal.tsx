import React from "react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import type { QuizQuestion, AiTool } from "@shared/schema";

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecommendationResult extends AiTool {
  matchPercentage: number;
}

export default function QuizModal({ isOpen, onClose }: QuizModalProps) {
  const { language, t } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  
  const { data: questions = [] } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/quiz/questions"],
    enabled: isOpen
  });

  const recommendationMutation = useMutation({
    mutationFn: async (answers: Record<string, string>) => {
      const response = await fetch("/api/quiz/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });
      if (!response.ok) throw new Error("Failed to get recommendations");
      return response.json();
    },
    onSuccess: () => {
      setShowResults(true);
    }
  });

  const getFilteredQuestions = () => {
    if (!questions || questions.length === 0) return [];
    
    const firstAnswer = answers["q1"];
    
    // 항상 첫 번째 질문은 포함
    let filteredQuestions = [questions[0]];
    
    if (!firstAnswer) {
      return filteredQuestions;
    }
    
    // 첫 번째 답변에 따라 조건부 질문 추가
    const conditionalQuestion = questions.find(q => q.parentOption === firstAnswer);
    if (conditionalQuestion) {
      filteredQuestions.push(conditionalQuestion);
    }
    
    // 나머지 일반 질문들 (parentOption이 없는 질문들) 추가
    const generalQuestions = questions.filter(q => !q.parentOption && q.order > 1)
      .sort((a, b) => a.order - b.order);
    
    filteredQuestions = [...filteredQuestions, ...generalQuestions];
    
    return filteredQuestions;
  };

  const filteredQuestions = getFilteredQuestions();
  const totalQuestions = filteredQuestions.length;
  const currentQuestionData = questions[currentQuestion];
  const currentQuestionIndex = filteredQuestions.findIndex(q => q.id === currentQuestionData?.id);
  const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswerSelect = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [`q${currentQuestion + 1}`]: value
    }));
  };

  const getNextQuestion = () => {
    const filteredQuestions = getFilteredQuestions();
    const currentQuestionData = questions[currentQuestion];
    const currentIndex = filteredQuestions.findIndex(q => q.id === currentQuestionData?.id);
    
    if (currentIndex < filteredQuestions.length - 1) {
      const nextQ = filteredQuestions[currentIndex + 1];
      const nextQuestionIndex = questions.findIndex(q => q.id === nextQ.id);
      return nextQuestionIndex;
    }
    return -1; // 마지막 질문
  };

  const handleNext = () => {
    const nextQuestionIndex = getNextQuestion();
    if (nextQuestionIndex !== -1) {
      setCurrentQuestion(nextQuestionIndex);
    } else {
      // Submit quiz - 마지막 질문에 도달
      recommendationMutation.mutate(answers);
    }
  };

  const handlePrevious = () => {
    const filteredQuestions = getFilteredQuestions();
    const currentQuestionData = questions[currentQuestion];
    const currentIndex = filteredQuestions.findIndex(q => q.id === currentQuestionData?.id);
    
    if (currentIndex > 0) {
      const prevQ = filteredQuestions[currentIndex - 1];
      const prevQuestionIndex = questions.findIndex(q => q.id === prevQ.id);
      setCurrentQuestion(prevQuestionIndex);
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    onClose();
  };

  const currentAnswer = answers[`q${currentQuestion + 1}`];
  const canProceed = currentAnswer || showResults;

  if (questions.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {showResults ? t("quiz.results_title") : t("quiz.title")}
          </DialogTitle>
        </DialogHeader>

        {!showResults ? (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">{t("quiz.progress")}</span>
                <span className="text-sm font-medium text-primary">
                  {currentQuestionIndex + 1}/{totalQuestions}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Question */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6">
                {t("language") === "ko" ? questions[currentQuestion]?.question : questions[currentQuestion]?.questionEn || questions[currentQuestion]?.question}
              </h3>
              <div className="space-y-3">
                {questions[currentQuestion]?.options.map((option: any) => (
                  <label
                    key={option.value}
                    className={`quiz-option flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      currentAnswer === option.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-primary hover:bg-primary/5"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q${currentQuestion + 1}`}
                      value={option.value}
                      checked={currentAnswer === option.value}
                      onChange={(e) => handleAnswerSelect(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">{t("language") === "ko" ? option.label : option.labelEn || option.label}</div>
                      {option.description && (
                        <div className="text-sm text-gray-600">{t("language") === "ko" ? option.description : option.descriptionEn || option.description}</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {t("quiz.previous")}
              </Button>
              <Button 
                onClick={handleNext}
                disabled={!currentAnswer || recommendationMutation.isPending}
              >
                {recommendationMutation.isPending ? (
                  t("quiz.analyzing")
                ) : currentQuestionIndex === totalQuestions - 1 ? (
                  t("quiz.show_results")
                ) : (
                  <>
                    {t("quiz.next")}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          /* Results */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-primary h-8 w-8" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">{t("quiz.results_title")}</h4>
            <p className="text-gray-600 mb-6">{t("quiz.results_subtitle")}</p>
            
            {recommendationMutation.data && (
              <div className="space-y-6">
                {/* AI 도구 추천 */}
                <div>
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {language === "ko" ? "추천 AI 도구" : "Recommended AI Tools"}
                  </h4>
                  <div className="space-y-4">
                    {recommendationMutation.data.tools?.slice(0, 5).map((tool: RecommendationResult, index: number) => {
                      const isTop = index === 0;
                      const medalColors = [
                        'border-yellow-400 bg-yellow-50',
                        'border-gray-300 bg-gray-50', 
                        'border-orange-400 bg-orange-50',
                        'border-blue-300 bg-blue-50',
                        'border-green-300 bg-green-50'
                      ];
                      const badgeColors = [
                        'bg-yellow-100 text-yellow-800',
                        'bg-gray-100 text-gray-800',
                        'bg-orange-100 text-orange-800', 
                        'bg-blue-100 text-blue-800',
                        'bg-green-100 text-green-800'
                      ];
                      
                      return (
                        <Card key={tool.id} className={`text-left ${medalColors[index] || 'border-gray-200 bg-gray-50'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-900 flex items-center">
                                {isTop && <span className="mr-2 text-yellow-500">👑</span>}
                                {index + 1}. {tool.name}
                              </h5>
                              <Badge variant="secondary" className={`text-xs px-2 py-1 rounded-full ${badgeColors[index] || 'bg-gray-100 text-gray-800'}`}>
                                {tool.matchPercentage}% {t("quiz.match")}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{language === "ko" ? tool.description : tool.descriptionEn || tool.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {tool.company} | {tool.pricing === 'free' ? t("tools.pricing_free") : tool.pricing === 'freemium' ? t("tools.pricing_freemium") : t("tools.pricing_paid")}
                              </div>
                              <a 
                                href={tool.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80 text-sm font-medium flex items-center"
                              >
                                {t("tools.visit_website")} <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* AI 패키지 추천 */}
                {recommendationMutation.data.packages && recommendationMutation.data.packages.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {language === "ko" ? "추천 AI 패키지" : "Recommended AI Packages"}
                    </h4>
                    <div className="space-y-4">
                      {recommendationMutation.data.packages.slice(0, 3).map((pkg: any, index: number) => (
                        <Card key={pkg.id} className="text-left border-l-4 border-green-500 bg-green-50">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold text-gray-900 flex items-center">
                                <span className="mr-2 text-green-500">📦</span>
                                {language === "ko" ? pkg.name : pkg.nameEn || pkg.name}
                              </h5>
                              <Badge variant="outline" className="text-xs border-green-500 text-green-700">
                                {language === "ko" ? "패키지" : "Package"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-3">{language === "ko" ? pkg.description : pkg.descriptionEn || pkg.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-gray-500">
                                {pkg.category} | {pkg.estimatedCost} | {pkg.tools?.length || 0}개 도구
                              </div>
                              <button
                                onClick={() => window.open(`/bundle-detail/${pkg.id}`, '_blank')}
                                className="text-xs text-green-600 hover:text-green-800 font-medium"
                              >
                                자세히 보기 →
                              </button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8">
              <Button onClick={handleClose} className="mr-4">
                {t("quiz.try_again")}
              </Button>
              <Button variant="outline" onClick={handleClose}>
                {t("common.close")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
