import { describe, it, expect } from "vitest";
import { nextDueDate } from "../recurrence";

describe("nextDueDate", () => {
  describe("daily", () => {
    it("advances by 1 day", () => {
      expect(nextDueDate("2025-01-15", "daily")).toBe("2025-01-16");
    });

    it("handles month boundary", () => {
      expect(nextDueDate("2025-01-31", "daily")).toBe("2025-02-01");
    });

    it("handles year boundary", () => {
      expect(nextDueDate("2025-12-31", "daily")).toBe("2026-01-01");
    });
  });

  describe("weekly", () => {
    it("advances by 7 days", () => {
      expect(nextDueDate("2025-01-15", "weekly")).toBe("2025-01-22");
    });

    it("handles month boundary", () => {
      expect(nextDueDate("2025-01-28", "weekly")).toBe("2025-02-04");
    });

    it("handles year boundary", () => {
      expect(nextDueDate("2025-12-29", "weekly")).toBe("2026-01-05");
    });
  });

  describe("monthly", () => {
    it("advances by 1 month for a normal date", () => {
      expect(nextDueDate("2025-03-15", "monthly")).toBe("2025-04-15");
    });

    it("handles year rollover (December → January)", () => {
      expect(nextDueDate("2025-12-15", "monthly")).toBe("2026-01-15");
    });

    it("clamps Jan 31 to Feb 28 in a non-leap year", () => {
      expect(nextDueDate("2025-01-31", "monthly")).toBe("2025-02-28");
    });

    it("clamps Jan 31 to Feb 29 in a leap year (2024)", () => {
      expect(nextDueDate("2024-01-31", "monthly")).toBe("2024-02-29");
    });

    it("clamps March 31 to April 30", () => {
      expect(nextDueDate("2025-03-31", "monthly")).toBe("2025-04-30");
    });

    it("preserves day when no clamping needed", () => {
      expect(nextDueDate("2025-12-31", "monthly")).toBe("2026-01-31");
    });
  });
});
