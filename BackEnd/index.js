import "dotenv/config";
import express from "express";
import cors from "cors";
import DBConnect from "./Config/dbConfig.js";


import { userRoute } from "./Router/user.route.js";
import { authRoute } from "./Router/auth.route.js";
import { courseRoute } from "./Router/course.route.js";
import { paymentRoute } from "./Router/payment.route.js";

import cookieParser from "cookie-parser";


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin:"http://localhost:5173",
        credentials:true,
        
    })
);

// Routes
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/course", courseRoute);
app.use("/api/payment", paymentRoute);

// Error handler
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        message: err.message || "Internal Server Error"
    });
});


// Connect database first, then start server
DBConnect();
const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});