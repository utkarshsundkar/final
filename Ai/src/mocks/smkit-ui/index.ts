// Mock for @sency/react-native-smkit-ui
// The real SDK caused build failures on simulator. This mock replaces it with no-ops.

export const configure = async (_key: string): Promise<boolean> => {
    console.log('[SMKitUI Mock] configure called - SDK removed');
    return true;
};

export const startAssessment = async (_params: any): Promise<any> => {
    console.log('[SMKitUI Mock] startAssessment called - SDK removed');
    return {};
};

export const startCustomWorkout = async (_params: any): Promise<any> => {
    console.log('[SMKitUI Mock] startCustomWorkout called - SDK removed');
    return {};
};

export const startWorkoutProgram = async (_params: any): Promise<any> => {
    console.log('[SMKitUI Mock] startWorkoutProgram called - SDK removed');
    return {};
};

export const setSessionLanguage = (_lang: any): void => {
    console.log('[SMKitUI Mock] setSessionLanguage called - SDK removed');
};

export const setEndExercisePreferences = (_pref: any): void => {
    console.log('[SMKitUI Mock] setEndExercisePreferences called - SDK removed');
};

export const setCounterPreferences = (_pref: any): void => {
    console.log('[SMKitUI Mock] setCounterPreferences called - SDK removed');
};

export default {
    configure,
    startAssessment,
    startCustomWorkout,
    startWorkoutProgram,
    setSessionLanguage,
    setEndExercisePreferences,
    setCounterPreferences,
};
