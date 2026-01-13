'use client';

import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTasks } from '@/contexts/TaskContext';
import Calendar from '@/components/calendar/Calendar';

export default function CalendarPage() {
    const { tasks } = useTasks();

    return (
        <AppLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Calendario
                    </h1>
                </div>

                <div className="calendar-container">
                    <Calendar tasks={tasks} />
                </div>
            </div>
        </AppLayout>
    );
}
