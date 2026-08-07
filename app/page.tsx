"use client";
import { useState } from "react";
import { BootSequence } from "@/components/home/BootSequence";
import { Screen2Intro } from "@/components/home/Screen2Intro";
import { Screen3Profile } from "@/components/home/Screen3Profile";
import { Screen4Selector } from "@/components/home/Screen4Selector";
import { Screen5Constellation } from "@/components/home/Screen5Constellation";
import { Screen6ProofOfWork } from "@/components/home/Screen6ProofOfWork";
import { Screen7Process } from "@/components/home/Screen7Process";
import { Screen8FinalCTA } from "@/components/home/Screen8FinalCTA";

export default function Page() {
  const [booted, setBooted] = useState(false);

  return (
    <>
      <BootSequence onDone={() => setBooted(true)} />
      {booted && (
        <div>
          <Screen2Intro />
          <Screen3Profile />
          <Screen4Selector />
          <Screen5Constellation />
          <Screen6ProofOfWork />
          <Screen7Process />
          <Screen8FinalCTA />
        </div>
      )}
    </>
  );
}
