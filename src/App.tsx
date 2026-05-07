import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { EngagementShell } from '@/components/layout/EngagementShell';

import Dashboard from '@/pages/Dashboard';
import Engagements from '@/pages/Engagements';
import NewEngagement from '@/pages/NewEngagement';
import Clients from '@/pages/Clients';
import NewClient from '@/pages/NewClient';
import Benchmarking from '@/pages/Benchmarking';
import Reports from '@/pages/Reports';
import Frameworks from '@/pages/Frameworks';
import AIStudio from '@/pages/AIStudio';
import Settings from '@/pages/Settings';

import Setup from '@/pages/engagement/Setup';
import Footprint from '@/pages/engagement/Footprint';
import DocumentationReview from '@/pages/engagement/DocumentationReview';
import Notes from '@/pages/engagement/Notes';
import Observations from '@/pages/engagement/Observations';
import Scoring from '@/pages/engagement/Scoring';
import Risks from '@/pages/engagement/Risks';
import Recommendations from '@/pages/engagement/Recommendations';
import Roadmap from '@/pages/engagement/Roadmap';
import EngagementBenchmarking from '@/pages/engagement/Benchmarking';
import Report from '@/pages/engagement/Report';
import QAReview from '@/pages/engagement/QAReview';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="engagements" element={<Engagements />} />
        <Route path="engagements/new" element={<NewEngagement />} />
        <Route path="clients" element={<Clients />} />
        <Route path="clients/new" element={<NewClient />} />
        <Route path="benchmarking" element={<Benchmarking />} />
        <Route path="reports" element={<Reports />} />
        <Route path="frameworks" element={<Frameworks />} />
        <Route path="ai-studio" element={<AIStudio />} />
        <Route path="settings" element={<Settings />} />

        <Route path="engagements/:engagementId" element={<EngagementShell />}>
          <Route index element={<Navigate to="setup" replace />} />
          <Route path="setup" element={<Setup />} />
          <Route path="footprint" element={<Footprint />} />
          <Route path="documentation" element={<DocumentationReview />} />
          <Route path="notes" element={<Notes />} />
          <Route path="observations" element={<Observations />} />
          <Route path="scoring" element={<Scoring />} />
          <Route path="risks" element={<Risks />} />
          <Route path="recommendations" element={<Recommendations />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="benchmarking" element={<EngagementBenchmarking />} />
          <Route path="report" element={<Report />} />
          <Route path="qa" element={<QAReview />} />
        </Route>
      </Route>
    </Routes>
  );
}
