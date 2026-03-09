import notifee, { TimestampTrigger, TriggerType, RepeatFrequency, AuthorizationStatus } from '@notifee/react-native';
import { Platform, Alert } from 'react-native';

class NotificationService {
    async requestPermission() {
        await notifee.requestPermission();
    }

    async scheduleWorkoutReminder(hour: number = 20, minute: number = 0) {
        // Keeping this for backward compatibility if needed, but we'll use repeating logic below
        await this.scheduleRepeatingReminders();
    }

    async scheduleRepeatingReminders() {
        const channelId = await notifee.createChannel({
            id: 'workout-reminders',
            name: 'Workout Reminders',
            importance: 4,
            sound: 'workout_reminder',
        });

        const reminders = [
            { hour: 9, message: "Rise and grind! Don't let the morning slip by without your workout. ☀️" },
            { hour: 13, message: "U missed your workout! Afternoon is the perfect time for a quick session. 💪" },
            { hour: 17, message: "Workout check-in! You're almost there, let's crush it before dinner. 🏋️‍♂️" },
            { hour: 21, message: "Last chance! Finish your workout now and end the day like a champion. 🌙" },
        ];

        // Cancel existing ones first to avoid duplicates
        await this.cancelWorkoutReminder();

        const now = new Date();

        for (const rem of reminders) {
            const date = new Date();
            date.setHours(rem.hour);
            date.setMinutes(0);
            date.setSeconds(0);

            // If time has passed today, schedule for tomorrow
            if (date.getTime() <= now.getTime()) {
                date.setDate(date.getDate() + 1);
            }

            const trigger: TimestampTrigger = {
                type: TriggerType.TIMESTAMP,
                timestamp: date.getTime(),
                repeatFrequency: RepeatFrequency.DAILY,
            };

            await notifee.createTriggerNotification(
                {
                    id: `workout-reminder-${rem.hour}`,
                    title: '🏋️ Workout Reminder',
                    body: rem.message,
                    android: {
                        channelId,
                        smallIcon: 'ic_notification',
                        largeIcon: 'ic_launcher',
                        color: '#FF6B35',
                        sound: 'workout_reminder',
                        pressAction: { id: 'default' },
                    },
                    ios: {
                        critical: true,
                        sound: 'workout_reminder.aiff',
                    }
                },
                trigger,
            );
        }

        console.log('Repeating workout reminders scheduled');
    }

    async scheduleFriendRepeatingReminders(friendName: string = 'Your friend') {
        const channelId = await notifee.createChannel({
            id: 'friend-workout-reminders',
            name: 'Friend Workout Reminders',
            importance: 4,
            sound: 'workout_reminder',
        });

        const reminders = [
            { hour: 10, message: `${friendName} hasn't started their day yet. Maybe a quick nudge? ☀️` },
            { hour: 14, message: `${friendName} missed their afternoon workout. Give them a push! 💪` },
            { hour: 18, message: `Still no workout from ${friendName}. Time to motivate them! 🏋️‍♂️` },
            { hour: 22, message: `Final call! ${friendName} hasn't performed their workout today. 🌙` },
        ];

        await this.cancelWorkoutReminder();

        const now = new Date();

        for (const rem of reminders) {
            const date = new Date();
            date.setHours(rem.hour);
            date.setMinutes(0);
            date.setSeconds(0);

            if (date.getTime() <= now.getTime()) {
                date.setDate(date.getDate() + 1);
            }

            const trigger: TimestampTrigger = {
                type: TriggerType.TIMESTAMP,
                timestamp: date.getTime(),
                repeatFrequency: RepeatFrequency.DAILY,
            };

            await notifee.createTriggerNotification(
                {
                    id: `friend-reminder-${rem.hour}`,
                    title: '🤝 Friend Accountability',
                    body: rem.message,
                    android: {
                        channelId,
                        smallIcon: 'ic_notification',
                        largeIcon: 'ic_launcher',
                        color: '#FF6B35',
                        sound: 'workout_reminder',
                        pressAction: { id: 'default' },
                    },
                    ios: {
                        critical: true,
                        sound: 'workout_reminder.aiff',
                    }
                },
                trigger,
            );
        }
        console.log('Friend repeating reminders scheduled');
    }

    async cancelWorkoutReminder() {
        const hours = [9, 13, 17, 21];
        const friendHours = [10, 14, 18, 22];
        const ids = [
            ...hours.map(h => `workout-reminder-${h}`),
            ...friendHours.map(h => `friend-reminder-${h}`)
        ];
        await Promise.all(ids.map(id => notifee.cancelNotification(id)));
        console.log('All workout reminders cancelled');
    }
}

export default new NotificationService();
