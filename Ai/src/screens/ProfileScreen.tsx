import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    Alert,
    Linking,
    ActionSheetIOS,
    Modal,
    TextInput,
} from 'react-native';
import { responsive } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import AuthService, { User } from '../services/AuthService';

interface ProfileScreenProps {
    navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
    const [user, setUser] = useState<User | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        let currentUser = await AuthService.getCurrentUser();
        try {
            const storedImage = await AsyncStorage.getItem('profile_picture');
            if (storedImage && currentUser) {
                currentUser = { ...currentUser, profilePicture: storedImage };
            }
        } catch (e) {
            console.error('Failed to load profile picture', e);
        }
        setUser(currentUser);
    };

    const handleEditPhoto = async () => {
        const options: ImageLibraryOptions = {
            mediaType: 'photo',
            quality: 0.8 as any,
        };

        const result = await launchImageLibrary(options);
        console.log('Image picker result:', result);

        if (result.errorMessage) {
            Alert.alert('Error', result.errorMessage);
        } else if (result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            console.log('Selected image URI:', uri);

            if (uri) {
                try {
                    console.log('Attempting to save to AsyncStorage...');
                    await AsyncStorage.setItem('profile_picture', uri);
                    console.log('Successfully saved to AsyncStorage');

                    // Verify it was saved
                    const saved = await AsyncStorage.getItem('profile_picture');
                    console.log('Verification - Retrieved from AsyncStorage:', saved);

                    setUser(prev => prev ? { ...prev, profilePicture: uri } : null);
                    Alert.alert('Success', 'Profile picture updated!');
                } catch (e) {
                    console.error('AsyncStorage error:', e);
                    Alert.alert('Error', 'Failed to save profile picture: ' + e);
                }
            } else {
                console.log('No URI found in result');
            }
        } else {
            console.log('User cancelled or no assets');
        }
    };

    const handleSupport = async () => {
        const email = 'support@arthlete.fit';
        const mailUrl = `mailto:${email}`;

        const openEmail = async (url: string) => {
            try {
                await Linking.openURL(url);
            } catch (err) {
                Alert.alert('No Email App Found', 'Please configure an email account or install an email app to send support emails.');
            }
        };

        if (Platform.OS === 'ios') {
            const gmailUrl = `googlegmail:///co?to=${email}`;
            try {
                const canOpenGmail = await Linking.canOpenURL(gmailUrl);
                if (canOpenGmail) {
                    ActionSheetIOS.showActionSheetWithOptions(
                        {
                            options: ['Cancel', 'Mail App', 'Gmail'],
                            cancelButtonIndex: 0,
                        },
                        (buttonIndex) => {
                            if (buttonIndex === 1) openEmail(mailUrl);
                            else if (buttonIndex === 2) openEmail(gmailUrl);
                        }
                    );
                } else {
                    openEmail(mailUrl);
                }
            } catch (error) {
                openEmail(mailUrl);
            }
        } else {
            // Android: Open default mail app (usually allows choosing Gmail)
            openEmail(mailUrl);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        await AuthService.signOut();
                        // Navigate to Login screen
                        if (navigation) {
                            navigation.replace('Login');
                        }
                    },
                },
            ]
        );
    };

    const handleDeleteAccount = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (deleteConfirmText.toUpperCase() !== 'DELETE') {
            Alert.alert('Invalid Input', 'Please type DELETE to confirm account deletion.');
            return;
        }

        try {
            setShowDeleteModal(false);
            // Call delete account API
            await AuthService.deleteAccount();
            Alert.alert('Account Deleted', 'Your account has been successfully deleted.');
            // Navigate to Login screen
            if (navigation) {
                navigation.replace('Login');
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
        } finally {
            setDeleteConfirmText('');
        }
    };

    return (
        <View style={styles.mainContainer}>
            {/* Content */}
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    {/* Profile Picture */}
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImageWrapper}>
                            <Image
                                source={user?.profilePicture ? { uri: user.profilePicture } : { uri: 'https://img.icons8.com/ios-filled/200/ffffff/user.png' }}
                                style={user?.profilePicture ? styles.uploadedProfileImage : styles.profileImage}
                            />
                        </View>
                        <TouchableOpacity style={styles.editButton} onPress={handleEditPhoto}>
                            <Text style={styles.editButtonText}>Edit Photo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <View style={styles.userInfoCard}>
                        <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'User'}</Text>
                        <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
                    </View>

                    {/* Stats Cards - Keeping Static for now or fetch later */}


                    {/* Settings Options */}
                    <View style={styles.settingsContainer}>
                        <Text style={styles.sectionTitle}>Settings</Text>



                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={() => navigation?.navigate('Privacy')}
                        >
                            <Text style={styles.settingText}>Privacy & Security</Text>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/chevron-right.png' }}
                                style={styles.chevronIcon}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.settingItem}
                            onPress={handleSupport}
                        >
                            <Text style={styles.settingText}>Help & Support</Text>
                            <Image
                                source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/chevron-right.png' }}
                                style={styles.chevronIcon}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.settingItem, styles.deleteAccountItem]}
                            onPress={handleDeleteAccount}
                        >
                            <Text style={styles.deleteAccountText}>Delete Account</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.settingItem, styles.logoutItem]}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Delete Account Confirmation Modal */}
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                }}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Delete Account</Text>

                        <View style={styles.warningBox}>
                            <Text style={styles.warningIcon}>⚠️</Text>
                            <Text style={styles.warningText}>
                                This action cannot be undone. All your data, including workout history, progress, and credits will be permanently deleted.
                            </Text>
                        </View>

                        <Text style={styles.confirmLabel}>
                            Type <Text style={styles.deleteWord}>DELETE</Text> to confirm:
                        </Text>

                        <TextInput
                            style={styles.confirmInput}
                            value={deleteConfirmText}
                            onChangeText={setDeleteConfirmText}
                            placeholder="Type DELETE here"
                            placeholderTextColor="#999"
                            autoCapitalize="characters"
                            autoCorrect={false}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmText('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.deleteButton,
                                    deleteConfirmText.toUpperCase() !== 'DELETE' && styles.deleteButtonDisabled
                                ]}
                                onPress={confirmDelete}
                                disabled={deleteConfirmText.toUpperCase() !== 'DELETE'}
                            >
                                <Text style={[
                                    styles.deleteButtonText,
                                    deleteConfirmText.toUpperCase() !== 'DELETE' && styles.deleteButtonTextDisabled
                                ]}>
                                    Delete Account
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 12, // Matched with Home/Progress
        borderBottomWidth: 1, // Matched
        borderBottomColor: '#EBEBEB', // Matched
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24, // Matched
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: responsive.rf(18),
        color: '#000',
        letterSpacing: 1.5, // Matched
        fontFamily: 'Lexend',
        fontWeight: '500', // Matched
    },
    newButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    plusCircle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FF8C42',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    plusIcon: {
        color: '#FFF',
        fontSize: 18,
        marginTop: -2,
        fontFamily: 'Lexend',
    },
    newButtonText: {
        color: '#000',
        fontSize: 12,
        letterSpacing: 0.5,
        fontFamily: 'Lexend',
    },
    scrollContent: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingTop: 10,
        paddingBottom: 120,
        ...responsive.getContainerStyle(),
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImageWrapper: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FF8C42',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    profileImage: {
        width: 60,
        height: 60,
        tintColor: '#FFF',
    },
    uploadedProfileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FF8C42',
    },
    editButtonText: {
        color: '#FF8C42',
        fontSize: 14,
        fontFamily: 'Lexend',
    },
    userInfoCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    userName: {
        fontSize: responsive.rf(24),
        color: '#000',
        marginBottom: 5,
        fontFamily: 'Lexend',
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'Lexend',
    },

    settingsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: responsive.rf(18),
        color: '#000',
        marginBottom: 15,
        fontFamily: 'Lexend',
    },
    settingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    settingText: {
        fontSize: 15,
        color: '#000',
        fontFamily: 'Lexend',
    },
    chevronIcon: {
        width: 16,
        height: 16,
        tintColor: '#999',
    },
    logoutItem: {
        borderBottomWidth: 0,
        marginTop: 10,
    },
    logoutText: {
        fontSize: 15,
        color: '#FF4444',
        fontFamily: 'Lexend',
        fontWeight: '400',
    },
    deleteAccountItem: {
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    deleteAccountText: {
        fontSize: 15,
        color: '#CC0000',
        fontFamily: 'Lexend',
        fontWeight: '400',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: responsive.rf(22),
        fontWeight: '700',
        color: '#000',
        fontFamily: 'Lexend',
        marginBottom: 16,
        textAlign: 'center',
    },
    warningBox: {
        backgroundColor: '#FFF3CD',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    warningIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    warningText: {
        flex: 1,
        fontSize: 14,
        color: '#856404',
        fontFamily: 'Lexend',
        lineHeight: 20,
    },
    confirmLabel: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'Lexend',
        marginBottom: 12,
    },
    deleteWord: {
        fontWeight: '700',
        color: '#CC0000',
    },
    confirmInput: {
        borderWidth: 2,
        borderColor: '#DDD',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        fontFamily: 'Lexend',
        marginBottom: 24,
        color: '#000',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#F0F0F0',
    },
    cancelButtonText: {
        fontSize: 15,
        color: '#333',
        fontFamily: 'Lexend',
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#CC0000',
    },
    deleteButtonDisabled: {
        backgroundColor: '#DDD',
    },
    deleteButtonText: {
        fontSize: 15,
        color: '#FFF',
        fontFamily: 'Lexend',
        fontWeight: '600',
    },
    deleteButtonTextDisabled: {
        color: '#999',
    },
});

export default ProfileScreen;
