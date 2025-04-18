import multer, {FileFilterCallback } from "multer";
import fs from "fs/promises"
import path from "path";
import { Request, Response } from "express";


// const storage = multer.diskStorage({
//     destination: (req:Request, file:Express.Multer.File, callback) =>{

//         callback(null, 'uploads/');
        
//     },
//     filename: (req:Request, file:Express.Multer.File, callback)=> {

//         const uniqueFileName:string = `${Date.now()}-${file.originalname}`;

//         req.body.uploadFileName = uniqueFileName;

//         callback(null,uniqueFileName)
        
//     },
// })




// const upload = multer({storage:storage, fileFilter:fileFilter});


const storage = multer.memoryStorage();

const fileFilter = (req:Request, file:Express.Multer.File , callback:FileFilterCallback)=>{
    if (file.mimetype === "text/csv" || file.mimetype === "text/plain") {
        callback(null, true);
    } else {
        callback(new Error("Only text and CSV files are allowed"));
    }

}

const upload = multer({storage, fileFilter})

export default upload
