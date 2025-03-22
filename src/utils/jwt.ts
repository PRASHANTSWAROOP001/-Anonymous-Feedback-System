import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const JWT_SECRET:string = process.env.JWT_SECRET as string;
const JWT_EXPIRY:string = process.env.EXPIRY_TIME as string;


console.log(JWT_SECRET, JWT_EXPIRY);

interface JwtTokenPayload{
    id:number,
    email:string,
    name:string
}


export const generateToken = (payload:JwtTokenPayload):string=>{

  const token =  jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h"
  })

  return token

}

export const verifyToken = (token:string)=>{
    try {

        const validate = jwt.verify(token, JWT_SECRET);
        return validate
        
    } catch (error) {
        
        if (error instanceof jwt.JsonWebTokenError){
            console.log("Token is invalid");
            return {
                error:"jwt token is invalid"
            }

        }
        else if (error instanceof jwt.TokenExpiredError){
            console.log("Token is expired")
            return {
                error:"Token Expired"
            }
        }
        else{
            console.error("Unexpected Error happend", error);
            return {
                error:"Unexpected Error"
            }
        }
    }
}

