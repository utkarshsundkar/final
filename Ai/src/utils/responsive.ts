import { Dimensions, Platform, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

const isIPad = Platform.OS === 'ios' && (Platform as any).isPad;
const scale = width / 375;

export function normalize(size: number) {
    // Only apply 50% of the scale factor to prevent fonts from getting too big on large phones
    const newSize = size + (size * scale - size) * 0.5;
    const roundedSize = Math.round(PixelRatio.roundToNearestPixel(newSize));
    return Platform.OS === 'android' ? roundedSize - 2 : roundedSize;
}

export const responsive = {
    isIPad,
    isTablet: isIPad,
    width,
    height,
    contentWidth: isIPad ? 850 : width,
    moderateScale: (size: number, factor = 0.5) => size + ((isIPad ? size * 1.5 : size) - size) * factor,
    rf: (size: number) => normalize(isIPad ? size * 1.2 : size),
    getContainerStyle: () => ({
        width: '100%' as const,
        maxWidth: isIPad ? 850 : ('100%' as any),
        alignSelf: 'center' as const,
    }),
};
