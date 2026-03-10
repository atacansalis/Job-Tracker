import { validateProspect } from "../prospect-helpers";
import { INTEREST_LEVELS } from "@shared/schema";

describe("prospect creation validation", () => {
  test("rejects a blank company name", () => {
    const result = validateProspect({
      companyName: "",
      roleTitle: "Software Engineer",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Company name is required");
  });

  test("rejects a blank role title", () => {
    const result = validateProspect({
      companyName: "Google",
      roleTitle: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Role title is required");
  });

  test("accepts all valid interest levels", () => {
    for (const level of INTEREST_LEVELS) {
      const result = validateProspect({
        companyName: "TestCo",
        roleTitle: "Engineer",
        interestLevel: level,
      });
      expect(result.valid).toBe(true);
    }
  });

  test("rejects an invalid interest level", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      interestLevel: "Extreme",
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      `Interest level must be one of: ${INTEREST_LEVELS.join(", ")}`
    );
  });

  test("accepts a valid target salary", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: "120000",
    });
    expect(result.valid).toBe(true);
  });

  test("accepts a target salary with decimals", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: "95000.50",
    });
    expect(result.valid).toBe(true);
  });

  test("accepts an empty target salary (optional)", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: "",
    });
    expect(result.valid).toBe(true);
  });

  test("accepts a null target salary (optional)", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: null,
    });
    expect(result.valid).toBe(true);
  });

  test("accepts undefined target salary (optional)", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
    });
    expect(result.valid).toBe(true);
  });

  test("rejects target salary with letters", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: "abc",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Target salary must be a valid number");
  });

  test("rejects target salary with symbols", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: "$120,000",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Target salary must be a valid number");
  });

  test("rejects target salary with mixed letters and numbers", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: "120k",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Target salary must be a valid number");
  });

  test("rejects target salary with too many decimal places", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: "120000.123",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Target salary must be a valid number");
  });

  test("rejects negative target salary", () => {
    const result = validateProspect({
      companyName: "TestCo",
      roleTitle: "Engineer",
      targetSalary: "-50000",
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Target salary must be a valid number");
  });
});

describe("interest level filtering logic", () => {
  const mockProspects = [
    { id: 1, interestLevel: "High", status: "Bookmarked" },
    { id: 2, interestLevel: "Medium", status: "Bookmarked" },
    { id: 3, interestLevel: "Low", status: "Bookmarked" },
    { id: 4, interestLevel: "High", status: "Bookmarked" },
  ];

  function filterByInterest(
    prospects: typeof mockProspects,
    filter: "All" | "High" | "Medium" | "Low"
  ) {
    return filter === "All"
      ? prospects
      : prospects.filter((p) => p.interestLevel === filter);
  }

  test("filter 'All' returns all prospects", () => {
    const result = filterByInterest(mockProspects, "All");
    expect(result).toHaveLength(4);
  });

  test("filter 'High' returns only high interest prospects", () => {
    const result = filterByInterest(mockProspects, "High");
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.interestLevel === "High")).toBe(true);
  });

  test("filter 'Medium' returns only medium interest prospects", () => {
    const result = filterByInterest(mockProspects, "Medium");
    expect(result).toHaveLength(1);
    expect(result[0].interestLevel).toBe("Medium");
  });

  test("filter 'Low' returns only low interest prospects", () => {
    const result = filterByInterest(mockProspects, "Low");
    expect(result).toHaveLength(1);
    expect(result[0].interestLevel).toBe("Low");
  });

  test("each column filters independently", () => {
    const bookmarkedProspects = mockProspects.filter((p) => p.status === "Bookmarked");
    const appliedProspects = [
      { id: 5, interestLevel: "Low", status: "Applied" },
    ];

    const bookmarkedHigh = filterByInterest(bookmarkedProspects, "High");
    const appliedAll = filterByInterest(appliedProspects, "All");

    expect(bookmarkedHigh).toHaveLength(2);
    expect(appliedAll).toHaveLength(1);
  });
});
