'use client';

import React, { useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Task } from '@/lib/types';
import { useRouter } from 'next/navigation';
import './calendar.css'; // We'll create this for custom overrides if needed

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarProps {
    tasks: Task[];
}

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: Task;
}

export default function Calendar({ tasks }: CalendarProps) {
    const router = useRouter();
    const [view, setView] = React.useState<View>(Views.WEEK);
    const [date, setDate] = React.useState(new Date());

    const events: CalendarEvent[] = useMemo(() => {
        return tasks
            .filter(task => task.due_date && task.status !== 'completed')
            .map(task => {
                const startDate = new Date(task.due_date!);
                // Default to 1 hour duration if no end time (which tasks don't have usually)
                const endDate = new Date(startDate);
                endDate.setHours(startDate.getHours() + 1);

                return {
                    id: task.id,
                    title: task.title,
                    start: startDate,
                    end: endDate,
                    allDay: false, // You might want logic to determine if it's all day
                    resource: task,
                };
            });
    }, [tasks]);

    const handleSelectEvent = (event: CalendarEvent) => {
        // Open task modal or navigate
        // For now, let's just log or maybe navigate to a detail view if we had one,
        // but typically we'd want to open the task modal.
        // Since we don't have the modal trigger prop here easily without lifting state,
        // we might just leave it or implementing a simple alert/modal.
        // Or better, we can inject the onSelect handler from parent.
        // For this version, let's just do nothing or maybe console log.
        console.log('Selected task:', event.resource);
        // Ensure the parent page handles interactions if needed, 
        // but for read-only view this is fine.
    };

    const handleOnView = (newView: View) => {
        setView(newView);
    };

    const handleOnNavigate = (newDate: Date) => {
        setDate(newDate);
    };

    return (
        <div className="h-[calc(100vh-200px)] min-h-[500px] bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <BigCalendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                view={view}
                onView={handleOnView}
                date={date}
                onNavigate={handleOnNavigate}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={(event: CalendarEvent) => {
                    const priorityColor =
                        event.resource.priority === 'P1' ? '#ef4444' :
                            event.resource.priority === 'P2' ? '#f59e0b' :
                                event.resource.priority === 'P3' ? '#3b82f6' : '#6b7280';

                    return {
                        style: {
                            backgroundColor: priorityColor,
                            borderRadius: '4px',
                            opacity: 0.8,
                            color: 'white',
                            border: '0px',
                            display: 'block'
                        }
                    };
                }}
            />
        </div>
    );
}
