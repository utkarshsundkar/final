import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

const isIPad = Platform.OS === 'ios' && (Platform as any).isPad;

export const responsive = {
    isIPad,
    isTablet: isIPad,
    width,
    height,
    contentWidth: isIPad ? 850 : width,
    moderateScale: (size: number, factor = 0.5) => size + ((isIPad ? size * 1.5 : size) - size) * factor,
    getContainerStyle: () => ({
        width: '100%' as const,
        maxWidth: isIPad ? 850 : ('100%' as any),
        alignSelf: 'center' as const,
    }),
};
