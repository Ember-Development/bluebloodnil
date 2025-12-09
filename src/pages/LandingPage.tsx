import { Navigation } from "../features/landing/Navigation";
import { Hero } from "../features/landing/Hero";
import { GoalsSection } from "../features/landing/GoalsSection";
import { PathwaysSection } from "../features/landing/PathwaysSection";
import { LandscapeSection } from "../features/landing/LandscapeSection";
import { ComplianceSection } from "../features/landing/ComplianceSection";
import { CTASection } from "../features/landing/CTASection";
import { LandingFooter } from "../features/landing/FooterSection";
import { colors, fonts } from "../features/landing/shared";

export function LandingPage() {
  return (
    <div
      style={{
        fontFamily: fonts.body,
        background: colors.navy,
        color: colors.white,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;700&family=Outfit:wght@400;500;600;700&display=swap');
        
        /* Mobile Navigation */
        @media (max-width: 960px) {
          .landing-nav-desktop { display: none !important; }
          .landing-nav-mobile { 
            display: inline-flex !important; 
            background: none !important; 
            border: none !important; 
            color: var(--color-white) !important; 
            cursor: pointer;
          }
          .landing-nav-mobile-panel { 
            display: flex !important; 
            background: rgba(8,11,20,0.98) !important;
            backdrop-filter: blur(12px);
          }
        }
        
        /* Mobile Hero Section */
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .hero-content {
            text-align: center;
          }
          .hero-image-wrapper {
            max-width: 100% !important;
          }
          .hero-section {
            padding-top: 80px !important;
            min-height: auto !important;
          }
        }
        
        /* Mobile Pathways Section */
        @media (max-width: 968px) {
          .pathways-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .pathways-sticky {
            position: relative !important;
            top: 0 !important;
          }
          .pathways-content {
            padding-left: 0 !important;
          }
          .pathways-section {
            padding: 64px 0 !important;
          }
        }
        
        /* Mobile Section Padding */
        @media (max-width: 768px) {
          .section-padding {
            padding: 48px 0 !important;
          }
          .section-padding-large {
            padding: 64px 0 !important;
          }
        }
        
        /* Mobile Container Padding */
        @media (max-width: 640px) {
          .mobile-container {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
          [style*="padding: 0 1.5rem"] {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }
        }
        
        /* Mobile Text Adjustments */
        @media (max-width: 640px) {
          .mobile-text-sm {
            font-size: 16px !important;
            line-height: 1.6 !important;
          }
          .mobile-heading {
            font-size: clamp(28px, 8vw, 48px) !important;
          }
          .hero-description {
            font-size: 18px !important;
            padding-left: 16px !important;
            border-left-width: 3px !important;
          }
          .hero-content h1 {
            padding-right: 0 !important;
          }
        }
        
        /* Mobile Compliance Section */
        @media (max-width: 768px) {
          .compliance-box {
            padding: 32px 24px !important;
            transform: none !important;
          }
          .compliance-inner {
            transform: none !important;
          }
        }
        
        /* Mobile Footer */
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            gap: 12px !important;
            text-align: center !important;
          }
        }
      `}</style>
      <Navigation />
      <Hero />
      <GoalsSection />
      <PathwaysSection />
      <LandscapeSection />
      <ComplianceSection />
      {/* <RoadmapSection /> */}
      <CTASection />
      <LandingFooter />
    </div>
  );
}
