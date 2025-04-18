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
    if (!req.file || !req.file.buffer) {
       res.status(400).json({
        success: false,
        message: "File is missing",
      });

      return;
    }



    // Read file from buffer
    const data = req.file.buffer.toString("utf-8")

    const parsedData = Papaparse.parse<CsvFormat>(data, {
      header: true,
      skipEmptyLines: true,
      delimiter: ",",
    });

    const emailsWithTopics: CsvFormat[] = parsedData.data.map((row) => ({
      name:row.name?.trim(),
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
