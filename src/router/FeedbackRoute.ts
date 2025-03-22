import { Router } from "express";

import { Request, Response } from "express";

import {addFeedback,getAllFeedback,getSpecificFeedback} from "../controller/FeedbackController"
import {updateToken} from '../controller/TokenController'
const router = Router();





router.post("/createFeedback",addFeedback, updateToken);

router.get("/getAllFeedback", getAllFeedback);

router.get("/getSpacificFeedback",getSpecificFeedback);


export default router;


