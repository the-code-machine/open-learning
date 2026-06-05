import Hero from "@/components/Hero";
import MissionSection from "@/components/MissionSection";
import UpcomingEventsSection from "@/components/UpcomingEventSection";
import StatsSection from "@/components/StatsSection";
import HowItWorks from "@/components/HowItsWork";
import CommunitySection from "@/components/CommunityHub";
import JoinCTA from "@/components/JoinCTA";

// Pull fresh upcoming-events on every visit so admin additions appear immediately
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <Hero />
      <MissionSection />
      <UpcomingEventsSection />
      <StatsSection />
      <HowItWorks />
      <CommunitySection />
      <JoinCTA />
    </>
  );
}
