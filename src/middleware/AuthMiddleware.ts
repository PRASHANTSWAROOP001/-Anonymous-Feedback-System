import { Request, Response, NextFunction } from "express";
import { JwtPayload, decode } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";

interface AuthenticatedRequest extends Request{
    user?: string | JwtPayload,
}


const validateAdmin= (req:AuthenticatedRequest,res:Response, next:NextFunction)=>{

    try {

        const token = req.header("Authorization")?.split(" ")[1];

        if(!token){
             res.status(401).json({
                success:false,
                message:"Token is not present."
            })

            return;
        }

        const validatedToken = verifyToken(token);


        const decodedToken = decode(token) as JwtPayload;

        if(decodedToken.exp && decodedToken.exp*1000 <=  Date.now()){

            res.status(400).json({
                success:false,
                message:"access token is expired."
            })

            return;

        }

        req.user = validatedToken;

        next()

        
    } catch (error) {

        res.status(403).json({
            success: false,
            message: "Invalid token.",
        });

        return;
    }

}

export {validateAdmin , AuthenticatedRequest}
