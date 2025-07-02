import { Client, getNextId, MockDatabase, readDb, writeDb } from "./db"

export const addClient = async (clientData: Omit<Client, 'id' | 'registrationDate'>): Promise<Client> => {
    const db = readDb();
    const newClient: Client = {
        id: getNextId(db.clients),
        ...clientData,
        registrationDate: new Date(),
    };
    db.clients.push(newClient);
    writeDb(db);
    return newClient;
};

export const getClientById = async (id: number): Promise<Client | undefined> => {
    const db = readDb();
    return db.clients.find(c => c.id === id);
};

export const getClients = async (): Promise<Client[]> => {
    const db = readDb();
    return db.clients;
};

