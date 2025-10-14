import express, { Application } from "express";
import observable$ from "./observable";
import appRouter from "./application/routes/app-routes";
import { dbConnection } from "./infraestructure/config/mongoDB";

dbConnection();

const PORT:number = 4000;
const app : Application = express();

app.use (express.json());

// app.use ("/", (request: Request, response: Response) => {
//     response.json({
//         ok: true,
//         message: 'Response from server'
//     })
// });

app.use('/api', appRouter)

// observable$.subscribe({
//     next: value => console.log(`Got it ${value}`),
//     error: err => console.log(`Got it ${err}`),
//     complete: () => console.log('Completadinho')

// })

app.listen(PORT, () => {
    console.log(`Server running... at port ${PORT}`)
})