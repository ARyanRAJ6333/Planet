import gsap from "gsap";
import ScrollTrigger from "gsap/dist/ScrollTrigger";
import * as THREE from "three";
import atmosphereFragment from "./shaders/atmosphere/fragment.glsl";
import atmosphereVertex from "./shaders/atmosphere/vertex.glsl";
import earthFragment from "./shaders/earth/fragment.glsl";
import earthVertex from "./shaders/earth/vertex.glsl";

type PlanetRuntime = {
  destroy: () => void;
  scene: THREE.Scene;
};

const initPlanet = (): PlanetRuntime => {
  const canvas = document.querySelector(
    "canvas.planet-3D",
  ) as HTMLCanvasElement | null;
  const scene = new THREE.Scene();

  if (!canvas) {
    return { destroy: () => {}, scene };
  }

  const size = {
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    width: window.innerWidth,
  };

  const camera = new THREE.PerspectiveCamera(
    15,
    size.width / size.height,
    0.1,
    10_000,
  );
  camera.position.set(0, 2.15, 4.5);
  scene.add(camera);

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(size.width, size.height);
  renderer.setPixelRatio(size.pixelRatio);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const textureLoader = new THREE.TextureLoader();
  const dayTexture = textureLoader.load("/earth/day.jpg");
  const nightTexture = textureLoader.load("/earth/night.jpg");
  const specularCloudsTexture = textureLoader.load("/earth/specularClouds.jpg");

  dayTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.colorSpace = THREE.SRGBColorSpace;

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  dayTexture.anisotropy = maxAnisotropy;
  nightTexture.anisotropy = maxAnisotropy;
  specularCloudsTexture.anisotropy = maxAnisotropy;

  const atmosphereDayColor = new THREE.Color(0x06111f);
  const atmosphereTwilightColor = new THREE.Color(0x06111f);

  const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
  const atmosphereGeometry = new THREE.SphereGeometry(2, 64, 64);

  const earthMaterial = new THREE.ShaderMaterial({
    fragmentShader: earthFragment,
    transparent: true,
    uniforms: {
      uAtmosphereDayColor: new THREE.Uniform(atmosphereDayColor),
      uAtmosphereTwilightColor: new THREE.Uniform(atmosphereTwilightColor),
      uDayTexture: new THREE.Uniform(dayTexture),
      uNightTexture: new THREE.Uniform(nightTexture),
      uSpecularCloudsTexture: new THREE.Uniform(specularCloudsTexture),
      uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
    },
    vertexShader: earthVertex,
  });

  const atmosphereMaterial = new THREE.ShaderMaterial({
    depthWrite: false,
    fragmentShader: atmosphereFragment,
    side: THREE.BackSide,
    transparent: true,
    uniforms: {
      uAtmosphereDayColor: new THREE.Uniform(atmosphereDayColor),
      uAtmosphereTwilightColor: new THREE.Uniform(atmosphereTwilightColor),
      uOpacity: { value: 1.0 },
      uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
    },
    vertexShader: atmosphereVertex,
  });

  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  atmosphere.scale.set(1.13, 1.13, 1.13);

  const earthGroup = new THREE.Group();
  earthGroup.add(earth, atmosphere);

  const sunSpherical = new THREE.Spherical(1, Math.PI * 0.48, -1.8);
  const sunDirection = new THREE.Vector3().setFromSpherical(sunSpherical);

  earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection);

  scene.add(earthGroup);

  gsap.registerPlugin(ScrollTrigger);

  const timeline = gsap.timeline({
    scrollTrigger: {
      anticipatePin: 1,
      pin: true,
      scrub: 3,
      start: "top top",
      trigger: ".hero-main",
    },
  });

  timeline
    .to(
      ".hero-main .content",
      {
        autoAlpha: 0,
        duration: 2,
        ease: "power1.inOut",
        filter: "blur(4px)",
        scale: 0.5,
      },
      "setting",
    )
    .to(
      camera.position,
      {
        duration: 2,
        ease: "power1.inOut",
        x: window.innerWidth < 768 ? 0 : 0.1,
        y: 0.1,
        z: window.innerWidth < 768 ? 19 : 30,
      },
      "setting",
    );

  const tick = () => {
    earth.rotation.y += 0.002;
    renderer.render(scene, camera);
  };

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  const handleResize = () => {
    size.width = window.innerWidth;
    size.height = window.innerHeight;
    size.pixelRatio = Math.min(window.devicePixelRatio, 2);

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();

    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(size.pixelRatio);
  };

  window.addEventListener("resize", handleResize);

  const destroy = () => {
    window.removeEventListener("resize", handleResize);
    gsap.ticker.remove(tick);
    timeline.scrollTrigger?.kill();
    timeline.kill();

    dayTexture.dispose();
    nightTexture.dispose();
    specularCloudsTexture.dispose();
    earthGeometry.dispose();
    atmosphereGeometry.dispose();
    earthMaterial.dispose();
    atmosphereMaterial.dispose();
    renderer.dispose();
  };

  return { destroy, scene };
};

export default initPlanet;
