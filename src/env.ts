import * as dotenv from 'dotenv';
import { join } from "path";
import { exit } from 'process';
dotenv.config({
    path: join(__dirname, "../.env")
});

const requiredEnvVars = [
    "DATABASE_URL",
];

for (const arg of requiredEnvVars) {
    if (!(arg in process.env) || process.env[arg] == "" || process.env[arg] == undefined || process.env[arg] == null) {
        console.error(`Missing env variable: ${arg}`);
        exit(1);
    }
}
