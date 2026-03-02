import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, ActivityIndicator } from 'react-native';
import { responsive } from '../utils/responsive';
import { useState, useEffect, useCallback } from 'react';
import ExerciseService from '../services/ExerciseService';
import AuthService from '../services/AuthService';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const fetchStats = async () => {
        try {
            const user = await AuthService.getCurrentUser();
            if (user?.id) {
                const data = await ExerciseService.getProgressSummary(user.id);
                if (data) {
                    setStats(data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    // Derived values with fallbacks
    const monthlyMinutes = stats?.monthlyMinutes || 0;
    const monthlyGoal = 600;
    const monthlyPercent = Math.min(Math.round((monthlyMinutes / monthlyGoal) * 100), 100);

    const weeklyDays = stats?.weeklyDays || 0;
    const weeklyGoal = 7;
    const weeklyPercent = Math.min(Math.round((weeklyDays / weeklyGoal) * 100), 100);

    const completionRate = stats?.completionRate || 0;
    const streak = stats?.streak || 0;
    const todayDuration = stats?.todayDuration || 0;

    if (loading && !stats) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>


                {/* Activity Grid Card */}
                <View style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                        <Text style={styles.activityTitle}>Consistency</Text>
                        <Text style={{ color: '#888', fontFamily: 'Lexend' }}>Daily Tracker</Text>
                    </View>

                    <View>
                        {/* Calculate required rows to avoid empty space at bottom */}
                        {(() => {
                            const totalCells = firstDay + daysInMonth;
                            const numRows = Math.ceil(totalCells / 7);
                            return Array.from({ length: numRows }).map((_, row) => (
                                <View key={row} style={styles.activityGridRow}>
                                    {[0, 1, 2, 3, 4, 5, 6].map((col) => {
                                        const index = row * 7 + col;
                                        const dayNumber = index - firstDay + 1;
                                        const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;

                                        // Real Dynamic Pattern
                                        const activeDays = stats?.activeDays || [];
                                        const isActive = isValidDay && activeDays.includes(dayNumber);
                                        const isToday = isValidDay && dayNumber === now.getDate();

                                        return (
                                            <View
                                                key={col}
                                                style={[
                                                    styles.activityGridBox,
                                                    isValidDay && (isActive ? { backgroundColor: '#FF6B35' } : { backgroundColor: 'rgba(255,255,255,0.08)' }),
                                                    isValidDay && isToday && { borderColor: '#FFFFFF', borderWidth: 2, backgroundColor: isActive ? '#FF6B35' : 'rgba(255,255,255,0.08)' },
                                                    !isValidDay && { backgroundColor: 'transparent' }
                                                ]}
                                            >
                                                {isValidDay && (
                                                    <Text style={{
                                                        fontSize: responsive.rf(responsive.isTablet ? 16 : 10),
                                                        color: isActive ? '#FFFFFF' : '#888',
                                                        fontFamily: 'Lexend',
                                                        fontWeight: isToday ? '800' : '500'
                                                    }}>
                                                        {dayNumber}
                                                    </Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </View>
                            ));
                        })()}
                    </View>
                </View>

                {/* Stats Overview Card */}
                <View style={styles.statsCard}>
                    {/* Left: Radial Charts Simulation */}
                    <View style={styles.chartContainer}>
                        {/* Outer Ring (Monthly Goal) */}
                        <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, borderWidth: 14, borderColor: '#F2F2F7' }} />
                        <View style={{
                            position: 'absolute',
                            width: 120,
                            height: 120,
                            borderRadius: 60,
                            borderWidth: 14,
                            borderTopColor: '#FF6B35',
                            borderLeftColor: monthlyPercent > 25 ? '#FF6B35' : 'transparent',
                            borderBottomColor: monthlyPercent > 50 ? '#FF6B35' : 'transparent',
                            borderRightColor: monthlyPercent > 75 ? '#FF6B35' : 'transparent',
                            transform: [{ rotate: `${(monthlyPercent / 100) * 360 - 45}deg` }]
                        }} />

                        {/* Inner Ring (Weekly Goal) */}
                        <View style={{ position: 'absolute', width: 85, height: 85, borderRadius: 42.5, borderWidth: 14, borderColor: '#F2F2F7' }} />
                        <View style={{
                            position: 'absolute',
                            width: 85,
                            height: 85,
                            borderRadius: 42.5,
                            borderWidth: 14,
                            borderTopColor: '#1C1C1E',
                            borderLeftColor: weeklyPercent > 25 ? '#1C1C1E' : 'transparent',
                            borderBottomColor: weeklyPercent > 50 ? '#1C1C1E' : 'transparent',
                            borderRightColor: weeklyPercent > 75 ? '#1C1C1E' : 'transparent',
                            transform: [{ rotate: `${(weeklyPercent / 100) * 360 - 45}deg` }]
                        }} />
                    </View>

                    {/* Right: Legend Box (White) */}
                    <View style={styles.legendBox}>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: '#FF6B35' }]} />
                            <View>
                                <Text style={styles.legendLabel}>Monthly Goal</Text>
                                <Text style={styles.legendValue}>{monthlyMinutes}<Text style={styles.legendTotal}>/{monthlyGoal}min</Text></Text>
                                <Text style={{ fontSize: 10, color: '#FF6B35', fontWeight: '700', fontFamily: 'Lexend', marginTop: 2 }}>{monthlyPercent}% of Monthly Goal</Text>
                            </View>
                        </View>

                        <View style={[styles.legendItem, { marginTop: 12 }]}>
                            <View style={[styles.dot, { backgroundColor: '#1C1C1E' }]} />
                            <View>
                                <Text style={styles.legendLabel}>Weekly Goal</Text>
                                <Text style={styles.legendValue}>{weeklyDays}<Text style={styles.legendTotal}>/{weeklyGoal} days</Text></Text>
                                <Text style={{ fontSize: 10, color: '#8E8E93', fontWeight: '700', fontFamily: 'Lexend', marginTop: 2 }}>{weeklyGoal - weeklyDays} Days Left to Perfect Week</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Grid: Completion Rate and Miss Rate */}
                <View style={styles.gridContainer}>
                    {/* Completion Rate Card */}
                    <View style={styles.gridCard}>
                        <Text style={styles.cardLabel}>Completion Rate</Text>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
                            {/* Ring Container */}
                            <View style={{ width: 80, height: 80, justifyContent: 'center', alignItems: 'center' }}>
                                {/* Single View Multi-color Border for Android */}
                                <View style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 40,
                                    borderWidth: 8,
                                    borderTopColor: '#FF6B35',
                                    borderLeftColor: completionRate > 25 ? '#FF6B35' : '#F5F5F5',
                                    borderBottomColor: completionRate > 50 ? '#FF6B35' : '#F5F5F5',
                                    borderRightColor: completionRate > 75 ? '#FF6B35' : '#F5F5F5',
                                    transform: [{ rotate: `${(completionRate / 100) * 360 - 90}deg` }],
                                    zIndex: 1,
                                    elevation: 1
                                }} />
                                <Text style={{ position: 'absolute', fontSize: 20, fontWeight: '700', fontFamily: 'Lexend', color: '#000', zIndex: 2 }}>{completionRate}%</Text>
                            </View>
                        </View>
                    </View>

                    {/* Miss Rate Card */}
                    <View style={styles.gridCard}>
                        <Text style={styles.cardLabel}>Miss Rate</Text>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: responsive.rf(responsive.isTablet ? 64 : 48), fontWeight: '600', fontFamily: 'Lexend', color: '#FF5252' }}>{100 - completionRate}%</Text>
                            <Text style={{ fontSize: 12, color: '#888', fontFamily: 'Lexend' }}>Last 30 days</Text>
                        </View>
                    </View>
                </View>

                {/* Second Row: Streak & Duration */}
                <View style={styles.gridContainer}>
                    {/* Streak Card */}
                    <View style={styles.gridCard}>
                        <Text style={styles.cardLabel}>Streak</Text>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: responsive.rf(responsive.isTablet ? 64 : 48), fontWeight: '700', fontFamily: 'Lexend', color: '#FF6B35' }}>{streak}</Text>
                                <Text style={{ fontSize: 24, marginLeft: 4 }}>🔥</Text>
                            </View>
                            <Text style={{ fontSize: 14, color: '#888', fontFamily: 'Lexend' }}>Days Active</Text>
                        </View>
                    </View>

                    {/* Duration Card */}
                    <View style={styles.gridCard}>
                        <Text style={styles.cardLabel}>Duration</Text>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: responsive.rf(responsive.isTablet ? 64 : 48), fontWeight: '600', fontFamily: 'Lexend', color: '#000' }}>
                                {todayDuration} <Text style={{ fontSize: responsive.rf(responsive.isTablet ? 24 : 18), fontWeight: '500', fontFamily: 'Lexend', color: '#888' }}>min</Text>
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF', // White to match App.tsx card
    },
    headerContainer: {
        backgroundColor: '#fff', // White Header
        paddingHorizontal: 24,
        paddingTop: 12, // Reduced from 60 to match App.tsx header
        paddingBottom: 20,
        // borderBottomWidth: 1, // Optional: if you want a line
        // borderBottomColor: '#EBEBEB',
    },
    contentContainer: {
        padding: 24,
        paddingTop: 10,
        maxWidth: responsive.isTablet ? 850 : 600,
        alignSelf: 'center',
        width: '100%',
    },
    headerTitle: {
        fontSize: responsive.rf(18), // Matched with App.tsx Header
        fontWeight: '500', // Matched with App.tsx Header
        letterSpacing: 1.5,
        color: '#000',
        fontFamily: 'Lexend',
    },

    // Tip Card
    // Activity Grid Card
    activityCard: {
        backgroundColor: '#1A1A1A', // Dark Background
        borderRadius: 32,
        padding: 20,
        marginBottom: 16,
        width: '100%',
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    activityTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: 'white',
        fontFamily: 'Lexend',
    },
    activityGridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    activityGridBox: {
        width: '12%',
        aspectRatio: 1,
        borderRadius: 6,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Stats Card
    statsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 32,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    chartContainer: {
        width: 120, // Increased Width
        height: 120, // Increased Height
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginLeft: 8,
        marginVertical: 10, // Add vertical breathing room
    },
    ring: {
        borderRadius: 100,
        // BorderWidth handled inline for variations, defaulting here
        justifyContent: 'center',
        alignItems: 'center',
    },
    ringArc: {
        position: 'absolute',
        top: -14,
        left: -14,
        right: -14,
        bottom: -14,
        borderRadius: 100,
    },
    legendBox: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 16,
        paddingVertical: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 10,
    },
    legendLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
        fontFamily: 'Lexend',
    },
    legendValue: {
        fontSize: responsive.rf(responsive.isTablet ? 28 : 20),
        fontWeight: '700',
        color: '#000',
        fontFamily: 'Lexend',
    },
    legendTotal: {
        fontSize: 14,
        color: '#CCC',
        fontWeight: '400',
        fontFamily: 'Lexend',
    },
    // Grid
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12, // Reduced from 24
    },
    gridCard: {
        backgroundColor: 'white',
        borderRadius: 32,
        padding: 24,
        width: '48%',
        // Increased Height as requested
        // Reduced minHeight to decrease empty space
        minHeight: 150,
        justifyContent: 'space-between', // Distribute content
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 8,
        fontFamily: 'Lexend',
    },
    cardBigValue: {
        fontSize: responsive.rf(responsive.isTablet ? 42 : 32),
        fontWeight: '600',
        color: '#000',
        fontFamily: 'Lexend',
        marginBottom: 16,
    },
    unit: {
        fontSize: 18,
        fontWeight: '500',
        color: '#888',
        fontFamily: 'Lexend',
    },
    barChartRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 60, // Increased height for track bars
        justifyContent: 'space-between',
    },
    barTrack: {
        width: 8,
        height: '100%',
        backgroundColor: '#F5F5F5',
        borderRadius: 4,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    barFill: {
        width: '100%',
        borderRadius: 4,
    },
    lineChartContainer: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ProgressScreen;
