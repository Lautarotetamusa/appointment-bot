import * as fs from 'fs';
import * as path from 'path';

// Define las interfaces para la estructura de tu base de datos mock
export interface Client {
    id: number;
    name: string;
    lastName?: string | null;
    whatsappPhone: string;
    email?: string | null;
    registrationDate: Date;
}

export interface Professional {
    id: number;
    name: string;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    description?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    services: number[];
    schedules: Schedule[];
}

export interface Service {
    id: number;
    serviceName: string;
    durationMinutes: number;
    price: number;
    description?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface Slot {
    professionalId: number;
    serviceId: number;
    date: string;
    startTime: string; // HH:MM:SS
    endTime: string; // HH:MM:SS
}

export interface Schedule {
    id: number;
    professionalId: number;
    dayOfWeek: number; // 0-6
    startTime: string; // HH:MM:SS
    endTime: string; // HH:MM:SS
    createdAt: Date;
    updatedAt: Date;
}

export interface Appointment {
    id: number;
    clientId: number;
    professionalId: number;
    serviceId: number;
    appointmentDate: string; // YYYY-MM-DD
    startTime: string; // HH:MM:SS
    endTime: string; // HH:MM:SS
    status: string;
    notes?: string | null;
    isReminderSent: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MockDatabase {
    clients: Client[];
    professionals: Professional[];
    services: Service[];
    appointments: Appointment[];
}

const DB_FILE_PATH = path.resolve(__dirname, '../db.json'); // Apunta a la raíz del proyecto

export const readDb = (): MockDatabase => {
    if (!fs.existsSync(DB_FILE_PATH)) {
        // Si el archivo no existe, inicialízalo con datos vacíos
        const emptyDb: MockDatabase = {
            clients: [],
            professionals: [],
            services: [],
            appointments: [],
        };
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(emptyDb, null, 2));
        return emptyDb;
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const db = JSON.parse(data);
    // Convertir strings de fecha a objetos Date si es necesario para lógica compleja
    // Esto es un ejemplo, se necesitaría para cada campo Date
    // db.clients.forEach(c => c.registrationDate = new Date(c.registrationDate));
    return db;
};

export const writeDb = (db: MockDatabase): void => {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2));
};

export function getNextId<T extends {id: number}>(data: T[]){
    if (data.length > 0){
        return Math.max(...data.map(c => c.id)) + 1;
    }
    return 1;
}
