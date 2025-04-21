import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

import { createNToken } from "../controller/TokenController";
import { parse } from "path";


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
   
        const id:number = req.user?.id!

        const topicId = req.params.id; // to create and save tokens 

        if(!topicId){
            res.status(400).json({
                success:false,
                message:"To send emails in next process. it needs topicId as params."
            })
        }

        const emailsWithTopics = req.emailsWithTopics

        console.log(emailsWithTopics, "email with topics")

        const dataToInsert = (req.emailsWithTopics ?? []).map(entry => ({
            name: entry.name || null,
            email: entry.email,
            topicId: parseInt(entry.topicId),
            adminId: id,
        }))

        await prisma.$transaction(async(tx)=>{

            for (const entry of dataToInsert){
               const email = await tx.email.upsert({
                    where:{
                        email: entry.email
                    },
                    update:{
                        name:entry.name
                    },
                    create:{
                        email:entry.email,
                        name:entry.name,
                        admin: {connect: {id: entry.adminId}} //adminId:entry.adminId
                    }
                })

                await tx.email.update({
                    where:{
                        id:email.id
                    },
                    data:{
                        topics: {connect: {id: parseInt(topicId)}}
                    }
                })
            }

            const emailCount = await tx.email.count({
                where:{
                    topics:{
                        some:{
                            id: parseInt(topicId)
                        }
                    }
                }
            })
            
            // generateTokens against emails
            const nTokens = await createNToken(emailCount);

            // mapout tokens to save in database
            const tokenToInsert = nTokens.map((val)=>({
                token:val,
                topicId:parseInt(topicId),
                expiresAt:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }))

            // save tokens to database

            await tx.token.createMany({
                data: tokenToInsert,
            })


        })
    
        res.status(200).json({
            success:true,
            message:"Emails and Tokens are successfully added to database 🥳"
        })

   
    } catch (error) {
        
        console.error("Error happend at processing transaction 😔", error);
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })

        return;


    }
}

export default saveEmails;