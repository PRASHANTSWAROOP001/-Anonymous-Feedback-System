import { Router } from "express";
import { addTokensToDatabase, loginUsingToken } from "../controller/TokenController";
import { validateAdmin } from "../middleware/AuthMiddleware";

const router = Router();


router.post("/addToken/:id",validateAdmin,addTokensToDatabase);
router.post("/loginUser", loginUsingToken )


export default router;

