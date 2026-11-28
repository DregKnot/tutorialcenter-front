import { extractClassStaffInfo, getLeadTutorName, isAssistantOrAdvisorStaff } from "./classStaffUtils";

describe("classStaffUtils", () => {
  test("selects lead tutor via pivot.role even when COO or advisor appears first in staffs", () => {
    const classPayload = {
      id: 22,
      staffs: [
        {
          id: 1,
          firstname: "Olugbenga",
          surname: "Raymond",
          role: "coo",
          pivot: { role: "assistant" },
        },
        {
          id: 9,
          firstname: "Blessing",
          surname: "Adeyemi",
          role: "tutor",
          pivot: { role: "lead" },
        },
      ],
    };

    const { tutor, advisors } = extractClassStaffInfo(classPayload);
    expect(tutor.id).toBe(9);
    expect(tutor.name).toBe("Blessing Adeyemi");
    expect(advisors).toHaveLength(1);
    expect(advisors[0].name).toBe("Olugbenga Raymond");
    expect(getLeadTutorName(classPayload)).toBe("Blessing Adeyemi");
  });

  test("ignores advisor/COO entries when pivot is absent and falls back to tutor role", () => {
    const classPayload = {
      staffs: [
        { id: 1, firstname: "Olugbenga", surname: "Raymond", role: "coo" },
        { id: 4, firstname: "Isaac", surname: "Nnemka", role: "advisor" },
        { id: 7, firstname: "Caleb", surname: "Chukwu", role: "tutor" },
      ],
    };

    const { tutor, advisors } = extractClassStaffInfo(classPayload);
    expect(tutor.name).toBe("Caleb Chukwu");
    expect(advisors).toHaveLength(1);
    expect(advisors[0].name).toBe("Isaac Nnemka");
  });

  test("falls back to session/class tutor object before falling back to generic label", () => {
    const session = {
      id: 50,
      staffs: [{ id: 1, firstname: "Olugbenga", surname: "Raymond", role: "admin" }],
      tutor: { id: 12, firstname: "Grace", surname: "Okafor", role: "tutor" },
    };

    const { tutor } = extractClassStaffInfo(session);
    expect(tutor.name).toBe("Grace Okafor");
    expect(isAssistantOrAdvisorStaff(session.staffs[0])).toBe(true);
  });

  test("returns default fallback when no tutor is assigned", () => {
    const { tutor, advisors } = extractClassStaffInfo({ id: 99 });
    expect(tutor.name).toBe("Tutorial Center Tutor");
    expect(advisors).toEqual([]);
    expect(getLeadTutorName({ id: 99 })).toBe("Unassigned");
  });
});
