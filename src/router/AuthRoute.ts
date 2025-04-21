import {addAdmin} from "../controller/AdminController"
import { Router } from "express";
import { loginAdmin, logoutAdmin, renewAccessToken} from "../controller/AuthController";

const router = Router();

router.post("/createAccount", addAdmin);

router.post("/login", loginAdmin);

router.post("/logout", logoutAdmin);

router.post("/refresh-token",renewAccessToken);

export default router;