import '../src/env'

import { reset, seed } from "drizzle-seed";
import { appointmentSchema } from "../src/schema/appointment";
import { db } from "../src/db";
import { clientSchema } from "../src/schema/client";
import { professionalSchema } from "../src/schema/professional";
import { serviceSchema } from "../src/schema/service";

async function main() {
    await reset(db, { 
        clientSchema,
        professionalSchema,
        serviceSchema,
        appointmentSchema 
    });

    await seed(db, { 
        clientSchema,
        professionalSchema,
        serviceSchema,
        appointmentSchema 
    });
}

main();
