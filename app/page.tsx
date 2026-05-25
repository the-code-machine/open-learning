import CommunityHub from "@/components/CommunityHub";
import Hero from "@/components/Hero";
import JoinCTA from "@/components/JoinCTA";
import MissionSection from "@/components/MissionSection";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <Hero />
      <MissionSection />
      {/* <CommunityHub /> */}
      <JoinCTA />
    </>
  );
}
