import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, HttpException } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module.js";

describe("User Profile", () => {
  let app: INestApplication;
  let authCookie: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth cookie
    await request(app.getHttpServer())
      .post("/api/auth/sign-in/email")
      .send({
        email: "test@hospital.com",
        password: "Welcome123",
      })
      .expect(200);

    const loginRes = await request(app.getHttpServer())
      .post("/api/auth/sign-in/email")
      .send({
        email: "test@hospital.com",
        password: "Welcome123",
      });

    authCookie = loginRes.headers["set-cookie"]?.[0]?.split(";")[0];
  });

  afterEach(async () => {
    await app.close();
  });

  describe("GET /api/user/me", () => {
    it("should return the authenticated hospital profile", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/user/me")
        .set("Cookie", authCookie)
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("email");
      expect(res.body.data).toHaveProperty("name");
      expect(res.body.data).toHaveProperty("location");
    });

    it("should return 401 without auth cookie", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/user/me")
        .expect(401);
    });
  });

  describe("PATCH /api/user/me", () => {
    it("should update hospital profile", async () => {
      const res = await request(app.getHttpServer())
        .patch("/api/user/me")
        .set("Cookie", authCookie)
        .send({ location: "Updated Location" })
        .expect(200);

      expect(res.body).toHaveProperty("data");
      expect(res.body.data.location).toBe("Updated Location");
    });

    it("should return 401 without auth cookie", async () => {
      const res = await request(app.getHttpServer())
        .patch("/api/user/me")
        .expect(401);
    });
  });
});