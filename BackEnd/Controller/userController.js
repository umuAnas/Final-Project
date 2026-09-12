import bcrypt from "bcrypt";
import User from "../Model/usersModel.js";
import toSafeUser from "../utils/toSafeUser.js";
import sendEmail, {transport} from "../utils/sendEmail.js";


export const register = async (req, res) => {
    try {
        const {
            emailAddress,
            password,
            phone,
            role,
            status,
            passwordResetToken,
            passwordResetExpires,
            ...otherData
        } = req.body;

        const existingUser = await User.findOne({
            $or: [
                { emailAddress },
                { phone }
            ]
        });

        if (existingUser) {
            const field =
                existingUser.emailAddress === emailAddress
                    ? "Email"
                    : "Phone";
            return res.status(400).json({
                message: `${field} already exists`
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const newUser = await User.create({
            ...otherData,
            emailAddress,
            phone,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User registered successfully",
            data: toSafeUser(newUser)
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const viewUser = async (req, res) => {
    try {
        const users = await User
            .find()
            .select("-password");

        return res.status(200).json({
            data: users
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const updateUser = async (req, res) => {
    try {
        const data = req.body;

        const updatedUser =
            await User.findOneAndUpdate(
                { phone: data.phone },
                { $set: data },
                {
                    new: true,
                    runValidators: true
                }
            ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "Phone number not found"
            });
        }

        return res.status(200).json({
            message: "Successfully updated",
            data: updatedUser
        });

    } catch (error) {
        return res.status(500).json({
            message: "Server error"
        });
    }
};


export const getAllStudents = async (req, res) => {
    try {
        const students = await User
            .find({ role: "student" })
            .select("-password");

        return res.status(200).json({
            data: students
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export const getAllInstructors = async (req, res) => {
    try {
        const instructors = await User
            .find({ role: "instructor" })
            .select("-password -passwordResetToken -passwordResetExpires");

        return res.status(200).json({
            data: instructors
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};
export const registerUserByAdmin =async (req,res) => {
    try {
        const {
            emailAddress,
            password,
            phone,
            role,
            passwordResetToken,
            passwordResetExpires,
            ...otherData
        } = req.body;

      const allowedRoles = ["instructor", "student"];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          message: "Role must be instructor or student"
        });
      }

      const existUser=await User.findOne({$or:[{emailAddress:emailAddress},{phone:phone}]
    });
      if(existUser){
        return res.status(400).json({message:"User with this email or phone already exists"})
      } 
      const tempPassword=Math.random().toString(36).slice(-8)
      const hashedPassword =await bcrypt.hash(tempPassword,10)
      const newUser =await User.create({
            emailAddress,
            phone,
            password:hashedPassword,
            role,
            ...otherData
            
});
 const mailOptions ={
    from:process.env.EMIL_USER,
    to:emailAddress,
    subject:"Your Account Credentials",
    text:`Hello,\n\nYour account has been successfully created.Your temporary password is:${tempPassword}\n\nPlease log in and update your password immediately. `
 };
 await transporter.sendMail(mailOptions);
return res.status(201).json({message:"User registered successfully and temporary password sent via email",user:toSafeUser(newUser)})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export const getStudent = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(
            "-password -passwordResetToken -passwordResetExpires"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role !== "student") {
            return res.status(403).json({
                message: "Access denied. Student only."
            });
        }

        return res.status(200).json({
            message: "Student found",
            user: toSafeUser(user)
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Server error"
        });
    }
};