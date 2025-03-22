import {addAdmin, loginAdmin} from "../controller/AdminController"
import { Router } from "express";


const router = Router();

router.post("/createAccount", addAdmin);

router.post("/login", loginAdmin);

export default router;