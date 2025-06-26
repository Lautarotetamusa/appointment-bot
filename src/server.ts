import './env'

import express, { Request, Response, NextFunction } from 'express';
import { handleErrors } from './middlewares/errors';

import clienteRouter from './routes/client';
import professionalRouter from './routes/professional';
import serviceRouter from './routes/service';
import appointmentRouter from './routes/appointment';
import slotRouter from './routes/slot';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    }
    next();
});

app.use('/client', clienteRouter);
app.use('/professional', professionalRouter);
app.use('/service', serviceRouter);
app.use('/appointment', appointmentRouter);
app.use('/slot', slotRouter);
app.use(handleErrors);

app.get('/', (req: Request, res: Response) => {
    res.send("Server its alive!");
});

app.listen(port, (err) => {
    if (err) {
        console.log("Server cannot start: ", err);
    } else {
        console.log(`Server is running on http://localhost:${port}`);
    }
});
