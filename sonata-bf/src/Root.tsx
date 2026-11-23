import React from "react";
import { Composition } from "remotion";
import { SonataBF, SonataProps } from "./SonataBF";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SonataBF"
      component={SonataBF}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ showSafeZones: false } satisfies SonataProps}
    />
  </>
);
