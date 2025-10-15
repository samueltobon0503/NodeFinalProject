import dotenv from 'dotenv';
dotenv.config()
import { generateToken, verifyToken } from './infraestructure/auth/jwt-service';
import express, { Application } from "express";
import observable$ from "./observable";
import appRouter from "./application/routes/app-routes";
import { dbConnection } from "./infraestructure/config/mongoDB";



dbConnection();

const PORT:number = 4000;
const app : Application = express();

app.use (express.json());

app.use('/api', appRouter)

const token = generateToken({
    email: 'samuel@gmail.com',
    role: 'admin',
    id: "1"
})
console.log(token)

const decoded = verifyToken(token)

console.log(decoded)

// observable$.subscribe({
//     next: value => console.log(`Got it ${value}`),
//     error: err => console.log(`Got it ${err}`),
//     complete: () => console.log('Completadinho')

// })

app.listen(PORT, () => {
    console.log(`Server running... at port ${PORT}`)
})