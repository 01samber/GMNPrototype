import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DatasetBootstrap } from "@/components/DatasetBootstrap";
import { AppLayout } from "@/components/layout/AppLayout";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const HomePage = lazy(() => import("@/pages/HomePage"));
const TutorialOverviewPage = lazy(() => import("@/pages/TutorialOverviewPage"));
const ChapterPage = lazy(() => import("@/pages/ChapterPage"));
const DatasetExplorerPage = lazy(() => import("@/pages/DatasetExplorerPage"));
const EDAPage = lazy(() => import("@/pages/EDAPage"));
const FeatureEngineeringPage = lazy(() => import("@/pages/FeatureEngineeringPage"));
const MLWorkbenchPage = lazy(() => import("@/pages/MLWorkbenchPage"));
const KPIDashboardPage = lazy(() => import("@/pages/KPIDashboardPage"));
const BusinessInsightsPage = lazy(() => import("@/pages/BusinessInsightsPage"));
const GlossaryPage = lazy(() => import("@/pages/GlossaryPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const PythonCoursePage = lazy(() => import("@/pages/PythonCoursePage"));

function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-zinc-500" role="status">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <DatasetBootstrap />
        <OnboardingDialog />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<HomePage />} />
              <Route path="tutorial" element={<TutorialOverviewPage />} />
              <Route path="tutorial/:slug" element={<ChapterPage />} />
              <Route path="python-course" element={<PythonCoursePage />} />
              <Route path="explorer" element={<DatasetExplorerPage />} />
              <Route path="eda" element={<EDAPage />} />
              <Route path="features" element={<FeatureEngineeringPage />} />
              <Route path="models" element={<MLWorkbenchPage />} />
              <Route path="kpi" element={<KPIDashboardPage />} />
              <Route path="insights" element={<BusinessInsightsPage />} />
              <Route path="glossary" element={<GlossaryPage />} />
              <Route path="faq" element={<FAQPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
