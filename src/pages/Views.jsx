import React from 'react';
import GenericTaskPage from './GenericTaskPage';
import { getTodayTasks, filterTasksByStatus } from '../utils/taskHelpers';

export function Today() {
    return (
        <GenericTaskPage
            title="Hoy"
            filterFn={getTodayTasks}
            emptyMessage="¡No tienes tareas urgentes para hoy! Disfruta tu día."
        />
    );
}

export function NextActions() {
    return (
        <GenericTaskPage
            title="Siguiente Acción"
            filterFn={(tasks) => filterTasksByStatus(tasks, 'next')}
            emptyMessage="Crea claridad definiendo las siguientes acciones de tus proyectos."
        />
    );
}

export function Waiting() {
    return (
        <GenericTaskPage
            title="En Espera"
            filterFn={(tasks) => filterTasksByStatus(tasks, 'waiting')}
            emptyMessage="No estás esperando nada de nadie."
        />
    );
}

export function Someday() {
    return (
        <GenericTaskPage
            title="Algún día / Tal vez"
            filterFn={(tasks) => filterTasksByStatus(tasks, 'someday')}
            emptyMessage="Guarda aquí tus ideas locas para el futuro."
        />
    );
}
