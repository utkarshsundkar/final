import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
    Image,
    StatusBar,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { responsive } from '../utils/responsive';

interface OnboardingLayoutProps {
    title: string;
    subtitle?: string;
    currentStep: number;
    totalSteps: number;
    onNext: () => void;
    onBack: () => void;
    children: React.ReactNode;
    nextDisabled?: boolean; // To block 'Next' until selection is made
}

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
    title,
    subtitle,
    currentStep,
    totalSteps,
    onNext,
    onBack,
    children,
    nextDisabled = false
}) => {
    // Calculate progress as a decimal (0 to 1)
    const progressWidth = (currentStep / totalSteps);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F5F2" />

            {/* Header: Back + Progress */}
            <View style={[styles.header, responsive.getContainerStyle()]}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/333333/left.png' }}
                        style={styles.backIcon}
                    />
                </TouchableOpacity>

                {/* Progress Bar Container */}
                <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { flex: progressWidth }]} />
                    <View style={{ flex: 1 - progressWidth }} />
                </View>

                {/* Step Counter (Optional) */}
                <Text style={styles.stepText} numberOfLines={1}>{currentStep}/{totalSteps}</Text>
            </View>

            {/* Main Content */}
            <View style={[styles.content, responsive.getContainerStyle()]}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>

                <ScrollView
                    style={styles.body}
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </ScrollView>
            </View>

            {/* Footer / Next Button */}
            <View style={[styles.footer, responsive.getContainerStyle()]}>
                <TouchableOpacity
                    style={[styles.nextButton, nextDisabled && styles.nextButtonDisabled]}
                    onPress={onNext}
                    disabled={nextDisabled}
                >
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/long-arrow-right.png' }}
                        style={styles.nextIcon}
                    />
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5F2', // Consistent App Theme
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: responsive.isTablet ? 30 : 10,
        paddingBottom: responsive.isTablet ? 40 : 20,
    },
    backButton: {
        padding: 8,
        marginRight: 10,
    },
    backIcon: {
        width: responsive.isTablet ? 28 : 20,
        height: responsive.isTablet ? 28 : 20,
    },
    progressContainer: {
        flex: 1,
        flexDirection: 'row',
        height: responsive.isTablet ? 10 : 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        marginHorizontal: 10,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#FF8C42',
        borderRadius: 5,
    },
    stepText: {
        fontSize: responsive.isTablet ? 18 : 12,
        color: '#999',
        fontFamily: 'Lexend',
        fontWeight: '600',
        width: responsive.isTablet ? 70 : 45, // Increased width for double-digit numbers
        textAlign: 'right',
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
    },
    titleContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    title: {
        fontSize: responsive.isTablet ? 54 : 32,
        color: '#1A1A1A',
        fontFamily: 'Lexend',
        fontWeight: Platform.OS === 'ios' ? '700' : '600',
        marginBottom: 10,
        lineHeight: responsive.isTablet ? 64 : 38,
        // textShadow workaround for Android bold
        ...(Platform.OS === 'android' && {
            textShadowColor: 'rgba(0, 0, 0, 0.5)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 1,
        }),
    },
    subtitle: {
        fontSize: responsive.isTablet ? 22 : 16,
        color: '#888',
        fontFamily: 'Lexend',
        lineHeight: responsive.isTablet ? 32 : 24,
    },
    body: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: 30,
        paddingBottom: responsive.isTablet ? 60 : 30,
        alignItems: 'flex-end', // Right align next button
    },
    nextButton: {
        width: responsive.isTablet ? 80 : 60,
        height: responsive.isTablet ? 80 : 60,
        borderRadius: responsive.isTablet ? 40 : 30,
        backgroundColor: '#FF8C42',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF8C42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    nextButtonDisabled: {
        backgroundColor: '#CCC',
        shadowOpacity: 0,
        elevation: 0,
    },
    nextIcon: {
        width: responsive.isTablet ? 32 : 24,
        height: responsive.isTablet ? 32 : 24,
        tintColor: '#FFF',
    },
});

export default OnboardingLayout;
