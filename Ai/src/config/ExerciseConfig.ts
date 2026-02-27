export interface Exercise {
    name: string;
    videoLink: string;
    category?: string;
}

export const EXERCISE_MASTER_LIST: Exercise[] = [
    { name: "Pushups", videoLink: "Mac", category: "Strength" },
    { name: "Burpees", videoLink: "Mac", category: "Cardio" },
    { name: "Air squats", videoLink: "Mac", category: "Lower" },
    { name: "Plank", videoLink: "https://www.pexels.com/video/a-one-legged-man-planking-on-the-gym-floor-4117854/", category: "Core" },
    { name: "Side Plank", videoLink: "https://www.pexels.com/video/woman-doing-an-exercise-position-6437947/", category: "Core" },
    { name: "Crunches", videoLink: "https://www.pexels.com/video/man-working-out-8026545/", category: "Core" },
    { name: "Jumping Jacks", videoLink: "https://www.pexels.com/video/woman-doing-jumping-jacks-5025960/", category: "Cardio" },
    { name: "Lunges", videoLink: "https://www.pexels.com/video/woman-exercising-outdoors-5025761/", category: "Lower" },
    { name: "Alternate toe touch", videoLink: "https://www.pexels.com/video/a-woman-doing-warm-up-exercise-5510139/", category: "Core" },
    { name: "Side bend", videoLink: "https://www.pexels.com/video/woman-in-black-activewear-stretching-her-arms-5510103/", category: "Mobility" },
    { name: "High Knees", videoLink: "https://www.pexels.com/video/woman-doing-high-knees-exercise-5025964/", category: "Cardio" },
    { name: "Calf Raises", videoLink: "https://www.pexels.com/video/intense-calf-workout-in-gym-setting-32115656/", category: "Lower" },
    { name: "Glute Bridge", videoLink: "https://www.pexels.com/video/woman-working-out-6525525/", category: "Lower" },
    { name: "Step-Ups", videoLink: "https://www.pexels.com/video/a-woman-doing-a-step-up-and-down-exercise-6739968/", category: "Lower" },
    { name: "Tricep Dips", videoLink: "https://www.pexels.com/video/a-man-working-out-4964658/", category: "Strength" },
    { name: "Toe touch", videoLink: "https://www.pexels.com/download/video/5510141/", category: "Mobility" },
    { name: "Russian Twists", videoLink: "https://www.pexels.com/video/woman-wearing-face-mask-while-working-out-10315283/", category: "Core" },
    { name: "Hip Rotation", videoLink: "https://www.pexels.com/video/woman-in-black-activewear-doing-hip-rotation-exercise-5510104/", category: "Mobility" },
    { name: "Leg Raises (abs)", videoLink: "https://www.pexels.com/video/a-man-doing-abdominal-workout-6455075/", category: "Core" },
    { name: "Mountain Climbers", videoLink: "https://www.pexels.com/video/woman-doing-mountain-climbers-exercise-6525467/", category: "Cardio" },
    { name: "Cross Sit up", videoLink: "https://www.pexels.com/video/man-doing-curl-ups-8026862/", category: "Core" },
    { name: "Mobility (hamstring)", videoLink: "https://www.pexels.com/video/woman-exercising-at-home-9001918/", category: "Mobility" },
    { name: "Shoulder stand", videoLink: "https://www.pexels.com/video/woman-doing-exercises-with-legs-up-in-the-air-3761093/", category: "Yoga" },
    { name: "Sit Ups", videoLink: "https://www.pexels.com/video/man-doing-ab-workout-4964657", category: "Core" },
    { name: "Plank butt kicks", videoLink: "https://www.pexels.com/video/woman-doing-ab-workout-6525511/", category: "Core" },
    { name: "Bulgarian Split Squats", videoLink: "https://www.pexels.com/video/man-doing-stretching-8859847", category: "Lower" },
    { name: "Knee supported Diamond pushups", videoLink: "https://www.pexels.com/video/outdoor-fitness-woman-doing-push-ups-on-deck-32025638", category: "Strength" },
    { name: "Standing knee raise", videoLink: "https://www.pexels.com/video/woman-working-out-at-home-8809586/", category: "Warm up" },
    { name: "High Knee Drive", videoLink: "https://www.pexels.com/video/women-working-out-4671955/", category: "Warm up" },
    { name: "Kick up jumping jacks", videoLink: "https://www.pexels.com/video/women-working-out-4671960/", category: "Warm up" },
    { name: "Knee rotations", videoLink: "https://www.pexels.com/video/young-woman-doing-warm-up-exercise-5510113/", category: "Warm up" },
    { name: "Yoga - Prasarita Padottanasana D", videoLink: "https://www.pexels.com/video/a-woman-exercising-at-home-7590376/", category: "Yoga" },
    { name: "Warm up - Wrist Circles", videoLink: "https://www.pexels.com/video/woman-working-out-at-the-gym-4943907/", category: "Warm up" },
    { name: "Yoga - Prasarita Padottanasana", videoLink: "https://www.pexels.com/video/a-woman-wearing-sports-bra-while-stretching-6739154/", category: "Yoga" },
    { name: "Yoga - Parsva Janu Sirsasana", videoLink: "https://www.pexels.com/video/woman-exercising-on-yoga-mat-7589756/", category: "Yoga" },
    { name: "Yoga - Ustrasana", videoLink: "https://www.pexels.com/video/woman-doing-yoga-6246140/", category: "Yoga" },
    { name: "Yoga - Baddha Konasana", videoLink: "https://www.pexels.com/video/woman-stretching-her-body-7590455/", category: "Yoga" },
    { name: "Yoga - Supta Kapotasana", videoLink: "https://www.pexels.com/video/female-doing-yoga-7590433/", category: "Yoga" },
    { name: "Yoga - Janu Shirshasana", videoLink: "https://www.pexels.com/video/a-woman-stretching-her-legs-7590424/", category: "Yoga" },
    { name: "Yoga - Parivrtta Parsvakonasana", videoLink: "https://www.pexels.com/video/a-woman-exercising-8232438/", category: "Yoga" },
    { name: "Yoga - Downward Facing Dog", videoLink: "https://www.pexels.com/video/a-woman-exercising-at-home-6707481/", category: "Yoga" },
    { name: "Meditation - Sukhasana", videoLink: "https://www.pexels.com/video/young-woman-meditating-on-the-outdoors-5389087/", category: "Yoga" },
    { name: "Yoga - Pranayam", videoLink: "https://www.pexels.com/video/people-doing-exercise-6438227/", category: "Yoga" },
    { name: "Yoga - Lotus Pose - Padmasana", videoLink: "https://www.pexels.com/video/woman-doing-yoga-6739110/", category: "Yoga" }
];

export const WORKOUT_PLANS = {
    beginner: {
        Monday: [
            { exercise: "Pushups", sets: 3, workTime: 35, restTime: 25 },
            { exercise: "Tricep Dips", sets: 3, workTime: 35, restTime: 25 },
            { exercise: "Plank", sets: 3, workTime: 35, restTime: 25 },
        ],
        // Add other days if needed
    },
    advanced: {
        Monday: [
            { exercise: "Pushups", sets: 4, workTime: 50, restTime: 15 },
            { exercise: "Tricep Dips", sets: 4, workTime: 50, restTime: 15 },
            { exercise: "Plank", sets: 4, workTime: 50, restTime: 15 },
        ],
    },
    mobility: {
        Daily: [
            { exercise: "Yoga - Downward Facing Dog", sets: 1, workTime: 60, restTime: 15 },
            { exercise: "Yoga - Ustrasana", sets: 1, workTime: 45, restTime: 15 },
            { exercise: "Yoga - Janu Shirshasana", sets: 1, workTime: 60, restTime: 15 },
            { exercise: "Yoga - Baddha Konasana", sets: 1, workTime: 60, restTime: 15 },
        ]
    }
};
