import {
  BOOTCAMP_TRACKS,
  isGroupMasterClass,
  matchClassForBootcampTrack,
  getBootcampCardSummary,
} from "./bootcampUtils";

describe("bootcampUtils", () => {
  test("excludes private 1-on-1 classes and cancelled classes from Bootcamp tracks", () => {
    const privateClass = {
      id: 1,
      title: "JAMB - Use of English (Private)",
      is_private: true,
      status: "active",
      zoom_join_url: "https://zoom.us/j/private-secret",
    };

    const cancelledClass = {
      id: 2,
      title: "JAMB - Use of English",
      is_private: false,
      status: "cancelled",
      zoom_join_url: "https://zoom.us/j/cancelled",
    };

    const groupClass = {
      id: 3,
      title: "JAMB - Use of English",
      is_private: false,
      status: "active",
      zoom_join_url: "https://zoom.us/j/group-english",
      staffs: [
        { id: 1, firstname: "Olugbenga", surname: "Raymond", role: "coo", pivot: { role: "assistant" } },
        { id: 7, firstname: "Blessing", surname: "Adeyemi", role: "tutor", pivot: { role: "lead" } },
      ],
      schedules: [{ day_of_week: "monday", start_time: "17:00", end_time: "19:00" }],
    };

    expect(isGroupMasterClass(privateClass)).toBe(false);
    expect(isGroupMasterClass(cancelledClass)).toBe(false);
    expect(isGroupMasterClass(groupClass)).toBe(true);

    const matched = matchClassForBootcampTrack(
      [privateClass, cancelledClass, groupClass],
      BOOTCAMP_TRACKS[0]
    );
    expect(matched?.id).toBe(3);

    const summary = getBootcampCardSummary(matched, BOOTCAMP_TRACKS[0]);
    expect(summary.tutorName).toBe("Blessing Adeyemi");
    expect(summary.joinLink).toBe("https://zoom.us/j/group-english");
  });

  test("matches all four Mon-Thu Bootcamp subject tracks separately", () => {
    const classes = [
      { id: 10, title: "JAMB - Use of English", status: "active", schedules: [{ day_of_week: "monday", start_time: "17:00", end_time: "19:00" }] },
      { id: 11, title: "O-Levels - English Language", status: "active", schedules: [{ day_of_week: "tuesday", start_time: "17:00", end_time: "19:00" }] },
      { id: 12, title: "JAMB - Mathematics", status: "active", schedules: [{ day_of_week: "wednesday", start_time: "17:00", end_time: "19:00" }] },
      { id: 13, title: "O-Levels - Mathematics", status: "active", schedules: [{ day_of_week: "thursday", start_time: "17:00", end_time: "19:00" }] },
    ];

    expect(matchClassForBootcampTrack(classes, BOOTCAMP_TRACKS[0])?.id).toBe(10);
    expect(matchClassForBootcampTrack(classes, BOOTCAMP_TRACKS[1])?.id).toBe(11);
    expect(matchClassForBootcampTrack(classes, BOOTCAMP_TRACKS[2])?.id).toBe(12);
    expect(matchClassForBootcampTrack(classes, BOOTCAMP_TRACKS[3])?.id).toBe(13);
  });
});
