import { describe, it, expect } from "vitest";
import {
  validateRegistrationData,
  generateToken,
  verifyToken,
  JWTPayload,
} from "@/lib/auth";
import { UserRole } from "@prisma/client";

describe("Auth System Tests", () => {
  describe("validateRegistrationData", () => {
    it("should succeed for valid student registration data", () => {
      const result = validateRegistrationData({
        email: "student@president.ac.id",
        password: "securepassword123",
        fullName: "Budi Santoso",
        major: "Information Technology",
        cohort: "2024",
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid email format", () => {
      const result = validateRegistrationData({
        email: "not-an-email",
        password: "securepassword123",
        fullName: "Budi Santoso",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid email format");
    });

    it("should reject password shorter than 8 characters", () => {
      const result = validateRegistrationData({
        email: "student@president.ac.id",
        password: "short",
        fullName: "Budi Santoso",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Password must be at least 8 characters long");
    });

    it("should reject empty full name", () => {
      const result = validateRegistrationData({
        email: "student@president.ac.id",
        password: "securepassword123",
        fullName: " ",
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Full name is required and must be at least 2 characters");
    });
  });

  describe("JWT Token Handling", () => {
    it("should generate and verify valid JWT token payload", () => {
      const payload: JWTPayload = {
        userId: "user_test_123",
        email: "student@president.ac.id",
        role: UserRole.STUDENT,
      };

      const token = generateToken(payload);
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(20);

      const verified = verifyToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
      expect(verified?.role).toBe(payload.role);
    });

    it("should return null when verifying a tampered or invalid token", () => {
      const result = verifyToken("invalid.token.structure");
      expect(result).toBeNull();
    });
  });
});
