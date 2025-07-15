import React from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const { language } = useLanguage();

  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={goBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {language === "ko" ? "뒤로가기" : "Back"}
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              {language === "ko" ? "서비스 이용약관" : "Terms of Service"}
            </h1>
          </div>

          <div className="prose max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. 서비스 개요</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  AI DaJo는 다양한 인공지능(AI) 도구를 한 곳에서 통합적으로 제공하는 플랫폼입니다. 
                  사용자는 Google 계정을 통해 간편하게 로그인하고, 목적에 맞는 AI 도구 추천, 
                  커스텀 패키지 생성 및 저장, 사용 기록 기반 분석 등의 기능을 이용할 수 있습니다.
                </p>
                <p>
                  AI DaJo는 기업 및 개인 고객 모두를 대상으로 다양한 AI 도구를 패키지 형태로 
                  제공할 예정이며, 이를 기반으로 한 상업적 제휴와 유료 상품 판매를 준비 중입니다. 
                  Google OAuth 인증을 통해 사용자 이메일 및 기본 프로필 정보를 안전하게 수집·활용하며, 
                  개인화된 서비스를 제공합니다.
                </p>
                <p>
                  현재는 정식 서비스 런칭을 위한 준비 단계이며, 사용자 편의성과 데이터 보안을 
                  최우선으로 고려하여 개발 중입니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. 서비스 이용 조건</h2>
              <div className="text-gray-700 space-y-4">
                <h4 className="font-medium">2.1 가입 자격</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>만 14세 이상의 개인 또는 법인</li>
                  <li>유효한 Google 계정을 보유한 사용자</li>
                  <li>본 약관에 동의하는 사용자</li>
                </ul>
                
                <h4 className="font-medium mt-4">2.2 계정 관리</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Google OAuth를 통한 안전한 로그인</li>
                  <li>계정 정보의 정확성 유지 의무</li>
                  <li>계정 보안에 대한 사용자 책임</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. 제공 서비스</h2>
              <div className="text-gray-700 space-y-4">
                <h4 className="font-medium">3.1 무료 서비스</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI 도구 탐색 및 비교</li>
                  <li>개인화된 AI 도구 추천 퀴즈</li>
                  <li>카테고리별 AI 도구 순위 확인</li>
                  <li>기본적인 사용량 분석</li>
                </ul>
                
                <h4 className="font-medium mt-4">3.2 프리미엄 서비스 (준비 중)</h4>
                <ul className="list-disc pl-6 space-y-2">
                  <li>커스텀 AI 패키지 무제한 생성</li>
                  <li>상세한 사용량 분석 및 리포트</li>
                  <li>기업용 AI 도구 패키지</li>
                  <li>우선 고객 지원</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. 사용자 의무</h2>
              <div className="text-gray-700 space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>서비스를 합법적인 목적으로만 이용</li>
                  <li>다른 사용자의 권리 침해 금지</li>
                  <li>시스템 보안을 위협하는 행위 금지</li>
                  <li>허위 정보 제공 금지</li>
                  <li>상업적 목적의 무단 사용 금지</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. 개인정보 보호</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  사용자의 개인정보 보호는 별도의 개인정보처리방침에 따라 처리됩니다. 
                  Google OAuth를 통해 수집되는 기본 프로필 정보(이메일, 이름, 프로필 이미지)는 
                  서비스 제공 목적으로만 사용되며, 사용자의 동의 없이 제3자에게 제공되지 않습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. 서비스 변경 및 중단</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  회사는 서비스의 품질 향상, 기술적 필요, 정책 변경 등의 사유로 서비스의 
                  전부 또는 일부를 변경하거나 중단할 수 있습니다. 중대한 변경사항이 있을 경우 
                  사전에 공지하겠습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. 책임 제한</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  AI DaJo는 플랫폼 서비스 제공자로서, 제3자 AI 도구의 성능이나 결과에 대해 
                  직접적인 책임을 지지 않습니다. 사용자는 각 AI 도구의 이용약관을 확인하고 
                  자신의 판단 하에 사용해야 합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. 분쟁 해결</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  본 약관과 관련된 분쟁은 대한민국 법률에 따라 해결되며, 
                  관할 법원은 서울중앙지방법원으로 합니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. 약관 변경</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  본 약관은 필요에 따라 변경될 수 있으며, 변경된 약관은 웹사이트를 통해 
                  공지됩니다. 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단할 수 있습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. 문의처</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">서비스 관련 문의</h4>
                <p className="text-sm text-gray-700 mb-1">운영팀: AI DaJo</p>
                <p className="text-sm text-gray-700 mb-1">이메일: foraitree@gmail.com</p>
                <p className="text-sm text-gray-700">
                  서비스 이용 중 문의사항이나 문제가 발생하시면 언제든지 연락해 주세요.
                </p>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200 text-center text-gray-500">
              <p>시행일: 2024년 6월 24일</p>
              <p className="mt-2">© 2024 AI DaJo. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}