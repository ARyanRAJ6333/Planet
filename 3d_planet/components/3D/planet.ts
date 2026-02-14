import gsap from "gsap";

import earthVertex from "./shaders/earth/vertex.glsl";
import earthFragment from "./shaders/earth/fragment.glsl";

import * as THREE from "three";
import { cos, specularColor } from "three/tsl";

const initPlanet = (): {scene: THREE.Scene } => {

    const canvas = document.querySelector("canvas.planet-3D") as HTMLCanvasElement;

    //scene
    const scene = new THREE.Scene();

    //camera
    const size = {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRation: window.devicePixelRatio,
    }

    const camera = new THREE.PerspectiveCamera(15, size.width / size.height, 0.1, 10000)
    camera.position.x = 0;
    camera.position.y = 0.1;
    camera.position.z = 19;
    scene.add(camera);

    //rendrer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(size.pixelRation);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    //texture
    const TL = new THREE.TextureLoader();
    const dayTexture = TL.load("./earth/day.jpg");
    const nightTexture = TL.load("./earth/night.jpg");
    const specularCloudsTexture = TL.load("./earth/specularClouds.jpg");

    dayTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.colorSpace = THREE.SRGBColorSpace;

    const baseAnisotropy = renderer.capabilities.getMaxAnisotropy();

    dayTexture.anisotropy = baseAnisotropy;
    specularCloudsTexture.anisotropy = baseAnisotropy;
    nightTexture.anisotropy = baseAnisotropy;

    // Atmosphere colors
    const atmosphereDayColor = new THREE.Color(0x87ceeb);
    const atmosphereTwilightColor = new THREE.Color(0xff6b9d);

    //geometry
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    //material
    const earthMaterial = new THREE.ShaderMaterial({
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;

            void main() {
                //Position
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                gl_Position = projectionMatrix * viewMatrix * modelPosition;

                //Model normal
                vec3 modelNormal = (modelMatrix * vec4(normal, 0.0)).xyz;

                //Varying
                vUv = uv;
                vNormal = modelNormal;
                vPosition = modelPosition.xyz;
            }
            `,
        fragmentShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;

            uniform sampler2D uDayTexture;
            uniform sampler2D uNightTexture;
            uniform sampler2D uSpecularCloudsTexture;
            uniform vec3 uSunDirection;
            uniform vec3 uAtmosphereDayColor;
            uniform vec3 uAtmosphereTwilightColor;

            void main() {
                vec3 viewDirection = normalize(vPosition - cameraPosition);
                vec3 normal = normalize(vNormal);
                vec3 color =  vec3(0.0);

                vec3 dayColor = texture(uDayTexture, vUv).rgb * 2.0;
                vec3 nightColor = texture(uNightTexture, vUv).rgb;
                vec2 specularCloudsColor = texture(uSpecularCloudsTexture, vUv).rg;

                float sunOrgination = dot(uSunDirection, normal);

                float dayMix = smoothstep(-0.25, 0.5, sunOrgination);
                color += mix(nightColor, dayColor, dayMix);

                float cloudMix = smoothstep(0.5, 1.0, specularCloudsColor.g * 1.1);
                cloudMix *= dayMix;
                color = mix(color, vec3(1.0), cloudMix);

                float fresnel = dot(viewDirection, normal) + 1.1;
                fresnel = pow(fresnel, 2.0);

                float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrgination);
                vec3 atmosphereColors = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
                color = mix(color, atmosphereColors, fresnel * atmosphereDayMix);

                vec3 reflection = reflect(-uSunDirection, normal);
                float specular = -dot(reflection, viewDirection);
                specular = max(specular, 0.0);
                specular = pow(specular, 10.0);
                specular *= specularCloudsColor.r * .7;

                vec3 specularColor = mix(vec3(1.0), atmosphereColors, fresnel);
                color += specular * specularColor;

                gl_FragColor = vec4(color,1.0);
            }
            `,
        uniforms: {
            uDayTexture: new THREE.Uniform(dayTexture),
            uNightTexture: new THREE.Uniform(nightTexture),
            uSpecularCloudsTexture: new THREE.Uniform(specularCloudsTexture),
            uSunDirection: new THREE.Uniform(new THREE.Vector3(-1, 0, 0)),
            uAtmosphereDayColor: new THREE.Uniform(atmosphereDayColor),
            uAtmosphereTwilightColor: new THREE.Uniform(atmosphereTwilightColor),
        },
        transparent: true,

    });

    const earth = new THREE.Mesh(earthGeometry, earthMaterial);

    scene.add(earth);

    //animation loop
    gsap.ticker.add(() => {
        earth.rotation.y += 0.002;
        renderer.render(scene, camera);
    })
    gsap.ticker.lagSmoothing(0)

    window.addEventListener("resize", () => {
        size.width = window.innerWidth;
        size.height = window.innerHeight;
        size.pixelRation = window.devicePixelRatio;

        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();

        renderer.setSize(size.width, size.height);
        renderer.setPixelRatio(size.pixelRation);
    })

    return { scene };
};

export default initPlanet;
