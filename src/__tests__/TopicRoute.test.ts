import request from "supertest";
import express from "express";
import topicRoute from "../router/TopicRoute";
import { Response, Request, NextFunction } from "express";
import { 
    addTopic, 
    deleteTopic, 
    getAllTopic, 
    getSpecificTopic, 
    updateTopic 
} from "../controller/TopicController";
import * as authMiddleware from "../middleware/AuthMiddleware"; // Import everything

const app = express();
app.use(express.json());
app.use("/topic", topicRoute);

// Mock Controller Functions
jest.mock("../controller/TopicController", () => ({
    addTopic: jest.fn((req: Request, res: Response) =>
        res.status(200).json({ message: "Topic added successfully" })
    ),
    deleteTopic: jest.fn((req: Request, res: Response) =>
        res.status(200).json({ message: "Topic deleted successfully" })
    ),
    getAllTopic: jest.fn((req: Request, res: Response) =>
        res.status(200).json({ message: "Data Fetched successfully", data: [] })
    ),
    getSpecificTopic: jest.fn((req: Request, res: Response) =>
        res.status(200).json({ message: "Data Fetched successfully", data: {} })
    ),
    updateTopic: jest.fn((req: Request, res: Response) =>
        res.status(200).json({ message: "Data updated successfully" })
    ),
}));

// ✅ Correctly Mock `validateAdmin`
jest.spyOn(authMiddleware, "validateAdmin").mockImplementation(
    (req: Request, res: Response, next: NextFunction) => {
        (req as any).user = {
            id: 123,
            email: "random@gmail.com",
            name: "Falane",
        };
        next();
    }
);

describe("TopicRoute API Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should add a topic", async () => {
        const response = await request(app)
            .post("/topic/createTopic")
            .set("Authorization", "Bearer fake_token")
            .send({
                title: "Hello",
                description: "hi",
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Topic added successfully" });
    });

    it("should delete a topic", async () => {
        const response = await request(app)
            .delete("/topic/deleteTopic")
            .set("Authorization", "Bearer fake_token")
            .send({
                topicId: 1,
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Topic deleted successfully" });
    });

    it("should get all topics", async () => {
        const response = await request(app)
            .get("/topic/allTopic")
            .set("Authorization", "Bearer fake_token");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Data Fetched successfully", data: [] });
    });

    it("should get a specific topic", async () => {
        const response = await request(app)
            .get("/topic/specificTopic/23")
            .set("Authorization", "Bearer fake_token");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Data Fetched successfully", data: {} });
    });

    it("should update a topic", async () => {
        const response = await request(app)
            .patch("/topic/updateTopic")
            .set("Authorization", "Bearer fake_token")
            .send({
                title: "Updated Title",
            });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "Data updated successfully" });
    });

    it("should return 401 if token is missing", async () => {
        const response = await request(app)
            .post("/topic/createTopic")
            .send({
                title: "New Topic",
                description: "Some Description",
            });

        expect(response.status).toBe(401);
    });

    it("should return 403 if token is invalid", async () => {
        jest.spyOn(authMiddleware, "validateAdmin").mockImplementation(
            (req: Request, res: Response, next: NextFunction) => {
                res.status(403).json({ success: false, message: "Invalid token." });
            }
        );

        const response = await request(app)
            .post("/topic/createTopic")
            .set("Authorization", "Bearer invalid_token")
            .send({
                title: "New Topic",
                description: "Some Description",
            });

        expect(response.status).toBe(403);
        expect(response.body).toEqual({ success: false, message: "Invalid token." });
    });
});
