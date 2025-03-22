import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {decode, JwtPayload } from "jsonwebtoken";
import { any } from "zod";


interface RequestWithPayload extends Request{
    user?: JwtPayload,
    emailsWithTopics?: CsvFormat[]
}

interface CsvFormat{
    name ?:string,
    email:string,
    topicId:string
}


const prisma = new PrismaClient();

const saveEmails = async (req:RequestWithPayload, res:Response)=>{
    try {
   
        const id:number = req.user?.id

        const emailsWithTopics = req.emailsWithTopics

        console.log(emailsWithTopics, "email with topics")

        const dataToInsert = (req.emailsWithTopics ?? []).map(entry => ({
            name: entry.name || null,
            email: entry.email,
            topicId: parseInt(entry.topicId),
            adminId: id,
        }))

        const response = await prisma.email.createMany({
           data: dataToInsert as any,
           skipDuplicates:true
        })


        console.log("response at saveEmails", response);
    
        res.status(200).json({
            success:true,
            message:"Data added successfully in database."
        })

   
    } catch (error) {
        
        console.error("Error happend while saving emails", error);
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })

        return;


    }
}

export default saveEmails;