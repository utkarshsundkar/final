import React, { createContext, useContext, ReactNode } from 'react';

interface WorkoutContextType {
    startWorkout: (workoutId: string) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: ReactNode; startWorkout: (workoutId: string) => void }> = ({ children, startWorkout }) => {
    return (
        <WorkoutContext.Provider value={{ startWorkout }}>
            {children}
        </WorkoutContext.Provider>
    );
};

export const useWorkout = () => {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkout must be used within a WorkoutProvider');
    }
    return context;
};
