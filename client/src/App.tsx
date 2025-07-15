import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/home";
import Landing from "./pages/landing";
import CategoryRanking from "./pages/category-ranking";
import AiDetail from "./pages/ai-detail";
import BundleDetail from "./pages/bundle-detail";
import MyPackages from "./pages/my-packages";
import PrivacyPolicy from "./pages/privacy-policy";
import TermsOfService from "./pages/terms-of-service";
import NotFound from "./pages/not-found";
import Login from "./pages/login";
import AuthCallback from "./pages/auth-callback";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
      <Route path="/category-ranking" component={CategoryRanking} />
      <Route path="/ai-detail" component={AiDetail} />
      <Route path="/bundle-detail/:id" component={BundleDetail} />
      <Route path="/my-packages" component={MyPackages} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
