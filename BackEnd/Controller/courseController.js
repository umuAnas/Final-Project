import Course from "../Model/courseModel.js";
import User from "../Model/usersModel.js";


export const createCourse = async (req, res) => {
    try {
        const {
            courseName,
            courseCode,
            description,
            courseDuration,
            instructorId,
            batchNumber,
            programType
        } = req.body;

        
        const instructor =
            await User.findById(instructorId);

        if (!instructor) {
            return res.status(404).json({
                message: "Instructor not found"
            });
        }

        const existingCourse =
            await Course.findOne({ courseCode });

        if (existingCourse) {
            return res.status(400).json({
                message:
                    "A course with this course code already exists."
            });
        }

        const newCourse =
            await Course.create({
                courseName,
                courseCode,
                description,
                courseDuration,
                instructorId,
                batchNumber,
                programType
            });

        return res.status(201).json({
            message: "Course created successfully!",
            data: newCourse
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


export const getAllCourses = async (req, res) => {
    try {
        const courses =
            await Course.find()
                .populate(
                    "instructorId",
                    "fullName emailAddress"
                );

        return res.status(200).json({
            data: courses
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedCourse =
            await Course.findByIdAndUpdate(
                id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updatedCourse) {
            return res.status(404).json({
                message: "Course not found."
            });
        }

        return res.status(200).json({
            message:
                "Course updated successfully!",
            data: updatedCourse
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCourse =
            await Course.findByIdAndDelete(id);

        if (!deletedCourse) {
            return res.status(404).json({
                message: "Course not found."
            });
        }

        return res.status(200).json({
            message:
                "Course deleted successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};