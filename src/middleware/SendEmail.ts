import nodemailer from "nodemailer";
import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

const prisma = new PrismaClient();

const sendEmails = async (req: AuthenticatedRequest, res: Response):Promise<any> => {
    try {
        const adminId: number = req.user?.id;
        const topicId = req.params?.id;

        if (!topicId) {
            return res.status(400).json({
                success: false,
                message: "Topic ID is missing in request parameters.",
            });
        }

        // Fetch topic details
        const topicDetails = await prisma.topic.findUnique({
            where: { id: parseInt(topicId) },
        });

        if (!topicDetails) {
            return res.status(404).json({
                success: false,
                message: "Topic not found.",
            });
        }

        // Fetch emails and tokens
        const emailsList = await prisma.email.findMany({
            where: { topicId: parseInt(topicId) },
            select: { email: true },
        });

        const tokenList = await prisma.token.findMany({
            where: { topicId: parseInt(topicId) },
            select: { token: true },
        });

        if (emailsList.length === 0 || tokenList.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No emails or tokens found.",
            });
        }

        const senderEmail = process.env.EMAIL_USER as string;
        const senderPass = process.env.EMAIL_PASS as string;

        if (!senderEmail || !senderPass) {
            return res.status(500).json({
                success: false,
                message: "Email credentials are missing in environment variables.",
            });
        }

        const transport = nodemailer.createTransport({
            service: "Gmail",
            auth: { user: senderEmail, pass: senderPass },
            secure: true,
            port: 465,
        });

        // Send emails concurrently
        const emailPromises = emailsList.map(async (emailObj, index) => {
            const currEmail = emailObj.email;
            const correspondingToken = tokenList[index]?.token;

            if (!correspondingToken) {

                // we return empty resolve promise not reject because promise.all if receives reject all promises will be rejected

                return Promise.resolve(null);
            }

            const mailOptions = {
                from: senderEmail,
                to: currEmail,
                subject: `You are invited to submit feedback on ${topicDetails.title}`,
                html: `<h1>Hello ${currEmail},</h1>
                       <p>You have been invited to submit anonymous feedback on:</p>
                       <p><strong>Topic:</strong> ${topicDetails.title}</p>
                       <p><strong>Description:</strong> ${topicDetails.description}</p>
                       <p>Your unique token: <strong>${correspondingToken}</strong></p>
                       <p><em>Keep this token safe and do not share it.</em></p>`,
            };

            try {
                await transport.sendMail(mailOptions);
                console.log(`Email sent to: ${currEmail}`);
                return { email: currEmail, status: "Sent" };
            } catch (error) {
                console.error(`Failed to send email to ${currEmail}:`, error);
                return { email: currEmail, status: "Failed", };
            }
        });

        // Wait for all emails to be sent
        const results = await Promise.all(emailPromises);
        console.log("Email sending results:", results);

        return res.status(200).json({
            success: true,
            message: "Emails processed successfully.",
            results,
        });
      
    } catch (error) {
        console.error("Error in sendEmails:", error);
         return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
       
    }
};

export default sendEmails;
