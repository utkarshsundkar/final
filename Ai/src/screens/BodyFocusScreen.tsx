import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Data for Body Focus Areas
const BODY_FOCUS_DATA = [
    { title: 'Shoulders', img: require('../../assets/shoulder-exercise.jpg') },
    { title: 'Chest', img: require('../../assets/chest-exercise.jpg') },
    { title: 'Thighs', img: require('../../assets/thigh-exercise.jpg') },
    { title: 'Hips & Glutes', img: require('../../assets/hips-glutes-exercise.jpg') },
    { title: 'Calves', img: require('../../assets/calves-exercise.jpg') },
    { title: 'Arms', img: require('../../assets/arms-exercise.jpg') },
    { title: 'Abs', img: require('../../assets/abs-exercise.jpg') },
    { title: 'Oblique', img: require('../../assets/plank-core-exercise.jpg') },
];

// Workout Details for each area
const BODY_FOCUS_DETAILS: Record<string, any> = {
    'Shoulders': {
        title: 'Boulder Shoulders',
        description: 'Build broad and strong shoulders with this targeted routine.',
        exercises: [
            { name: 'Shoulder Taps', detail: '20 reps' },
            { name: 'Overhead Press', detail: '12 reps' },
            { name: 'Reverse Sit to Table Top', detail: '12 reps' },
        ]
    },
    'Chest': {
        title: 'Chest Chisel',
        description: 'Sculpt a powerful chest with these classic moves.',
        exercises: [
            { name: 'Push-ups', detail: '15 reps' },
            { name: 'Shoulder Taps Plank', detail: '20 reps' },
            { name: 'High Plank Hold', detail: '30 seconds' },
        ]
    },
    'Thighs': {
        title: 'Thunder Thighs',
        description: 'Strengthen your quads and hamstrings for powerful legs.',
        exercises: [
            { name: 'Lunge', detail: '12 reps' },
            { name: 'Air Squat', detail: '15 reps' },
            { name: 'Ski Jumps', detail: '20 reps' },
            { name: 'Jumps', detail: '15 reps' },
            { name: 'Standing Knee Raise Left', detail: '15 reps' },
            { name: 'Standing Knee Raise Right', detail: '15 reps' },
        ]
    },
    'Hips & Glutes': {
        title: 'Glute Gains',
        description: 'Target the glutes and hips for shape and stability.',
        exercises: [
            { name: 'Glutes Bridge', detail: '15 reps' },
            { name: 'Skater Hops', detail: '20 reps' },
            { name: 'Hamstring Mobility', detail: '30 seconds' },
        ]
    },
    'Calves': {
        title: 'Calf Craze',
        description: 'Don\'t skip calves! Build definition and power.',
        exercises: [
            { name: 'Standing Calf Raises', detail: '4 x 20 reps' },
            { name: 'Seated Calf Raises', detail: '3 x 15 reps' },
            { name: 'Jump Rope', detail: '2 minutes' },
        ]
    },
    'Arms': {
        title: 'Arm Arsenal',
        description: 'Pump up your biceps and triceps.',
        exercises: [
            { name: 'Bicep Curls', detail: '3 x 12 reps' },
            { name: 'Tricep Dips', detail: '3 x 15 reps' },
            { name: 'Hammer Curls', detail: '3 x 12 reps' },
        ]
    },
    'Abs': {
        title: 'Core Crusher',
        description: 'Strengthen your core for better stability and abs.',
        exercises: [
            { name: 'Crunches', detail: '3 x 20 reps' },
            { name: 'Plank', detail: '60 seconds' },
            { name: 'Leg Raises', detail: '3 x 15 reps' },
        ]
    },
    'Oblique': {
        title: 'Oblique Obliterator',
        description: 'Target the sides of your core for a tapered waist.',
        exercises: [
            { name: 'Russian Twists', detail: '3 x 20 reps' },
            { name: 'Side Plank', detail: '45 sec each' },
            { name: 'Bicycle Crunches', detail: '3 x 20 reps' },
        ]
    },
};

const BodyFocusScreen = () => {
    const navigation = useNavigation();
    const [selectedWorkout, setSelectedWorkout] = useState<any>(null);

    const handleItemPress = (title: string) => {
        const details = BODY_FOCUS_DETAILS[title];
        if (details) {
            setSelectedWorkout({ ...details, id: title }); // Add ID/Title to object
        } else {
            // Fallback
            setSelectedWorkout({
                title: title,
                description: `Targeted workout for ${title}.`,
                exercises: [
                    { name: 'Standard Exercise 1', detail: '3 x 12 reps' },
                    { name: 'Standard Exercise 2', detail: '3 x 12 reps' },
                ]
            });
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Image
                        source={{ uri: 'https://img.icons8.com/ios-filled/50/000000/left.png' }}
                        style={{ width: 24, height: 24 }}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Body Focus Area</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {BODY_FOCUS_DATA.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.itemContainer}
                            onPress={() => handleItemPress(item.title)}
                        >
                            <View style={styles.imageContainer}>
                                <Image source={typeof item.img === 'string' ? { uri: item.img } : item.img} style={styles.image} resizeMode="cover" />
                                <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.1)' }} />
                            </View>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Workout Details Modal */}
            <Modal visible={!!selectedWorkout} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.detailsModalContent}>
                        <View style={styles.detailDragIndicator} />

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.detailTitle}>{selectedWorkout?.title}</Text>
                                <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
                                    <Text style={{ fontSize: 24, color: '#999' }}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.detailDesc}>{selectedWorkout?.description}</Text>

                            <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, fontFamily: 'Lexend' }}>Exercises</Text>

                            {selectedWorkout?.exercises.map((ex: any, idx: number) => (
                                <View key={idx} style={styles.exerciseItem}>
                                    <View style={styles.exerciseIndex}>
                                        <Text style={styles.exerciseIndexText}>{idx + 1}</Text>
                                    </View>
                                    <View style={styles.exerciseInfo}>
                                        <Text style={styles.exerciseName}>{ex.name}</Text>
                                        <Text style={styles.exerciseDetail}>{ex.detail}</Text>
                                    </View>
                                </View>
                            ))}

                            <View style={{ height: 100 }} />
                        </ScrollView>

                        <View style={{ position: 'absolute', bottom: 30, left: 24, right: 24 }}>
                            <TouchableOpacity
                                style={styles.startButton}
                                activeOpacity={0.8}
                                onPress={() => {
                                    // Close modal and navigate back to Home
                                    // User will need to tap the body part on Home screen to start workout
                                    setSelectedWorkout(null);
                                    navigation.goBack();
                                }}
                            >
                                <Text style={styles.startButtonText}>Go to Home</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F7F4',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EBEBEB',
        backgroundColor: '#fff',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
        fontFamily: 'Lexend',
    },
    scrollContent: {
        padding: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    itemContainer: {
        width: (width - 60) / 2,
        alignItems: 'center',
        marginBottom: 32,
    },
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: 'hidden',
        backgroundColor: '#E0E0E0',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        fontFamily: 'Lexend',
        textAlign: 'center',
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    detailsModalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        height: '85%',
        padding: 24,
    },
    detailDragIndicator: {
        width: 40,
        height: 5,
        backgroundColor: '#ddd',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    detailTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000',
        fontFamily: 'Lexend',
        marginBottom: 8,
    },
    detailDesc: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'Lexend',
        marginBottom: 24,
        lineHeight: 22,
    },
    exerciseItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    exerciseIndex: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F8F7F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    exerciseIndexText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FF6B35',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
        fontFamily: 'Lexend',
    },
    exerciseDetail: {
        fontSize: 14,
        color: '#888',
        fontFamily: 'Lexend',
    },
    startButton: {
        backgroundColor: '#FF6B35',
        height: 56,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 20,
        marginBottom: 20,
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'Lexend',
    },
});

export default BodyFocusScreen;
