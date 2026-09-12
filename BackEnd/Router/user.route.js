import express from "express";

import {register,viewUser,updateUser,getAllStudents,getAllInstructors,registerUserByAdmin,getStudent
} from "../Controller/userController.js";

import {verifyAccessToken, isAdmin} from "../Middlewares/authMiddleware.js";

import RegistrationSchema from "../Schema/RegistrationSchema.js";


import { validate }from "../Middlewares/validate.js";


export const userRoute =
    express.Router();


userRoute.post(
    "/register",
    validate(RegistrationSchema),
    register
);


userRoute.get(
    "/view",
    verifyAccessToken,
    isAdmin,
    viewUser
);


userRoute.put(
    "/update",
    verifyAccessToken,
    isAdmin,
    updateUser
);


userRoute.get(
    "/students-list",
    verifyAccessToken,
    isAdmin,
    getAllStudents
);
userRoute.get(
    "/instructors-list",
    verifyAccessToken,
    isAdmin,
    getAllInstructors
);
userRoute.post(
    "/register-staff",
    verifyAccessToken,
    isAdmin,
    registerUserByAdmin
);

userRoute.get(
    "/student",
    verifyAccessToken,
    getStudent
);
