import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import crypto from "crypto";
import { JwtPayload } from "jsonwebtoken";

import z from "zod"

interface AuthenticatedRequest extends Request {
    user?: JwtPayload
}


interface FeedbackWithTokenId extends Request{
    tokenId?:number
}


const userLoginSchema = z.object({
    email:z.string().email(),
    token:z.string()
})

const prisma = new PrismaClient();


async function createRandomKey(): Promise<string> {

    return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (error, buffer) => {
            if (error) {
                reject(error)
            }
            else {
                resolve(buffer.toString("hex"))
            }
        })
    })
}



const createNToken = async (num: number): Promise<string[]> => {

    // first we generate n promises

    // then we use Promise.allSettled method

    // now we return only those values which are fullfilled and then map out every Promise as string and return its value


    const promises = Array.from({ length: num }, () => (createRandomKey()))
    return Promise.allSettled(promises).then((results) => {
        return results.filter((result) => result.status === 'fulfilled')
            .map((result) => (result as PromiseFulfilledResult<string>).value)
    })


}
// this will be used the admin side 
const addTokensToDatabase = async (req: AuthenticatedRequest, res: Response) => {

    try {

        const topicId = req.params.id

        if (!topicId) {
            throw new Error("topicId is not present")
        }

        const countEmails = await prisma.email.count({
            where: {
                topicId: parseInt(topicId)
            }
        })

        const nTokens = await createNToken(countEmails)

        const dataToInsert = nTokens.map((val)=>({
            token:val,
            topicId:parseInt(topicId),
            expiresAt:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }))

        const response = await prisma.token.createMany({
            data: dataToInsert as any
        })

        res.json({
            success:true,
            message:"Tokens added successfully",
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


const loginUsingToken = async (req:Request, res:Response) =>{
    try {

        const validateLoginDetails = userLoginSchema.parse(req.body)

        const search_email = await prisma.email.findUniqueOrThrow({
            where:{
                email:validateLoginDetails.email
            }
        })

        const search_token =await prisma.token.findUniqueOrThrow({
            where:{
                token:validateLoginDetails.token
            }
        })

        if(search_email && search_token){

            const currentDate = new Date();

            const expiryDate = search_token.expiresAt

            if ( currentDate > expiryDate){
                res.status(409).json({
                    success:false,
                    message:"We are no longer accepting the feedback. Feeback time is over."
                })
                return;
            }
            else if(search_token.isUsed == false){

                res.json({
                    success:true,
                    message:"You are logged in successfully",
                    tokenId:search_token.id,
                    topicId:search_token.topicId
                })
                // store tokenId and topicId in frontend 
            }


        }
        else{

            res.status(400).json({
                success:false,
                message:"Auth failure against token and emails provided."
            })

            return

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

//middleware to update the token to isUsed = True and returns the status

//this middeware will be used with validate token

// flow first user enters the token and email 

// then we verify the token and email from database

// once token is validated we take token, token id and topicId for which the feedback will be submitted

// validate token then add feedback then updateToken toUsed = True




const updateToken = async (req:FeedbackWithTokenId, res:Response)=>{

    try {

        const tokenId = req.tokenId;
        
        if(!tokenId){
            res.status(400).json({
                success:false,
                message:'token is missing for the updates'
            })
            return;
        
        }


        const updatedToken =  await prisma.token.update({
            where:{
                id:tokenId
            },
            data:{
                isUsed:true
            }
        })

      res.json({
        success:true,
        message:"You feedback is submitted and token is used. thanks for feedback"
       })

       return



    } catch (error) {

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Prisma Error", error.message);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })

            return
            
        }
        else {
            console.error("Some error happend", error);
            res.status(500).json({
                success: false,
                message: "internal server error happend at our side."
            })
            return
           
        }

    }
}

export {addTokensToDatabase, loginUsingToken , updateToken}










/* 🚀 Understanding Promise.all() vs Promise.allSettled()

// ✅ `Promise.all()` -> Fails Fast: If ANY promise fails, the entire Promise.all() fails
async function promiseAllExample() {
    try {
        const results = await Promise.all([
            Promise.resolve("✅ Success 1"),
            Promise.reject("❌ Error"),  // If any promise fails, it stops here
            Promise.resolve("✅ Success 2") // This never runs
        ]);
        console.log("Promise.all results:", results);
    } catch (error) {
        console.error("Promise.all failed:", error); // ❌ Only this executes if any promise rejects
    }
}
promiseAllExample();


 ✅ `Promise.allSettled()` -> Waits for ALL promises (No matter success or failure)
async function promiseAllSettledExample() {
    const results = await Promise.allSettled([
        Promise.resolve("✅ Success 1"),
        Promise.reject("❌ Error 1"),
        Promise.resolve("✅ Success 2"),
        Promise.reject("❌ Error 2")
    ]);

    console.log("Promise.allSettled results:", results);

    // Filtering only successful promises
    const successfulResults = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => (result as PromiseFulfilledResult<string>).value);

    console.log("Filtered successful results:", successfulResults);
}
promiseAllSettledExample();


📝 Quick Notes:
- `Promise.all()` -> If ANY fails, the entire operation fails.
- `Promise.allSettled()` -> Waits for ALL promises, returns success & failure separately.
- We check `status === "fulfilled"` in `Promise.allSettled()` to filter out only successful values.
- `Promise.all()` is great for **"all must succeed"** scenarios (e.g., loading multiple API calls together).
- `Promise.allSettled()` is great for **"collect whatever succeeds"** scenarios (e.g., generating multiple tokens, fetching from multiple sources).
*/

