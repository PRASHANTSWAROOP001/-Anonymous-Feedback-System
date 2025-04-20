import express, {Request, Response} from "express";
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";

import adminAuthRoute from "./router/AuthRoute"
import emailAddRoute from "./router/EmailRoute"
import topicRoute from "./router/TopicRoute"
import  tokenRoute    from "./router/TokenRoute"
import feedbackRoute from "./router/FeedbackRoute"

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


app.use(cors())
app.use(express.json())

app.use(cookieParser());

app.listen(PORT, ()=>{

    console.log(`App started listening on port ${PORT}`);
})

app.get("/", (req:Request, res: Response)=>{
    res.status(201).json({
        success:true,
        message:"Hello world",
    })
})


app.use("/auth", adminAuthRoute);
app.use("/email", emailAddRoute);
app.use("/topic", topicRoute);
app.use("/token", tokenRoute);
app.use("/feedback", feedbackRoute)


