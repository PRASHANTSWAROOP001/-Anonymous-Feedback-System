import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "../utils/hash"
import { Request, Response} from "express";
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










export {addAdmin}