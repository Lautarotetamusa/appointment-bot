import { drizzle } from 'drizzle-orm/node-postgres';
import { exit } from 'process';

console.log(process.env.DATABASE_URL);
export const db = drizzle({
    connection: process.env.DATABASE_URL, 
    casing: 'snake_case'
})

async function testDBconnection() {
    try {
        await db.execute('select 1');
    } catch {
        console.error("Drizzle its not correctly configured");
        exit(1)
    }
}

testDBconnection();
