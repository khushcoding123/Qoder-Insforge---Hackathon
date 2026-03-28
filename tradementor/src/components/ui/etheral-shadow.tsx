"use client";

import { animate, type AnimationPlaybackControls, useMotionValue } from "framer-motion";
import { useEffect, useId, useRef, type CSSProperties } from "react";

interface AnimationConfig {
  scale: number;
  speed: number;
}

interface NoiseConfig {
  opacity: number;
  scale: number;
}

interface EtherealShadowProps {
  sizing?: "fill" | "stretch";
  color?: string;
  animation?: AnimationConfig;
  noise?: NoiseConfig;
  style?: CSSProperties;
  className?: string;
}

function mapRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
  if (fromLow === fromHigh) {
    return toLow;
  }
  const percentage = (value - fromLow) / (fromHigh - fromLow);
  return toLow + percentage * (toHigh - toLow);
}

function useInstanceId(): string {
  const id = useId();
  return `ethereal-shadow-${id.replace(/:/g, "")}`;
}

export function EtherealShadow({
  sizing = "fill",
  color = "rgba(128, 128, 128, 1)",
  animation,
  noise,
  style,
  className,
}: EtherealShadowProps) {
  const id = useInstanceId();
  const animationEnabled = Boolean(animation && animation.scale > 0);
  const feColorMatrixRef = useRef<SVGFEColorMatrixElement>(null);
  const hueRotateMotionValue = useMotionValue(180);
  const hueRotateAnimation = useRef<AnimationPlaybackControls | null>(null);

  const animationScale = animation?.scale ?? 0;
  const displacementScale = animation ? mapRange(animationScale, 1, 100, 20, 100) : 0;
  const animationDuration = animation ? mapRange(animation.speed, 1, 100, 1000, 50) : 1;

  useEffect(() => {
    if (!animationEnabled || !feColorMatrixRef.current) {
      return;
    }

    hueRotateAnimation.current?.stop();
    hueRotateMotionValue.set(0);

    hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
      duration: animationDuration / 25,
      repeat: Infinity,
      repeatType: "loop",
      ease: "linear",
      onUpdate: (value) => {
        feColorMatrixRef.current?.setAttribute("values", String(value));
      },
    });

    return () => {
      hueRotateAnimation.current?.stop();
    };
  }, [animationDuration, animationEnabled, hueRotateMotionValue]);

  return (
    <div
      className={className}
      style={{
        overflow: "hidden",
        position: "relative",
        width: "100%",
        height: "100%",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: -displacementScale,
          filter: animationEnabled ? `url(#${id}) blur(4px)` : "none",
        }}
      >
        {animationEnabled && (
          <svg style={{ position: "absolute" }}>
            <defs>
              <filter id={id}>
                <feTurbulence
                  result="undulation"
                  numOctaves="2"
                  baseFrequency={`${mapRange(animationScale, 0, 100, 0.001, 0.0005)},${mapRange(animationScale, 0, 100, 0.004, 0.002)}`}
                  seed="0"
                  type="turbulence"
                />
                <feColorMatrix ref={feColorMatrixRef} in="undulation" type="hueRotate" values="180" />
                <feColorMatrix
                  in="dist"
                  result="circulation"
                  type="matrix"
                  values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                />
                <feDisplacementMap in="SourceGraphic" in2="circulation" scale={displacementScale} result="dist" />
                <feDisplacementMap in="dist" in2="undulation" scale={displacementScale} result="output" />
              </filter>
            </defs>
          </svg>
        )}
        <div
          style={{
            backgroundColor: color,
            maskImage: "url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')",
            maskSize: sizing === "stretch" ? "100% 100%" : "cover",
            maskRepeat: "no-repeat",
            maskPosition: "center",
            width: "100%",
            height: "100%",
          }}
        />
      </div>

      {noise && noise.opacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png')",
            backgroundSize: `${noise.scale * 200}px`,
            backgroundRepeat: "repeat",
            opacity: noise.opacity / 2,
          }}
        />
      )}
    </div>
  );
}
