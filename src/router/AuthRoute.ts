import {addAdmin} from "../controller/AdminController"
import { Router } from "express";
import { loginAdmin, logoutAdmin } from "../controller/AuthController";

const router = Router();

router.post("/createAccount", addAdmin);

router.post("/login", loginAdmin);

router.post("/logout", logoutAdmin)

export default router;