import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";

interface AuthenticatedRequest extends Request{
    user?: string | JwtPayload
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
