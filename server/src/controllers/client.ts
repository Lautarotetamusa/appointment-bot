import { Request, Response } from 'express';
import { clientSchema, createClientSchema } from '../schema/client';
import { eq } from 'drizzle-orm';
import { db } from '../db';

export const getAllClients = async (req: Request, res: Response) => {
    const clients = await db.select().from(clientSchema);
    res.status(200).json({
        length: clients.length,
        data: clients
    });
};

export const getClientById = async (req: Request, res: Response) => {
    const clientWpp = req.params.whatsapp;
    const result = await db.select()
        .from(clientSchema)
        .where(eq(clientSchema.whatsapp, clientWpp));

    if (result.length == 0) {
        res.status(404).json({
            message: `Client with whatsapp number ${clientWpp} not found`
        });
        return
    }

    res.status(200).json(result[0]);
};

export const createClient = async (req: Request, res: Response) => {
    const clientData = createClientSchema.parse(req.body);

    const duplicatedWpp = await db.select()
        .from(clientSchema)
        .where(eq(clientSchema.whatsapp, clientData.whatsapp))
        .limit(1);

    if (duplicatedWpp.length > 0) {
        res.status(409).json({
            message: `Client with whatsapp number '${clientData.whatsapp}' already exists`,
        })
        return
    }

    const [client] = await db.insert(clientSchema)
        .values(clientData)
        .returning();

    res.status(201).json({
        message: 'Client created successfully', 
        client: client
    });
};
