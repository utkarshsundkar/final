import notifee, { TimestampTrigger, TriggerType, RepeatFrequency } from '@notifee/react-native';
import { Platform } from 'react-native';

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

    async cancelWorkoutReminder() {
        const ids = [9, 13, 17, 21].map(h => `workout-reminder-${h}`);
        await Promise.all(ids.map(id => notifee.cancelNotification(id)));
        console.log('All workout reminders cancelled');
    }

    async testNotification() {
        const channelId = await notifee.createChannel({
            id: 'test',
            name: 'Test Channel',
            sound: 'workout_reminder',
        });

        const messages = [
            "U missed your workout! Let's get moving!",
            "Time to crush those goals! 💪",
            "Don't break the streak! 🏋️‍♂️"
        ];
        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        await notifee.displayNotification({
            title: 'Test Workout Notification',
            body: randomMsg,
            android: {
                channelId,
                sound: 'workout_reminder',
            },
            ios: {
                sound: 'workout_reminder.aiff',
            }
        });
    }
}

export default new NotificationService();
