import { Router } from "express";

import { addTopic, deleteTopic, updateTopic, getAllTopic, getSpecificTopic } from "../controller/TopicController";
import { validateAdmin } from "../middleware/AuthMiddleware";

const router = Router();


router.post("/createTopic",validateAdmin, addTopic);
router.delete("/deleteTopic",validateAdmin, deleteTopic)
router.patch("/updateTopic", validateAdmin,updateTopic )
router.get("/allTopic", validateAdmin, getAllTopic)
router.get("/specificTopic/:id", validateAdmin,getSpecificTopic)

export default router;