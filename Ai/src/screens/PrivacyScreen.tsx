import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';

interface PrivacyScreenProps {
    navigation: any;
}

const PrivacyScreen: React.FC<PrivacyScreenProps> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Image
                            source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/left.png' }}
                            style={styles.backIcon}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy & Security</Text>
                    <View style={styles.headerRight} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Privacy Policy</Text>
                        <Text style={styles.text}>
                            At Arthlete, we are committed to protecting your privacy and ensuring your data is secure. This Privacy Policy outlines how we collect, use, and safeguard your information.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.subHeader}>1. Data Collection</Text>
                        <Text style={styles.text}>
                            We collect information necessary to provide you with a personalized fitness experience. This includes:
                            {'\n'}• Profile Information (Name, Age, activity level)
                            {'\n'}• Workout Data (Exercises completed, duration, performance metrics)
                            {'\n'}• Device Information for app optimization
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.subHeader}>2. Data Usage</Text>
                        <Text style={styles.text}>
                            Your data is used solely to:
                            {'\n'}• Track your fitness progress
                            {'\n'}• Recommend personalized workouts
                            {'\n'}• Improve app functionality and user experience
                            {'\n'}We do not sell your personal data to third parties.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.subHeader}>3. Security</Text>
                        <Text style={styles.text}>
                            We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. All sensitive data is encrypted in transmission and storage.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.subHeader}>4. Your Rights</Text>
                        <Text style={styles.text}>
                            You have the right to:
                            {'\n'}• Access the personal data we hold about you
                            {'\n'}• Request correction of inaccurate data
                            {'\n'}• Request deletion of your account and associated data
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Security</Text>
                        <Text style={styles.text}>
                            For any security concerns or to report a vulnerability, please contact our support team immediately at support@arthlete.fit.
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Last Updated: December 2025</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
    },
    backButton: {
        padding: 5,
    },
    backIcon: {
        width: 24,
        height: 24,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'Lexend',
    },
    headerRight: {
        width: 34, // Balance back button width
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FF6B35',
        marginBottom: 12,
        fontFamily: 'Lexend',
    },
    subHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        fontFamily: 'Lexend',
    },
    text: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        fontFamily: 'Lexend',
    },
    footer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#999',
        fontFamily: 'Lexend',
    },
});

export default PrivacyScreen;
