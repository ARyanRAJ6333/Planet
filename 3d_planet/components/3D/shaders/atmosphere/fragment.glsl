varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vPosition;

            uniform vec3 uSunDirection;
            uniform vec3 uAtmosphereDayColor;
            uniform vec3 uAtmosphereTwilightColor;
            uniform float uOpacity;

            void main() {
                vec3 viewDirection = normalize(vPosition - cameraPosition);
                vec3 normal = normalize(vNormal);
                vec3 color =  vec3(0.0);

                float sunOrgination = dot(uSunDirection, normal);

                float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrgination);
                vec3 atmosphereColors = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
                color += atmosphereColors;

                float edgeAlpha = dot(viewDirection, normal);
                edgeAlpha = smoothstep(0.0, 1.3, edgeAlpha);

                float dayAlpha = smoothstep(-0.5, 0.0, sunOrgination);

                gl_FragColor = vec4(color,1.0);
                gl_FragColor.a *= uOpacity;
                #include <tonemapping_fragment>
                #include <colorspace_fragment>
            }