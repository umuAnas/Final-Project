import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "../Model/usersModel.js";
import generateAccessToken from "../utils/generateAccessToken.js";
import generateRefreshToken from "../utils/generateRefreshToken.js";
import sendEmail from "../utils/sendEmail.js";
import toSafeUser from "../utils/toSafeUser.js";


export const login = async (req, res) => {
    const { emailAddress, password } = req.body;
  
    try {
      const DUMMY_PASSWORD = process.env.DUMMY_PASSWORD;
  
      const user = await User.findOne({
        emailAddress,
        status: "active"
      });
  
      const hashToCompare = user
        ? user.password
        : DUMMY_PASSWORD;
  
      const isMatch = await bcrypt.compare(
        password,
        hashToCompare
      );
  
      if (!user || !isMatch) {
        return res.status(401).json({
          message: "Invalid email or password"
        });
      }
  
      if(user.status === "blocked"){
        return res.status(403).json({message:"Your account has been blocked.Please contact support"})
      }

      const accessToken = generateAccessToken(
        String(user._id),
        user.role
      );
  
      const refreshToken = generateRefreshToken(
        String(user._id),
        user.role
      );
  
    res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure:process.env.NODE_ENV==="production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path:"/",
            sameSite:"lax"
        });
  
      
  
      return res.status(200).json({
        message: "Login successful",
        user: toSafeUser(user),
        accessToken:accessToken
      });
  
    } catch (error) {
      return res.status(500).json({
        message: error.message
      });
    }
  };


export const forgotPassword = async (req, res) => {
    const { emailAddress } = req.body;

    try {
        const user = await User.findOne({ emailAddress });

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        const resetToken = jwt.sign(
            { id: user._id },
            process.env.JWT_PASSWORD_SECRET,
            { expiresIn: "15m" }
        );

        user.passwordResetToken = resetToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000;

        await user.save();

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

        await sendEmail(
            user.emailAddress,
            "Password Reset Request",
            `You requested a password reset. Please click this link to reset your password: ${resetLink}`
        );

        return res.status(200).json({
            message: "Reset link sent successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


export const resetPassword = async (req, res) => {
    const {
        token,
        newPassword
    } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            message: "Token and new password are required"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_PASSWORD_SECRET
        );

        const user = await User.findOne({
            _id: decoded.id,
            passwordResetToken: token,
            passwordResetExpires: {
                $gt: Date.now()
            }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired token"
            });
        }

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {
        return res.status(400).json({
            message: "Invalid or expired token"
        });
    }
};


export const updatePassword = async (req, res) => {
    const {
        oldPassword,
        newPassword
    } = req.body;

    const userId = req.user.id;

    try {
        const user = await User
            .findById(userId)
            .select("password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isMatch =
            await bcrypt.compare(
                oldPassword,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                message: "Current password incorrect"
            });
        }

        user.password =
            await bcrypt.hash(newPassword, 10);

        await user.save();

        return res.status(200).json({
            message: "Password changed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const logout = async (req, res) => {
    try {

        res.clearCookie("refresh_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax"
        });
//return new access token
        return res.status(200).json({
            message: "Logged out successfully"
        });
        
    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};







export const refresh = async (req, res) => {
    
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired refresh token" });
            }

            
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(403).json({ message: "User not found" });
            }

            
            const accessToken = generateAccessToken(String(user._id), user.role);

            
            return res.status(200).json({ accessToken });
        });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found. Please log in." });
    }

    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    
    const newAccessToken = generateAccessToken(decoded.id, decoded.role);

    
    return res.status(200).json({ 
      message: "Token refreshed successfully",
      accessToken: newAccessToken 
    });
    
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};


