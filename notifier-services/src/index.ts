import routerNotifier from "@infrastructure/api/express/route/route.js";
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import cookieParser from "cookie-parser";
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
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
app.listen(3005,()=>{
  console.log("server đang mở tại port 3005")
})

