import StudyHero from '../components/study/StudyHero';
import StudyQuickActions from '../components/study/StudyQuickActions';
import RecentResources from '../components/study/RecentResources';
import PopularCourses from '../components/study/PopularCourses';
import StudyVaultPreview from '../components/study/StudyVaultPreview';

export default function StudyPage() {
  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto px-4 py-6 animate-in fade-in duration-300">
      {/* 🚀 Dynamic Presentation Banner Unit */}
      <StudyHero />

      {/* ⚡ Action Hub Node (Uploads, Folders, & Modals) */}
      <StudyQuickActions />

      {/* 📅 Live Aggregate Stream Module */}
      <RecentResources />

      {/* 🔥 Analytical Metric Course Matrix */}
      <PopularCourses />

      {/* 📦 Embedded Interactive Document Vault Architecture */}
      <StudyVaultPreview />
    </div>
  );
}