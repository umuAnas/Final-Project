import jwt from "jsonwebtoken";
import User from "../Model/usersModel.js";


export const isAdmin = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const user = await User
            .findById(userId)
            .select("role");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }

        next();

    } catch (error) {
        return res.status(500).json({
            message: "Server error during authorization"
        });
    }
};

export function verifyAccessToken(req, res, next) {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required. Please log in."
        });
    }

    
    const token = authHeader.split(" ")[1]; 

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        
        return res.status(401).json({
            message: "Access token expired or invalid"
        });
    }
}

