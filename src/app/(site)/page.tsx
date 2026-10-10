import { CtaBand } from '@/components/site/CtaBand';
import { Hero } from '@/components/site/home/Hero';
import { AboutTeaser, AreasSection, FeaturedProjects, KnowledgeSection, MethodSection } from '@/components/site/home/HomeSections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutTeaser />
      <AreasSection />
      <MethodSection />
      <FeaturedProjects />
      <KnowledgeSection />
      <CtaBand />
    </>
  );
}
