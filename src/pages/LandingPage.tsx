import { Navigation } from '../features/landing/Navigation'
import { Hero } from '../features/landing/Hero'
import { GoalsSection } from '../features/landing/GoalsSection'
import { PathwaysSection } from '../features/landing/PathwaysSection'
import { LandscapeSection } from '../features/landing/LandscapeSection'
import { ComplianceSection } from '../features/landing/ComplianceSection'
import { RoadmapSection } from '../features/landing/RoadmapSection'
import { CTASection } from '../features/landing/CTASection'
import { LandingFooter } from '../features/landing/FooterSection'
import { colors, fonts } from '../features/landing/shared'

export function LandingPage() {
  return (
    <div style={{ fontFamily: fonts.body, background: colors.navy, color: colors.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Outfit:wght@400;500;600;700&display=swap');
        @media (max-width: 960px) {
          .landing-nav-desktop { display: none !important; }
          .landing-nav-mobile { display: inline-flex !important; }
          .landing-nav-mobile-panel { display: flex !important; background: rgba(8,11,20,0.95); }
        }
      `}</style>
      <Navigation />
      <Hero />
      <GoalsSection />
      <PathwaysSection />
      <LandscapeSection />
      <ComplianceSection />
      <RoadmapSection />
      <CTASection />
      <LandingFooter />
    </div>
  )
}
