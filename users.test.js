const request = require('supertest');
const app = require('./app');
const User = require("../critickerlike_backend/models/users");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');

describe("POST /signup + /signin", () => {
    let testToken; // variable to store the token

    beforeAll(async () => {
        // Clear out the User collection before running tests
        await User.deleteMany({});
    });

    it('POST/signup: should sign up a new user successfully', async () => {
        const res = await request(app)
            .post('/users/signup')
            .send({
                username: 'testuser',
                email: 'testuser@gmail.com',
                password: 'password123',
                confirmPassword: "password123",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.token).toBeDefined();

        //Stored the token for future use
        testToken = res.body.token;
    });

    it("POST/signup: should return an error when fields are missing", async () => {
        const res = await request(app)
            .post("/users/signup")
            .send({
                username: "",
                email: "testuser@gmail.com",
                password: "password123",
                confirmPassword: "password123",
            });

        expect(res.status).toBe(200);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Missing or empty fields");
    });

    it("POST/signup: should return an error when passwords do not match", async () => {
        const res = await request(app)
            .post("/users/signup")
            .send({
                username: "testuser2",
                email: "testuser2@gmail.com",
                password: "password123",
                confirmPassword: "differentPassword",
            });

        expect(res.status).toBe(200);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Passwords do not match");
    });

    it("POST/signup: should return an error if the user already exists", async () => {
        // First, we create a user
        const hash = bcrypt.hashSync("password123", 10);
        const existingUser = new User({
            username: "testuser",
            email: "testuser@gmail.com",
            password: hash,
            token: "dummyToken",
        });
        await existingUser.save();

        // Then, we try signing up with the same credentials
        const res = await request(app)
            .post("/users/signup")
            .send({
                username: "testuser",
                email: "testuser@gmail.com",
                password: "password123",
                confirmPassword: "password123",
            });

        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("User already registered");
    });

    it('POST/signin: should sign in a user successfully', async () => {
        const res = await request(app)
            .post('/users/signin')
            .send({
                username: 'testuser',
                password: 'password123',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.token).toBeDefined();
        expect(res.body.username).toBe("testuser");
        expect(res.body.email).toBe("testuser@gmail.com");

        // Store the token for future use (in case the token changes after signin)
        testToken = res.body.token;
    });

    it("POST/signin: should return an error when fields are missing", async () => {
        const res = await request(app)
            .post("/users/signin")
            .send({
                username: "",
                password: "password123",
            });

        expect(res.status).toBe(200);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Missing or empty fields");
    });

    it("POST/signin: should return an error when passwords or usernames do not match", async () => {
        const res = await request(app)
            .post("/users/signin")
            .send({
                username: "testuser2",
                password: "password123",
            });

        expect(res.status).toBe(200);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("User not found or wrong password");
    });

    it("GET/:token: should return user details for a valid token", async () => {
        const res = await request(app)
            .get(`/users/${testToken}`);

        expect(res.status).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.user).toBeDefined();
        expect(res.body.user.username).toBe("testuser");
        expect(res.body.user.email).toBe("testuser@gmail.com");
    });

    it("GET/:token: should return an error for an invalid token", async () => {
        const res = await request(app)
            .get("/users/invalidToken");

        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("User not found");
    });

    it("PUT/:update-username: should update the username successfully", async () => {
        const res = await request(app)
            .put("/users/update-username")
            .send({
                currentUsername: "testuser",
                newUsername: "newtestuser",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.message).toBe("Username updated successfully");
    });

    it("PUT/:update-email: should update the email successfully", async () => {
        const res = await request(app)
            .put("/users/update-email")
            .send({
                currentEmail: "testuser@gmail.com",
                newEmail: "newtestuser@gmail.com",
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.message).toBe("Email updated successfully");
    });

    it("DELETE/:username: should delete a user successfully", async () => {
        const res = await request(app)
            .delete("/users/newtestuser");

        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.userdeleted).toBeDefined();
        expect(res.body.userdeleted.username).toBe("newtestuser");
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });
}); 