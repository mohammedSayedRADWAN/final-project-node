import request from "supertest";
import { app } from "../../app.js";
import mongoose from "mongoose";
import { User } from "../../models/User.js";

/**
 * @description Integration Tests for Auth Flow
 * Note: Requires a running MongoDB instance or a mock
 */
describe("Auth Integration Tests", () => {
    beforeAll(async () => {
        // Connect to a test database
        const url = `mongodb://127.0.0.1:27017/ecommerce-test`;
        await mongoose.connect(url);
    });

    afterAll(async () => {
        await User.deleteMany();
        await mongoose.connection.close();
    });

    const testUser = {
        fullName: "Test User",
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        role: "Customer"
    };

    it("should register a new user successfully", async () => {
        const res = await request(app)
            .post("/api/v1/auth/register")
            .send(testUser);

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.email).toBe(testUser.email);
    });

    it("should login the registered user", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: testUser.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data).toHaveProperty("accessToken");
        expect(res.body.data).toHaveProperty("refreshToken");
    });

    it("should fail to login with wrong password", async () => {
        const res = await request(app)
            .post("/api/v1/auth/login")
            .send({
                email: testUser.email,
                password: "wrongpassword"
            });

        expect(res.statusCode).toEqual(401);
    });
});
