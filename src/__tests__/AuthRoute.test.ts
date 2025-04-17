import request from "supertest";
import express from "express";
import authRoute from "../router/AuthRoute";


const app = express();
app.use(express.json());
app.use("/auth", authRoute);

jest.mock("../controller/AdminController", () => ({
    addAdmin: jest.fn((req, res) => res.status(201).send({ message: "Admin created" })),
    loginAdmin: jest.fn((req, res) => res.status(200).send({ token: "mockToken" })),
}));

describe("AuthRoute", () => {
    it("should create an admin account", async () => {
        const response = await request(app)
            .post("/auth/createAccount")
            .send({ username: "admin", password: "password123" });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: "Admin created" });
    });

    it("should log in an admin", async () => {
        const response = await request(app)
            .post("/auth/login")
            .send({ username: "admin", password: "password123" });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ token: "mockToken" });
    });
});
