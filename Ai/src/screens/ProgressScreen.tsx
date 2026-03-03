import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, ActivityIndicator } from 'react-native';
import { responsive } from '../utils/responsive';
import { useState, useEffect, useCallback } from 'react';
import ExerciseService from '../services/ExerciseService';
import AuthService from '../services/AuthService';
import OnboardingService from '../services/OnboardingService';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
    const [userLevel, setUserLevel] = useState('intermediate');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const fetchStats = async () => {
        try {
            const currentUser = await AuthService.getCurrentUser();
            setUser(currentUser);
            if (currentUser?.id) {
                const [data, onboarding] = await Promise.all([
                    ExerciseService.getProgressSummary(currentUser.id),
                    OnboardingService.getOnboardingData()
                ]);

                if (data) {
                    setStats(data);
                }
                if (onboarding?.experience) {
                    setUserLevel(onboarding.experience.toLowerCase());
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

    // Level-based monthly goals based on 40m/day avg for Intermediate:
    // Beginner (20m/day -> 600m), Intermediate (40m/day -> 1200m), Advanced/Expert (60m/day -> 1800m)
    const monthlyGoal = userLevel === 'beginner' ? 600 : (userLevel === 'intermediate' ? 1200 : 1800);
    const monthlyPercent = Math.min(Math.round((monthlyMinutes / monthlyGoal) * 100), 100);

    const weeklyDays = stats?.weeklyDays || 0;
    const weeklyGoal = 6;
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

                {/* Friend Account Indicator & Activity */}
                {user?.userType === 'FRIEND' && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 24,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: '#F2F2F7',
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.05,
                            shadowRadius: 10,
                            elevation: 2,
                        }}>
                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center' }}>
                                <Image
                                    source={{ uri: 'https://img.icons8.com/ios-filled/50/FF8C42/goal.png' }}
                                    style={{ width: 22, height: 22 }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 11, color: '#FF8C42', fontFamily: 'Lexend', fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>FRIEND ACCOUNT</Text>
                                <Text style={{ fontSize: 16, color: '#1C1C1E', fontFamily: 'Lexend', fontWeight: '600' }}>Viewing linked friend's metrics</Text>
                            </View>
                        </View>

                        {/* Activity Section sorted by selected day */}
                        {(() => {
                            const filteredWorkouts = stats?.monthlyWorkouts?.filter((w: any) =>
                                new Date(w.createdAt).getDate() === selectedDay
                            ) || [];

                            if (filteredWorkouts.length === 0) {
                                return (
                                    <View style={{ marginTop: 24, padding: 20, backgroundColor: '#F8F9FB', borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#D1D1D6' }}>
                                        <Text style={{ fontSize: 16, color: '#8E8E93', fontFamily: 'Lexend', fontWeight: '500' }}>
                                            No activity on {new Date(year, month, selectedDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                );
                            }

                            return (
                                <View style={{ marginTop: 24 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                        <View>
                                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1C1C1E', fontFamily: 'Lexend' }}>
                                                Activity on {new Date(year, month, selectedDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B35', marginRight: 6 }} />
                                                <Text style={{ fontSize: 12, color: '#8E8E93', fontFamily: 'Lexend' }}>{filteredWorkouts.length} Workouts tracked</Text>
                                            </View>
                                        </View>
                                        <View style={{ backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 }}>
                                            <Text style={{ fontSize: 10, color: '#2E7D32', fontWeight: '800', fontFamily: 'Lexend', textTransform: 'uppercase' }}>COMPLETED</Text>
                                        </View>
                                    </View>
                                    <View style={{ gap: 12 }}>
                                        {filteredWorkouts.map((workout: any, index: number) => {
                                            const hasExercises = workout.exercises && workout.exercises.length > 0;
                                            const isExpanded = hasExercises && expandedWorkoutId === workout._id;
                                            return (
                                                <View key={workout._id || index} style={{
                                                    backgroundColor: '#F8F9FB',
                                                    borderRadius: 20,
                                                    overflow: 'hidden',
                                                    borderWidth: 1,
                                                    borderColor: '#F2F2F7',
                                                    shadowColor: '#000',
                                                    shadowOffset: { width: 0, height: 2 },
                                                    shadowOpacity: 0.02,
                                                    shadowRadius: 5,
                                                    elevation: 1,
                                                }}>
                                                    <TouchableOpacity
                                                        onPress={() => hasExercises && setExpandedWorkoutId(isExpanded ? null : workout._id)}
                                                        activeOpacity={hasExercises ? 0.7 : 1}
                                                        style={{
                                                            padding: 16,
                                                            flexDirection: 'row',
                                                            alignItems: 'center',
                                                        }}
                                                    >
                                                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 14, borderWidth: 1, borderColor: '#F2F2F7' }}>
                                                            <Image
                                                                source={{ uri: 'https://img.icons8.com/ios-filled/50/FF6B35/running.png' }}
                                                                style={{ width: 22, height: 22, tintColor: '#FF6B35' }}
                                                            />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={{ fontSize: 16, color: '#1C1C1E', fontFamily: 'Lexend', fontWeight: '600' }}>
                                                                {workout.workout_name.replace(/([A-Z])/g, ' $1').trim()}
                                                            </Text>
                                                            <Text style={{ fontSize: 12, color: '#8E8E93', fontFamily: 'Lexend', marginTop: 2 }}>
                                                                {workout.total_exercises} Exercises • {workout.is_perfect ? 'Perfect' : `${workout.perfect_exercises}/${workout.total_exercises} Perfect`}
                                                            </Text>
                                                        </View>
                                                        {hasExercises && (
                                                            <Image
                                                                source={{ uri: isExpanded ? 'https://img.icons8.com/ios-filled/50/8E8E93/expand-arrow.png' : 'https://img.icons8.com/ios-filled/50/8E8E93/forward.png' }}
                                                                style={{ width: 14, height: 14, transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] }}
                                                            />
                                                        )}
                                                    </TouchableOpacity>

                                                    {isExpanded && workout.exercises && workout.exercises.length > 0 && (
                                                        <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 }}>
                                                            <View style={{ height: 1, backgroundColor: '#F2F2F7', marginBottom: 16 }} />
                                                            <View style={{ gap: 12 }}>
                                                                {workout.exercises.map((ex: any, idx: number) => {
                                                                    const isPopulated = typeof ex === 'object' && ex !== null;
                                                                    const name = isPopulated ? ex.exercise_name : `Exercise ${idx + 1}`;
                                                                    const total = isPopulated ? ex.reps_performed : workout.total_exercises;
                                                                    const perfect = isPopulated ? ex.reps_performed_perfect : workout.perfect_exercises;

                                                                    return (
                                                                        <View key={isPopulated ? (ex._id || idx) : idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <View style={{ flex: 1 }}>
                                                                                <Text style={{ fontSize: 14, color: '#3A3A3C', fontFamily: 'Lexend', fontWeight: '500' }}>{name}</Text>
                                                                            </View>
                                                                            <View style={{ backgroundColor: (total > 0 && total === perfect) ? '#E8F5E9' : '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                                                                <Text style={{ fontSize: 13, color: (total > 0 && total === perfect) ? '#2E7D32' : '#E65100', fontFamily: 'Lexend', fontWeight: '700' }}>
                                                                                    {perfect}/{total} Reps
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    );
                                                                })}
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })()}
                    </View>
                )
                }


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
                                        const yogaDays = stats?.yogaDays || [];
                                        const isActive = isValidDay && activeDays.includes(dayNumber);
                                        const isYoga = isValidDay && yogaDays.includes(dayNumber);
                                        const isToday = isValidDay && dayNumber === now.getDate();

                                        const isSelected = isValidDay && dayNumber === selectedDay;

                                        return (
                                            <TouchableOpacity
                                                key={col}
                                                disabled={!isValidDay}
                                                onPress={() => setSelectedDay(dayNumber)}
                                                style={[
                                                    styles.activityGridBox,
                                                    isValidDay && (isActive ? { backgroundColor: '#FF6B35' } : { backgroundColor: '#333' }),
                                                    isValidDay && isSelected && { borderColor: '#FFFFFF', borderWidth: 2 },
                                                    !isValidDay && { backgroundColor: 'transparent' }
                                                ]}
                                            >
                                                {isValidDay && (
                                                    <>
                                                        <Text style={{
                                                            fontSize: responsive.rf(responsive.isTablet ? 16 : 10),
                                                            color: isActive ? '#FFFFFF' : '#888',
                                                            fontFamily: 'Lexend',
                                                            fontWeight: isToday ? '800' : '500'
                                                        }}>
                                                            {dayNumber}
                                                        </Text>
                                                        {isYoga && (
                                                            <Text style={{
                                                                position: 'absolute',
                                                                bottom: -4,
                                                                right: -2,
                                                                fontSize: responsive.rf(responsive.isTablet ? 14 : 10)
                                                            }}>
                                                                🔥
                                                            </Text>
                                                        )}
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ));
                        })()}
                    </View>
                </View>

                {/* Stats Overview Card */}
                <View style={styles.statsCard}>
                    {/* Vertical Activity Graph - 100% Native & High Visual Fidelity */}
                    <View style={{ flex: 1.3, height: 140, justifyContent: 'flex-end', paddingBottom: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 100 }}>
                            {(stats?.weeklyActivity || [
                                { label: 'M', value: 0 }, { label: 'T', value: 0 }, { label: 'W', value: 0 },
                                { label: 'T', value: 0 }, { label: 'F', value: 0 }, { label: 'S', value: 0 }, { label: 'S', value: 0 }
                            ]).map((day: any, idx: number) => {
                                // Calculate normalized height (max 80 units)
                                const barHeight = day.value > 0 ? Math.min(Math.max((day.value / 60) * 80, 8), 80) : 0;
                                return (
                                    <View key={idx} style={{ alignItems: 'center', width: '12%' }}>
                                        <View style={{
                                            height: 80,
                                            width: 8,
                                            backgroundColor: '#F2F2F7',
                                            borderRadius: 4,
                                            justifyContent: 'flex-end'
                                        }}>
                                            <View style={{
                                                height: barHeight,
                                                width: '100%',
                                                backgroundColor: day.isToday ? '#FF6B35' : '#1C1C1E',
                                                borderRadius: 4,
                                                opacity: day.value > 0 ? 1 : 0
                                            }} />
                                        </View>
                                        <Text style={{
                                            fontSize: 9,
                                            color: '#8E8E93',
                                            fontFamily: 'Lexend',
                                            marginTop: 6,
                                            fontWeight: day.isToday ? '800' : '500'
                                        }}>{day.label}</Text>
                                    </View>
                                );
                            })}
                        </View>
                        <Text style={{ fontSize: 10, color: '#8E8E93', fontFamily: 'Lexend', textAlign: 'center', marginTop: 8 }}>Weekly Momentum</Text>
                    </View>

                    {/* Right: Goals Summary */}
                    <View style={{ flex: 1, marginLeft: 16 }}>
                        <View style={{ marginBottom: 16 }}>
                            <Text style={styles.legendLabel}>Monthly Goal</Text>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#FF6B35', fontFamily: 'Lexend' }}>{monthlyMinutes}<Text style={{ fontSize: 12, color: '#8E8E93', fontWeight: '400' }}>/{monthlyGoal}m</Text></Text>
                            <View style={{ height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                                <View style={{ height: '100%', width: `${monthlyPercent}%`, backgroundColor: '#FF6B35' }} />
                            </View>
                        </View>
                        <View>
                            <Text style={styles.legendLabel}>Weekly Goal</Text>
                            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1C1C1E', fontFamily: 'Lexend' }}>{weeklyDays}<Text style={{ fontSize: 12, color: '#8E8E93', fontWeight: '400' }}>/6d</Text></Text>
                            <View style={{ height: 4, backgroundColor: '#F2F2F7', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                                <View style={{ height: '100%', width: `${weeklyPercent}%`, backgroundColor: '#1C1C1E' }} />
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
                            <View style={{ width: '100%', alignItems: 'center' }}>
                                <Text style={{ fontSize: 36, fontWeight: '800', fontFamily: 'Lexend', color: '#FF6B35', marginBottom: 12 }}>{completionRate}%</Text>
                                <View style={{ height: 8, width: '100%', backgroundColor: '#F5F5F5', borderRadius: 4, overflow: 'hidden' }}>
                                    <View style={{ height: '100%', width: `${completionRate}%`, backgroundColor: '#FF6B35', borderRadius: 4 }} />
                                </View>
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
            </ScrollView >
        </View >
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
