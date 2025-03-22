import { PrismaClient, Prisma } from "@prisma/client";

import { NextFunction, Request, Response } from "express";

import z from "zod";



interface FeedbackWithTokenId extends Request{
    tokenId?:number
}

const prisma = new PrismaClient();

const feedbackSchema = z.object({
    rating: z.number(),
    review: z.string(),
    tokenId:z.number(),
    topicId:z.number()
});

// now this addFeedback will send an tokenId so we can update tokens as used



const addFeedback = async (
    req: FeedbackWithTokenId,
    res: Response,
    next: NextFunction
) => {
    try {
        const validatedFeedback = feedbackSchema.parse(req.body);


        const feedback = await prisma.feedback.create({
            data: {
                rating: validatedFeedback.rating,
                review: validatedFeedback.review,
                topicId: validatedFeedback?.topicId,
            },
        });

        req.tokenId = validatedFeedback?.tokenId

        next()

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side.",
            });

            return;
        } else if (error instanceof z.ZodError) {
            console.error("validation failed for data");
            res.status(400).json({
                success: false,
                message: "Data is not valid",
            });

            return;
        } else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side.",
            });

            return;
        }
    }
};


const getAllFeedback = async (req: Request, res: Response) => {

    try {

        const topicId = req.body;

        if (!topicId) {
            res.status(400).json({
                success: false,
                message: "topic id not present"
            })

            return;
        }

        const feedbackList = await prisma.feedback.findMany({
            where: {
                topicId: parseInt(topicId)
            }
        })


        res.json({
            success: true,
            message: "All feedback fetched successfully",
            data: feedbackList
        })
    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side.",
            });

            return;
        }

        else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side.",
            });

            return;
        }

    }
}

const getSpecificFeedback = async (req:Request, res:Response)=>{

    try {
        
        const id = req.body;

        if(!id){
            res.status(404).json({
                success:false,
                message:"id is not present to find the details of the feedback"
            })
        }

        const feedback = await prisma.feedback.findUnique({
            where:{
                id:parseInt(id)
            }
        })

        res.json({
            success:true,
            message:"feedback fetched successfully",
            data:feedback
        })


    } catch (error) {


        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side.",
            });

            return;
        }

        else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side.",
            });

            return;
        }
        
    }

}

export {addFeedback,getAllFeedback,getSpecificFeedback}