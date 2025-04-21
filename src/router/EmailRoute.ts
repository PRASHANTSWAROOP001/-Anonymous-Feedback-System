import {Router} from "express";
import upload from "../utils/fileUpload";
import { validateAdmin } from "../middleware/AuthMiddleware";
import parseEmail from "../middleware/ParseFile";
import saveEmails from "../middleware/SaveEmail";
import sendEmails from "../middleware/SendEmail";

const router = Router();


router.post("/uploadFile/:id",validateAdmin, upload.single("file"),parseEmail,saveEmails)

router.post("/sendEmails/:id",validateAdmin, sendEmails);

export default router;