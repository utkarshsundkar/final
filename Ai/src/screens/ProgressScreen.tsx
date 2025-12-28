import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { responsive } from '../utils/responsive';

const { width } = Dimensions.get('window');

const ProgressScreen = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return (
        <View style={styles.container}>
            {/* Fixed White Header */}
            <View style={styles.headerContainer}>
                <View style={responsive.getContainerStyle()}>
                    <Text style={styles.headerTitle}>PROGRESS</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>


                {/* Activity Grid Card */}
                <View style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                        <Text style={styles.activityTitle}>Consistency</Text>
                        <Text style={{ color: '#888', fontFamily: 'Lexend' }}>Daily Tracker</Text>
                    </View>

                    <View>
                        {/* Rows representing weeks/days */}
                        {[0, 1, 2, 3, 4].map((row) => (
                            <View key={row} style={styles.activityGridRow}>
                                {[0, 1, 2, 3, 4, 5, 6].map((col) => {
                                    const index = row * 7 + col;
                                    const dayNumber = index - firstDay + 1;
                                    const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;

                                    // Static Pattern
                                    const activeIndices = [0, 1, 3, 4, 8, 10, 11, 15, 16, 17, 20, 22, 24, 27, 29, 30, 31, 33];
                                    const isActive = isValidDay && activeIndices.includes(index);
                                    const isToday = isValidDay && dayNumber === now.getDate();

                                    return (
                                        <View
                                            key={col}
                                            style={[
                                                styles.activityGridBox,
                                                isActive ? { backgroundColor: '#E0E0E0' } : { backgroundColor: '#2A2A2A' },
                                                isToday && { borderColor: '#FF6B35', borderWidth: 1.5, backgroundColor: '#2A2A2A' },
                                                !isValidDay && { backgroundColor: 'transparent' }
                                            ]}
                                        >
                                            {isValidDay && (
                                                <Text style={{
                                                    fontSize: responsive.isTablet ? 16 : 10,
                                                    color: isActive ? '#000' : '#666',
                                                    fontFamily: 'Lexend',
                                                    fontWeight: isToday ? '700' : '400'
                                                }}>
                                                    {dayNumber}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </View>

                {/* Stats Overview Card */}
                <View style={styles.statsCard}>
                    {/* Left: Radial Charts Simulation */}
                    <View style={styles.chartContainer}>
                        {/* Outer Ring (Orange) - Full Circle */}
                        <View style={[styles.ring, { width: 120, height: 120, borderWidth: 14, borderColor: '#DADada' }]}>
                            <View style={[styles.ringArc, { borderWidth: 14, borderColor: '#E57355' }]} />
                        </View>
                        {/* Inner Ring (Black) - Full Circle */}
                        <View style={[styles.ring, { width: 85, height: 85, position: 'absolute', borderWidth: 14, borderColor: '#F0F0F0' }]}>
                            <View style={[styles.ringArc, { borderWidth: 14, borderColor: '#1A1A1A' }]} />
                        </View>
                    </View>

                    {/* Right: Legend Box (White) */}
                    <View style={styles.legendBox}>
                        <View style={styles.legendItem}>
                            <View style={[styles.dot, { backgroundColor: '#E57355' }]} />
                            <View>
                                <Text style={styles.legendLabel}>Exercise</Text>
                                <Text style={styles.legendValue}>240<Text style={styles.legendTotal}>/600min</Text></Text>
                            </View>
                        </View>

                        <View style={[styles.legendItem, { marginTop: 16 }]}>
                            <View style={[styles.dot, { backgroundColor: '#1A1A1A' }]} />
                            <View>
                                <Text style={styles.legendLabel}>Stand</Text>
                                <Text style={styles.legendValue}>160<Text style={styles.legendTotal}>/600min</Text></Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Grid: Calories and Reps */}
                <View style={styles.gridContainer}>
                    {/* Calories Card */}
                    <View style={styles.gridCard}>
                        <Text style={styles.cardLabel}>Calories</Text>
                        <Text style={styles.cardBigValue}>1,240 <Text style={styles.unit}>kcal</Text></Text>
                        {/* Bar Chart Sim - Track Bars */}
                        <View style={styles.barChartRow}>
                            {[0.3, 0.5, 0.25, 0.8, 0.45, 0.65, 0.35].map((fill, i) => (
                                <View key={i} style={styles.barTrack}>
                                    <View style={[
                                        styles.barFill,
                                        {
                                            height: `${fill * 100}%`,
                                            backgroundColor: i === 3 ? '#FF6B35' : '#FFD8CC'
                                        }
                                    ]} />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Total Reps Card */}
                    <View style={styles.gridCard}>
                        <Text style={styles.cardLabel}>Total Reps</Text>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: responsive.isTablet ? 64 : 48, fontWeight: '600', fontFamily: 'Lexend', color: '#000' }}>450</Text>
                        </View>
                    </View>
                </View>

                {/* Second Row: Clean Reps & Duration */}
                <View style={styles.gridContainer}>
                    {/* Clean Reps Card */}
                    <View style={styles.gridCard}>
                        <Text style={styles.cardLabel}>Clean Reps</Text>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            {/* Ring Container */}
                            <View style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 10, borderColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' }}>
                                {/* Active Arc Simulating 85% - Orange */}
                                <View style={{
                                    position: 'absolute',
                                    top: -10, left: -10, right: -10, bottom: -10,
                                    borderRadius: 50,
                                    borderWidth: 10,
                                    borderColor: '#FF6B35',
                                    borderBottomColor: 'transparent', // Creates Gap
                                    transform: [{ rotate: '-45deg' }] // Rotate so gap is at bottom-ish
                                }} />
                                <Text style={{ fontSize: 24, fontWeight: '600', fontFamily: 'Lexend', color: '#000' }}>85%</Text>
                            </View>
                        </View>
                    </View>

                    {/* Duration Card */}
                    <View style={styles.gridCard}>
                        <Text style={styles.cardLabel}>Duration</Text>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: responsive.isTablet ? 64 : 48, fontWeight: '600', fontFamily: 'Lexend', color: '#000' }}>
                                45 <Text style={{ fontSize: responsive.isTablet ? 24 : 18, fontWeight: '500', fontFamily: 'Lexend', color: '#888' }}>min</Text>
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
        backgroundColor: '#F8F7F4', // Lightest Grey for Body
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
        paddingTop: 24,
        maxWidth: responsive.isTablet ? 850 : 600,
        alignSelf: 'center',
        width: '100%',
    },
    headerTitle: {
        fontSize: 18, // Matched with App.tsx Header
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
        padding: 24,
        marginBottom: 24,
        width: '100%',
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
        backgroundColor: '#E8E8E8', // Grey Background
        borderRadius: 32,
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12, // Reduced from 24
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
        borderRightColor: 'transparent',
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
        fontSize: responsive.isTablet ? 28 : 20,
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
        minHeight: 180,
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
        fontSize: responsive.isTablet ? 42 : 32,
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
