"use client";
import { useEffect, useState } from "react";

export function SystemStatus() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="font-mono text-xs text-[--color-text-dim] space-y-1">
      <p>STATUS: Available for selected projects</p>
      <p>CURRENTLY BUILDING: ORBIT OS</p>
      <p>LOCATION: Remote</p>
      <p>LOCAL TIME: {time}</p>
      <p className="pt-1 text-[--color-text-dim]/70">orbitos.keyush</p>
    </div>
  );
}
