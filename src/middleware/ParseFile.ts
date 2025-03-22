// import fs from 'fs';
// import Papaparse from "papaparse";
// import { Request, Response, NextFunction } from 'express';

// interface EmailRequest extends Request{
//     emailsWithTopics?: CsvFormat[],
// } 

// interface CsvFormat{
//     name ?:string,
//     email:string,
//     topicId:string
// }

// const parseEmail = async(req:EmailRequest, res:Response, next:NextFunction)=>{

//     console.log(req.body.uploadFileName)
//     if (!req.body.uploadFileName){
        
//         res.status(400).json({
//             success:false,
//             message:"file is missing"
//         })
//         return;
//     }
//     const uniqueFileName = req.body.uploadFileName;
//     const filePath = `uploads/${uniqueFileName}`

//     fs.readFile(filePath,"utf-8",(error, data)=>{
//         if(error){
//             console.error("Error happend while reading file");
//             return;
//         }

//         console.log(data);

//         Papaparse.parse(data, {
//             header:true,
//             skipEmptyLines:true,
//             delimiter:",",

//             complete: (results)=> {

//                 const emailsWithTopics:CsvFormat[] = results.data.
//                 map((row:any) => ({
//                     email:row.email?.trim(),
//                     topicId: row.topicId,
//                 }))
        

//                 console.log(emailsWithTopics)

//                 if(!emailsWithTopics || emailsWithTopics.length === 0){
//                     res.status(400).json({
//                         success:false,
//                         message:"No valid email address is present"
//                     })

//                     return;
//                 }
                

//                 req.emailsWithTopics = emailsWithTopics;
//                 next();
//             },

//         })


//     })
// }

// export default parseEmail;


import fs from "fs/promises"; // Use fs.promises for async operations
import Papaparse from "papaparse";
import { Request, Response, NextFunction } from "express";

interface EmailRequest extends Request {
  emailsWithTopics?: CsvFormat[];
}

interface CsvFormat {
  name?: string;
  email: string;
  topicId: string;
}

const parseEmail = async (req: EmailRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.body.uploadFileName) {
       res.status(400).json({
        success: false,
        message: "File is missing",
      });

      return;
    }

    const uniqueFileName = req.body.uploadFileName;
    const filePath = `uploads/${uniqueFileName}`;

    // Read file asynchronously
    const data = await fs.readFile(filePath, "utf-8");

    const parsedData = Papaparse.parse<CsvFormat>(data, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
    });

    const emailsWithTopics: CsvFormat[] = parsedData.data.map((row) => ({
      email: row.email?.trim(),
      topicId: row.topicId,
    }));

    if (!emailsWithTopics || emailsWithTopics.length === 0) {
       res.status(400).json({
        success: false,
        message: "No valid email address is present",
      });

      return;
    }

    req.emailsWithTopics = emailsWithTopics;
    next(); // Ensuring next() is called only after data is set

  } catch (error) {
    console.error("Error occurred while reading file:", error);
     res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });

    return;
  }
};

export default parseEmail;
