import { getNextId, Professional, readDb, Schedule, Service, writeDb } from "./db"

type CreateProffesional = Omit<Professional, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>;

export const addProfessional = async (professionalData: CreateProffesional): Promise<Professional> => {
    const db = readDb();

    // Simular la restricción UNIQUE del email
    if (db.professionals.some(p => p.email === professionalData.email)) {
        const error = new Error('A professional with this email already exists.');
        (error as any).code = '23505'; // Simula código de error de BD
        throw error;
    }

    const newProfessional: Professional = {
        id: getNextId(db.professionals),
        ...professionalData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    db.professionals.push(newProfessional); writeDb(db);
    return newProfessional;
};

export const getProfessionalById = async (id: number): Promise<Professional | undefined> => {
    const db = readDb();
    return db.professionals.find(p => p.id === id);
};

export const getProfessionals = async (): Promise<Professional[]> => {
    const db = readDb();
    return db.professionals;
};

export const getSchedules = async (professionalId: number): Promise<Schedule[]> => {
    const prof = await getProfessionalById(professionalId);
    console.log(prof);
    if (prof == undefined) return [];

    return prof.schedules
        .filter(s => s.professionalId === professionalId)
        // .sort(s => s.dayOfWeek);
};

export const getProfessionalServices = async (professionalId: number): Promise<Service[]> => {
    const prof = await getProfessionalById(professionalId);
    if (prof == undefined) return [];
    const db = readDb();

    console.log("prof:", prof);
    return db.services.filter(s => prof.services.includes(s.id))
};
