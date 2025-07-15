import React from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button 
          variant="ghost" 
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">개인정보보호지침</CardTitle>
            <p className="text-center text-gray-600">AI DaJo 서비스 이용 시 개인정보 처리에 관한 사항</p>
            <p className="text-center text-sm text-gray-500">최종 수정일: 2024년 12월 23일</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. 개인정보 처리방침 개요</h2>
              <p className="text-gray-700 leading-relaxed">
                AI DaJo(이하 '회사')는 정보통신망 이용촉진 및 정보보호 등에 관한 법률, 개인정보보호법 등 관련 법령에 따라 
                이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 
                개인정보 처리방침을 수립·공개합니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. 개인정보의 처리목적</h2>
              <div className="space-y-3">
                <p className="text-gray-700">회사는 다음의 목적을 위하여 개인정보를 처리합니다:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>회원 가입 및 관리 (본인 확인, 개인 식별, 가입 의사 확인)</li>
                  <li>AI 도구 추천 서비스 제공 (맞춤형 추천, 사용 기록 관리)</li>
                  <li>커스텀 패키지 생성 및 관리</li>
                  <li>서비스 개선 및 새로운 서비스 개발</li>
                  <li>고객 문의 및 불만 처리</li>
                  <li>법적 의무 이행 및 분쟁 해결</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. 수집하는 개인정보 항목</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">필수 수집 항목</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>이메일 주소</li>
                    <li>사용자 고유 식별자 (Replit 계정 ID)</li>
                    <li>프로필 정보 (이름, 프로필 이미지 - Replit에서 제공)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">자동 수집 항목</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                    <li>서비스 이용 기록</li>
                    <li>AI 도구 검색 및 사용 패턴</li>
                    <li>커스텀 패키지 생성 정보</li>
                    <li>접속 IP 주소, 쿠키, 서비스 이용 기록</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. 개인정보의 처리 및 보유기간</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집시에 동의받은 
                  개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>회원정보: 회원 탈퇴 시까지 (단, 관련 법령에 따라 별도 보관이 필요한 경우 해당 기간까지)</li>
                  <li>서비스 이용 기록: 3년 (통신비밀보호법)</li>
                  <li>불만 또는 분쟁 처리 기록: 3년 (전자상거래법)</li>
                  <li>커스텀 패키지 정보: 삭제 요청 시까지</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. 개인정보의 제3자 제공</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 요구받은 경우</li>
                <li>AI 서비스 제공을 위해 제휴사와 공유가 필요한 경우 (최소한의 정보만 제공, 사전 고지)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. 개인정보 처리의 위탁</h2>
              <div className="space-y-3">
                <p className="text-gray-700">회사는 서비스 제공을 위해 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">위탁업체: Replit Inc.</h4>
                  <p className="text-sm text-gray-600 mb-1">위탁업무: 사용자 인증 및 로그인 서비스</p>
                  <p className="text-sm text-gray-600">보유기간: 서비스 제공 기간</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. 정보주체의 권리·의무 및 행사방법</h2>
              <div className="space-y-3">
                <p className="text-gray-700">이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>개인정보 처리현황 통지 요구</li>
                  <li>개인정보 열람 요구</li>
                  <li>개인정보 정정·삭제 요구</li>
                  <li>개인정보 처리정지 요구</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  위 권리 행사는 이메일(foraitree@gmail.com)을 통해 요청하실 수 있으며, 
                  회사는 지체 없이 조치하겠습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. 개인정보의 안전성 확보조치</h2>
              <p className="text-gray-700 leading-relaxed">
                회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 개인정보의 암호화</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. 쿠키의 운용 및 거부</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  회사는 서비스 제공을 위해 쿠키를 사용할 수 있습니다. 쿠키는 웹사이트 운영에 이용되는 
                  서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로 이용자의 컴퓨터 하드디스크에 저장됩니다.
                </p>
                <p className="text-gray-700">
                  이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 브라우저 설정을 통해 쿠키를 거부할 수 있습니다. 
                  단, 쿠키 거부 시 서비스 이용에 제한이 있을 수 있습니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. 개인정보보호책임자</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">개인정보보호책임자</h4>
                <p className="text-sm text-gray-700 mb-1">담당자: AI DaJo 운영팀</p>
                <p className="text-sm text-gray-700 mb-1">이메일: foraitree@gmail.com</p>
                <p className="text-sm text-gray-700">
                  개인정보와 관련한 문의사항이나 불만처리, 피해구제 등에 관한 사항은 
                  위 연락처로 문의하시기 바랍니다.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. 개인정보처리방침의 변경</h2>
              <p className="text-gray-700 leading-relaxed">
                이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 
                변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. 개인정보의 국외이전</h2>
              <div className="space-y-3">
                <p className="text-gray-700">
                  회사는 서비스 제공을 위해 이용자의 개인정보를 국외로 이전할 수 있습니다:
                </p>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">국외이전 현황</h4>
                  <p className="text-sm text-gray-700 mb-1">이전받는 자: Replit Inc.</p>
                  <p className="text-sm text-gray-700 mb-1">이전되는 국가: 미국</p>
                  <p className="text-sm text-gray-700 mb-1">이전목적: 사용자 인증 및 계정 관리</p>
                  <p className="text-sm text-gray-700 mb-1">이전항목: 이메일, 사용자 ID, 프로필 정보</p>
                  <p className="text-sm text-gray-700">보유기간: 서비스 이용 기간</p>
                </div>
              </div>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-center text-gray-600">
                본 방침은 2024년 12월 23일부터 시행됩니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}