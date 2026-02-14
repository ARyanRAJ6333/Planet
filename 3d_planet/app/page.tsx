"use client";

import { useEffect } from "react";

import initPlanet3D from "@/components/3D/planet";

export default function Home() {
  useEffect(() => {
    const { destroy } = initPlanet3D();

    return () => {
      destroy();
    };
  }, []);

  return (
    <div className="page">
      <section className="hero-main">
        <div className="content">
          <p className="eyebrow">Interactive Experience</p>
          <h1>Welcome To The New World</h1>

          <p>
            A cinematic 3D planet built with Three.js and React, designed for
            teams building practical AI systems that improve business
            performance.
          </p>

          <button className="cta-btn" type="button">
            Get Started
          </button>
        </div>
        <canvas className="planet-3D" />
      </section>
    </div>
  );
}
