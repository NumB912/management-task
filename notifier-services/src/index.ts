import routerNotifier from "@infrastructure/api/express/route/route.js";
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import cookieParser from "cookie-parser";
const app = express();

const corsOptions = {
  origin: (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map((origin) => origin.trim()).filter(Boolean),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`[APP] ${req.method} ${req.url} — Origin: ${req.headers.origin}`);
  next();
});
app.use(cookieParser())
app.use(cors(corsOptions))
app.use("/", routerNotifier)
const port = Number(process.env.PORT || 3005);
app.listen(port, '0.0.0.0',()=>{
  console.log(`Notifier listening on port ${port}`)
})

