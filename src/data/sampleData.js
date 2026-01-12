import { v4 as uuidv4 } from 'uuid';

export const INITIAL_PROJECTS = [
    { id: 'p1', name: 'Personal', color: '#3B82F6', status: 'active' },
    { id: 'p2', name: 'Trabajo', color: '#EF4444', status: 'active' },
    { id: 'p3', name: 'Hogar', color: '#10B981', status: 'active' },
];

export const INITIAL_CONTEXTS = [
    { id: 'c1', name: 'Casa', icon: 'Home' },
    { id: 'c2', name: 'Oficina', icon: 'Briefcase' },
    { id: 'c3', name: 'Computadora', icon: 'Monitor' },
    { id: 'c4', name: 'Teléfono', icon: 'Phone' },
    { id: 'c5', name: 'Recados', icon: 'ShoppingBag' },
];

export const SAMPLE_TASKS = [
    {
        id: uuidv4(),
        title: 'Revisar presupuesto mensual',
        nextAction: 'Revisar excel de gastos',
        notes: '',
        projectId: 'p1',
        context: 'c3',
        priority: 'P1',
        dueDate: new Date().toISOString(),
        status: 'next',
        isActionable: true,
        createdAt: new Date().toISOString(),
    },
    {
        id: uuidv4(),
        title: 'Comprar leche',
        nextAction: 'Ir al supermercado',
        notes: '',
        projectId: 'p3',
        context: 'c5',
        priority: 'P3',
        dueDate: null,
        status: 'inbox', // Still processing
        isActionable: null,
        createdAt: new Date().toISOString(),
    },
];
