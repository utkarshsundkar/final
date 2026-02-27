// Mock for @sency/react-native-smkit-ui/src/SMWorkout
// satisifies the usage in App.tsx

export enum BodyZone {
    FullBody = 'FullBody',
    UpperBody = 'UpperBody',
    LowerBody = 'LowerBody',
    Core = 'Core',
}

export enum WorkoutDifficulty {
    LowDifficulty = 'LowDifficulty',
    MediumDifficulty = 'MediumDifficulty',
    HighDifficulty = 'HighDifficulty',
}

export enum WorkoutDuration {
    Short = 'Short',
    Medium = 'Medium',
    Long = 'Long',
}

export enum Language {
    English = 'English',
}

export enum UIElement {
    Timer = 'Timer',
    RepsCounter = 'RepsCounter',
    GaugeOfMotion = 'GaugeOfMotion',
}

export enum EndExercisePreferences {
    TargetBased = 'TargetBased',
}

export enum CounterPreferences {
    Default = 'Default',
}

export class SMExercise {
    constructor(...args: any[]) { }
}

export class SMAssessmentExercise {
    constructor(...args: any[]) { }
}

export class SMWorkout {
    constructor(...args: any[]) { }
}

export default {
    BodyZone,
    WorkoutDifficulty,
    WorkoutDuration,
    Language,
    UIElement,
    EndExercisePreferences,
    CounterPreferences,
    SMExercise,
    SMAssessmentExercise,
    SMWorkout,
};
