import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { Platform } from 'react-native';
import AuthService from '../services/AuthService';

const LeaderboardScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const isAndroid = Platform.OS === 'android';
    const BACKEND_URL = 'https://final-z80k.onrender.com/api/v2/users';

    useEffect(() => {
        fetchLeaderboard();
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const user = await AuthService.refreshUserProfile();
            setCurrentUser(user);
        } catch (error) {
            console.error('Failed to fetch current user:', error);
        }
    };

    const fetchLeaderboard = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BACKEND_URL}/leaderboard`);
            if (response.data.success) {
                setLeaderboardData(response.data.data.leaderboard);
            }
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    // Get top 3 for podium
    const topThree = leaderboardData.slice(0, 3);
    // Get rest for list (excluding top 3)
    const otherUsers = leaderboardData.slice(3);
    // Find current user in leaderboard
    const currentUserRank = leaderboardData.find(u => u.userId === currentUser?.id);

    // Placeholder avatar
    const getAvatar = (index: number) => {
        const avatars = [
            { uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' },
            { uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80' },
            { uri: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80' },
            { uri: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=150&q=80' },
        ];
        return avatars[index % avatars.length];
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconBtn, { zIndex: 10 }]}>
                    <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/left.png' }} style={{ width: 24, height: 24 }} />
                </TouchableOpacity>
                <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Leaderboard</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                {/* Podium Section */}
                {topThree.length >= 3 && (
                    <View style={styles.podiumContainer}>
                        {/* Rank 2 */}
                        <View style={styles.podiumItemSide}>
                            <View style={styles.avatarContainer}>
                                <Image source={getAvatar(1)} style={styles.avatarSmall} />
                                <View style={styles.rankBadgeSecondary}><Text style={styles.rankText}>2</Text></View>
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{topThree[1].username}</Text>
                            <Text style={styles.podiumCoins}>{topThree[1].credits} credits</Text>
                        </View>

                        {/* Rank 1 */}
                        <View style={styles.podiumItemCenter}>
                            <Text style={{ fontSize: 24, marginBottom: 4 }}>👑</Text>
                            <View style={[styles.avatarContainer, { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FFD700' }]}>
                                <Image source={getAvatar(0)} style={styles.avatarLarge} />
                                <View style={[styles.rankBadgePrimary]}><Text style={styles.rankText}>1</Text></View>
                            </View>
                            <Text style={[styles.podiumName, { fontSize: 16, fontWeight: '700' }]} numberOfLines={1}>{topThree[0].username}</Text>
                            <Text style={[styles.podiumCoins, { color: '#666' }]}>{topThree[0].credits} credits</Text>
                        </View>

                        {/* Rank 3 */}
                        <View style={styles.podiumItemSide}>
                            <View style={styles.avatarContainer}>
                                <Image source={getAvatar(2)} style={styles.avatarSmall} />
                                <View style={[styles.rankBadgeSecondary, { backgroundColor: '#CD7F32' }]}><Text style={styles.rankText}>3</Text></View>
                            </View>
                            <Text style={styles.podiumName} numberOfLines={1}>{topThree[2].username}</Text>
                            <Text style={styles.podiumCoins}>{topThree[2].credits} credits</Text>
                        </View>
                    </View>
                )}

                {/* List Section */}
                <View style={[styles.listContainer, { paddingBottom: 120 + insets.bottom }]}>
                    <View style={styles.sheetHandle} />
                    {otherUsers.map((item, index) => {
                        const isCurrentUser = item.userId === currentUser?.id;
                        return (
                            <View
                                key={item.userId}
                                style={[
                                    styles.listItem,
                                    isCurrentUser && { backgroundColor: '#E5D4FA', borderRadius: 16, padding: 12, marginHorizontal: -12 }
                                ]}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Image source={getAvatar(index + 3)} style={styles.listAvatar} />
                                    <View style={{ marginLeft: 16, flex: 1 }}>
                                        <Text style={styles.listName} numberOfLines={1}>
                                            {isCurrentUser ? 'You' : item.username}
                                        </Text>
                                        <Text style={styles.listCoins}>{item.credits} credits</Text>
                                    </View>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={styles.listRank}>{item.rank}</Text>
                                    <Text style={[styles.trendIcon, { color: '#4CAF50' }]}>▲</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Fixed Bottom User Rank - Only show if user is not in top 13 */}
            {currentUserRank && currentUserRank.rank > 13 && (
                <View style={[styles.footerContainer, { paddingBottom: Math.max(20, insets.bottom + 10) }]}>
                    <View style={styles.footerContent}>
                        <Image source={getAvatar(0)} style={styles.listAvatar} />
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text style={[styles.listName, { color: '#000' }]}>You</Text>
                            <Text style={styles.listCoins}>{currentUserRank.credits} credits</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.listRank}>{currentUserRank.rank}</Text>
                            <Text style={[styles.trendIcon, { color: '#4CAF50' }]}>▲</Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
    },
    iconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        fontFamily: 'Lexend',
        color: '#000',
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginTop: 20,
        marginBottom: 30,
        backgroundColor: '#fff',
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#FF6B35',
    },
    tabText: {
        fontFamily: 'Lexend',
        fontSize: 14,
        color: '#888',
        fontWeight: '500',
    },
    activeTabText: {
        color: 'white',
        fontWeight: '600',
    },
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    podiumItemCenter: {
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
        zIndex: 10,
    },
    podiumItemSide: {
        alignItems: 'center',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#E0E0E0',
        marginBottom: 8,
        position: 'relative',
        backgroundColor: '#fff',
    },
    avatarLarge: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        resizeMode: 'cover',
    },
    avatarSmall: {
        width: '100%',
        height: '100%',
        borderRadius: 40,
        resizeMode: 'cover',
    },
    rankBadgePrimary: {
        position: 'absolute',
        bottom: -10,
        alignSelf: 'center',
        backgroundColor: '#FFD700',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    rankBadgeSecondary: {
        position: 'absolute',
        bottom: -10,
        alignSelf: 'center',
        backgroundColor: '#C0C0C0', // Silver
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    rankText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
    podiumName: {
        fontFamily: 'Lexend',
        fontWeight: '600',
        fontSize: 14,
        color: '#000',
        marginBottom: 2,
        marginTop: 8,
        textAlign: 'center',
    },
    podiumCoins: {
        fontFamily: 'Lexend',
        fontSize: 12,
        color: '#888',
    },
    listContainer: {
        flex: 1, // Extend to fill remaining height
        backgroundColor: 'white',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        minHeight: 400, // Ensure it fills space
    },
    sheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#E0E0E0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    listAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#f0f0f0',
    },
    listName: {
        fontFamily: 'Lexend',
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 2,
    },
    listCoins: {
        fontFamily: 'Lexend',
        fontSize: 12,
        color: '#999',
    },
    listRank: {
        fontFamily: 'Lexend',
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginRight: 8,
    },
    trendIcon: {
        fontSize: 12,
    },
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#E5D4FA', // Light purple
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    footerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

export default LeaderboardScreen;
