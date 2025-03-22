import { PrismaClient, Prisma } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import z from 'zod'
import { JwtPayload } from "jsonwebtoken";
import { raw } from "@prisma/client/runtime/library";

interface AuthenticatedRequest extends Request {
    user?: JwtPayload
}


const prisma = new PrismaClient();

const TopicSchema = z.object({
    title: z.string(),
    description: z.string(),

})

const TopicUpdateSchema= z.object({
    title: z.string(),
    description: z.string(),
    id: z.number()

})




const addTopic = async (req: AuthenticatedRequest, res: Response) => {

    try {

        const validatedTopic = TopicSchema.parse(req.body);
        const adminId: number = req.user?.id

        const response = await prisma.topic.create({
            data: {
                ...validatedTopic,
                adminId: adminId
            }
        })

        if (response) {
            res.status(200).json({
                success: true,
                message: 'topic created successfully',
                data: response
            })
            return;
        }


    } catch (error) {


        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;
        }
        else if (error instanceof z.ZodError) {
            console.error("validation failed for data");
            res.status(400).json({
                success: false,
                message: "Data is not valid"
            })
            return;
        }
        else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;

        }
    }

}

const deleteTopic = async(req:AuthenticatedRequest, res:Response)=>{

    try {
        
        const adminId: number = req.user?.id

        const {topicId} = req.body;

        //console.log(req.body, "body at del topic")

        const response = await prisma.topic.delete({
            where:{
                id:parseInt(topicId),
                adminId:adminId
            }
        })

        res.status(200).json({
            success:true,
            message:"Topic deleted successfully"
        })


    } catch (error) {
        
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;
        }
        else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;
        }
        
    }
}

const updateTopic = async(req:AuthenticatedRequest, res:Response)=>{
    try {
        
        const updatedTopic = TopicUpdateSchema.parse(req.body);
        const adminId: number = req.user?.id

        const response = await prisma.topic.update({
            data:{
                title:updatedTopic.title,
                description:updatedTopic.description
            },
            where:{
                id:updatedTopic.id
            }
        })

        res.status(200).json({
            success:true,
            message:"Topic Updated Successfully"
        })


    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;
        }
        else if (error instanceof z.ZodError) {
            console.error("validation failed for data");
            res.status(400).json({
                success: false,
                message: "Data is not valid"
            })
            return;
        }
        else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;

        }
    }
}

const getAllTopic = async(req:AuthenticatedRequest, res:Response)=>{
    try {
        
        const adminId: number = req.user?.id

        const response = await prisma.topic.findMany({
            where:{
                adminId: adminId
            }
        })

        res.json({
            success:true,
            message:"All Topics Fetched Successfully",
            data:response
        })

    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;
        }
        else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;
        }
        
    }
}

const getSpecificTopic = async (req:AuthenticatedRequest, res:Response)=>{
    try {
        
        const id = req.params.id;

        if(!id){
            throw new Error("topic id is not present");
        }

        const response = await prisma.topic.findFirstOrThrow({
            where:{
                id:parseInt(id)
            }
        })

        res.json({
            success:true,
            message:"Topic is found",
            data:response
        })


    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;
        }
        else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return;
        }
        
    }
}



export {addTopic, deleteTopic, updateTopic, getAllTopic, getSpecificTopic};

