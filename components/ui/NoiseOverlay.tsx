import { StyleSheet } from 'react-native';
import Svg, { Defs, Filter, Rect, FeTurbulence } from 'react-native-svg';

export const NoiseOverlay = (): JSX.Element => {
  return (
    <Svg style={styles.container} width="100%" height="100%">
      <Defs>
        <Filter id="noise">
          <FeTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves={3}
            stitchTiles="stitch"
          />
        </Filter>
      </Defs>
      <Rect
        width="100%"
        height="100%"
        filter="url(#noise)"
        opacity={0.05}
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
});
