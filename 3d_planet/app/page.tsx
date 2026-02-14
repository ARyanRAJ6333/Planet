"use client";
import { useEffect } from "react";

import initPlanet3D from "@/components/3D/planet"

export default function Home() {

  useEffect(() => {
    initPlanet3D();
  }, []);

  return (
      <div className="page">
        <section className="hero-main">
          <canvas className="planet-3D" />
        </section>
      </div>
  );
}
