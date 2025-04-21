import { Request, Response } from "express";
import z from "zod";
import { comparePassword } from "../utils/hash";
import { PrismaClient, Prisma , Admin} from "@prisma/client";
import jwt from "jsonwebtoken";


const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET!; // this says i know this is defined
const NODE_ENV = process.env.NODE_ENV!;

const adminLoginSchema = z.object({
  email: z.string().email("Email is not correct"),
  password: z.string().min(6, "No password shall be less than 6 letters"),
});

const loginAdmin = async (req: Request, res: Response) => {
  try {
    const validateData = adminLoginSchema.parse(req.body);

    // check if email exists in database in adminTable
    const adminDetails : Admin|null = await prisma.admin.findUnique({
      where: {
        email: validateData.email,
      },
    });

    if (!adminDetails) {
      res.status(401).json({
        success: false,
        message: "Error email could not be found",
      });
      return;
    }

    const matchPassword = await comparePassword(
      adminDetails.password,
      validateData.password
    );

    if (!matchPassword) {
      res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
      return;
    }

    const accessToken = jwt.sign(
      {
        name: adminDetails.name,
        id: adminDetails.id,
        email: adminDetails.email,
      },
      JWT_SECRET,
      {
        algorithm: "HS256",
        issuer: "ADMIN",
        expiresIn: "15m",
      }
    );

    const refreshToken = await createAndSaveRefreshToken(req,res, adminDetails);

    res.cookie("refreshToken", refreshToken, {
      secure: NODE_ENV === 'production',
      httpOnly:true,
      sameSite: "strict",
      expires: new Date( Date.now() + 24*60*60*1000)
    })

    res.json({
      success:true,
      message:"Logged in successfully",
      accessToken,
    })


  } catch (error) {

    console.error("Error happend at the login endpoint", error);

    res.status(500).json({
      success:false,
      message:"Some error happend at our end."
    })

  }
};


const createAndSaveRefreshToken = async(req:Request, Response: Response,adminDetails:Admin):Promise<string>=>{
    // this will create both refreshToken and save it in database and also spin up the session in database
    try {

        const saveRefreshToken = await prisma.refreshToken.create({
            data:{
                expiresAt: new Date( Date.now() + 24*60*60*1000),
                revoked:false,
                adminId:adminDetails.id
            }
        })

        const saveSession = await prisma.session.create({
            data:{
                refreshToken: saveRefreshToken.id,
                adminId:adminDetails.id,
                ipAddress:req.ip || null,
                userAgent: req.headers["user-agent"] || null,
                expiredAt:saveRefreshToken.expiresAt,
                location:null,
            }
        })

        return saveRefreshToken.id;
        
    } catch (error) {
        console.error("Error happend while creating refreshToken and sessions" , error);
        throw new Error("Error happend while creating refreshToken and sessions")
    }
}

const logoutAdmin = async (req:Request, res:Response)=>{

  try {

    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
      res.status(400).json({
        success:false,
        message:"No refresh cookie could be found"
      })

      return;
    }

    const validateRefreshToken = await prisma.refreshToken.findUnique({
      where:{
        id:refreshToken
      }
    })

    if(!validateRefreshToken){
      res.status(400).json({
        success:false,
        message:"Invalid refresh token!"
      })
      return;
    }
    else if(validateRefreshToken.revoked == true ||validateRefreshToken.expiresAt <= new Date()){
      res.status(400).json({
        success:false,
        message:"Expired or already used refresh tokens"
      })

      return;
    }

    await prisma.refreshToken.update({where:{id:validateRefreshToken.id}, data:{revoked:true}})

    await prisma.session.update({where:{refreshToken:validateRefreshToken.id}, data:{revoked:true, revokedAt: new Date()}})

    res.clearCookie("refreshToken")

    res.json({
      success:true,
      message:"Logged out successfully"
    })


  } catch (error) {
    console.error("Error happend while logging out", error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
    
  }

}

const renewAccessToken = async (req:Request, res:Response)=>{
  try {

    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
      res.status(400).json({
        success:false,
        message:"Refresh Token in unavilable"
      })
      return;
    }

    const validateRefreshToken = await prisma.refreshToken.findUnique({
      where:{
        id:refreshToken
      }
    })

    if(!validateRefreshToken){
      res.status(400).json({
        success:false,
        message:"Invalid refresh token!"
      })
      return;
    }
    else if(validateRefreshToken.revoked == true ||validateRefreshToken.expiresAt <= new Date()){
      res.status(400).json({
        success:false,
        message:"Expired or already used refresh tokens. Please login again."
      })
      return;
    }

    const adminDetails = await prisma.admin.findUnique({
      where:{
        id:validateRefreshToken.adminId
      }
    })

    const accessToken = jwt.sign(
      {
        name: adminDetails?.name,
        id: validateRefreshToken.adminId,
        email: adminDetails?.email,
      },
      JWT_SECRET,
      {
        algorithm: "HS256",
        issuer: "ADMIN",
        expiresIn: "15m",
      }
    );

    res.json({
      success:true,
      message:"Token generated successfully",
      accessToken
    })

    
  } catch (error) {

    console.error("Error happend while refreshing access token", error);

    res.status(500).json({
      success:false,
      message:"Internal server error happend at our end"
    })
    
  }
}



export {loginAdmin, logoutAdmin, renewAccessToken}