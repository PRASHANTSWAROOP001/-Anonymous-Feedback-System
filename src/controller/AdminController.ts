import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/hash"
import { generateToken, verifyToken } from "../utils/jwt"
import { Request, Response, NextFunction } from "express";
import { z } from "zod"


const prisma = new PrismaClient();

const adminSchema = z.object({
    name: z.string().min(3, "Minimum three letter name is allowed"),
    email: z.string().email("email must be correct"),
    password: z.string().min(6),
    dob: z.date().optional()
})




const addAdmin = async (req: Request, res: Response):Promise<any> => {

    try {

        const validateData = adminSchema.parse(req.body);

        const existingAdmin = await prisma.admin.findUnique({
            where: {
                email: validateData.email
            }
        })

        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Email is already in the use."
            })
        }

        const hashedPassword = await hashPassword(validateData.password);

        const response = await prisma.admin.create({
            data: {
                ...validateData,
                password: hashedPassword
            }
        })

        return res.status(200).json({
            success: true,
            message: "Admin User Created Successfully",
            data: { name: response.name, email: response.email, id: response.id }
        })

    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            return res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
        }
        else if (error instanceof z.ZodError) {
            console.error("validation failed for data");
            return res.status(400).json({
                success: false,
                message: "Data is not valid"
            })
        }
        else {
            console.error("Some error happend", error);
            return res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })

        }


    }

}


const adminLoginSchema = z.object({
    email: z.string().email("Email is not correct"),
    password: z.string().min(6, "No password shall be less than 6 letters")
})


// type loginDTO = z.infer<typeof adminLoginSchema>


const loginAdmin = async (req: Request, res: Response):Promise<any> => {

    try {

        const validateLogin = adminLoginSchema.parse(req.body);

        const userDetails = await prisma.admin.findUnique({
            where: {
                email: validateLogin.email
            }
        })

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User could not be found for entered email"
            })
        }

        const hashedDbPassword: string = userDetails.password;

        const isPasswordMatched: boolean = await comparePassword(hashedDbPassword, validateLogin.password);

        if (!isPasswordMatched) {
            return res.status(400).json({
                success: false,
                message: "Password does not match."
            })
        }
        else {
            const token = generateToken({
                name: userDetails.name,
                id: userDetails.id,
                email: userDetails.email
            });

            return res.status(200).json({
                success: true,
                message: "You are verified now",
                token: token
            })
        }


    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            return res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
        }
        else if (error instanceof z.ZodError) {
            console.error("validation failed for data");
            return res.status(400).json({
                success: false,
                message: "Data is not valid"
            })
        }
        else {
            console.error("Some error happend", error);
            return res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })

        }
    }

}



export {addAdmin, loginAdmin}