import { readDb, Service } from "./db"

export const getServiceById = async (id: number): Promise<Service | undefined> => {
    const db = readDb();
    return db.services.find(s => s.id === id);
};

export const getServices = async (): Promise<Service[]> => {
    const db = readDb();
    return db.services;
};

