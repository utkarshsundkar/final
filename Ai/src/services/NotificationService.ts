import notifee, { TimestampTrigger, TriggerType, RepeatFrequency } from '@notifee/react-native';
import { Platform } from 'react-native';

class NotificationService {
    async requestPermission() {
        await notifee.requestPermission();
    }

    async scheduleWorkoutReminder(hour: number = 20, minute: number = 0) {
        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'workout-reminders',
            name: 'Workout Reminders',
            importance: 4, // high
        });

        // Create a time-based trigger
        const date = new Date(Date.now());
        date.setHours(hour);
        date.setMinutes(minute);
        date.setSeconds(0);

        // If the time has already passed today, schedule for tomorrow
        if (date.getTime() <= Date.now()) {
            date.setDate(date.getDate() + 1);
        }

        const trigger: TimestampTrigger = {
            type: TriggerType.TIMESTAMP,
            timestamp: date.getTime(),
            repeatFrequency: RepeatFrequency.DAILY,
        };

        // Create the notification
        await notifee.createTriggerNotification(
            {
                id: 'missed-workout-reminder',
                title: '🏋️ Time to Crush It!',
                body: "You haven't completed your workout yet! Don't break the streak.",
                android: {
                    channelId,
                    pressAction: {
                        id: 'default',
                    },
                },
                ios: {
                    critical: true,
                }
            },
            trigger,
        );

        console.log(`Workout reminder scheduled for ${hour}:${minute}`);
    }

    async cancelWorkoutReminder() {
        await notifee.cancelNotification('missed-workout-reminder');
        console.log('Workout reminder cancelled');
    }

    async testNotification() {
        const channelId = await notifee.createChannel({
            id: 'test',
            name: 'Test Channel',
        });

        await notifee.displayNotification({
            title: 'Test Workout Notification',
            body: 'This is what your reminder will look like!',
            android: {
                channelId,
            },
        });
    }
}

export default new NotificationService();
