import { useMemo } from "react";

export default function useExaminationAnalysis(attempts = []) {
  return useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

    let todayAttemptsCount = 0;
    let todayScoresSum = 0;
    let totalScoresSum = 0;
    let totalTimeSpentMinutes = 0;
    let todayTimeSpentMinutes = 0;

    const subjectsSet = new Set();
    const todaySubjectsSet = new Set();

    const subjectAttemptsMap = {}; // { [subjectName]: count }
    const subjectTimeMap = {}; // { [subjectName]: totalMinutes }
    const timeSpentByHourTodayMap = {}; // { [hour 0-23]: { totalMinutes: number, subjects: { [subjectName]: minutes } } }
    const timeSpentByDayMap = {}; // { [YYYY-MM-DD]: { totalMinutes: number, subjects: { [subjectName]: minutes } } }
    const timeSpentByMonthMap = {}; // { [YYYY-MM]: { totalMinutes: number, subjects: { [subjectName]: minutes } } }
    const timeSpentByYearMap = {}; // { [YYYY]: { totalMinutes: number, subjects: { [subjectName]: minutes } } }

    attempts.forEach((attempt) => {
      // Exclude abandoned or incomplete
      if (!attempt.submitted_at || attempt.status === "abandoned") return;

      const started = new Date(attempt.started_at);
      const submitted = new Date(attempt.submitted_at);
      const diffMinutes = Math.max(0, (submitted - started) / 1000 / 60);

      const submittedStr = submitted.toISOString().split("T")[0]; // YYYY-MM-DD
      const submittedMonth = submittedStr.substring(0, 7); // YYYY-MM
      const submittedYear = submittedStr.substring(0, 4); // YYYY

      // Subject tracking helper to resolve subject name across various API payload structures
      const extractSubjectName = (att) => {
        if (!att) return "Unknown Subject";
        if (typeof att.subject === "string" && att.subject.trim()) return att.subject.trim();
        if (att.subject?.name) return att.subject.name;
        if (att.subject?.title) return att.subject.title;

        if (att.exam_year?.subject?.name) return att.exam_year.subject.name;
        if (att.exam_year?.subject?.title) return att.exam_year.subject.title;
        if (typeof att.exam_year?.subject === "string" && att.exam_year.subject.trim()) return att.exam_year.subject.trim();
        if (att.exam_year?.subject_name) return att.exam_year.subject_name;

        if (att.examYear?.subject?.name) return att.examYear.subject.name;
        if (att.examYear?.subject?.title) return att.examYear.subject.title;
        if (att.examYear?.subject_name) return att.examYear.subject_name;

        if (att.exam?.subject?.name) return att.exam.subject.name;
        if (att.exam?.subject?.title) return att.exam.subject.title;
        if (att.exam?.subject_name) return att.exam.subject_name;
        if (att.exam?.title) return att.exam.title;
        if (att.exam?.name) return att.exam.name;

        if (att.subject_name) return att.subject_name;
        if (att.subject_title) return att.subject_title;
        if (att.course_subject?.name) return att.course_subject.name;
        if (att.course_subject?.title) return att.course_subject.title;

        if (att.title) return att.title;
        if (att.name) return att.name;

        return "Unknown Subject";
      };

      const subjectName = extractSubjectName(attempt);
      subjectsSet.add(subjectName);
      subjectAttemptsMap[subjectName] = (subjectAttemptsMap[subjectName] || 0) + 1;
      subjectTimeMap[subjectName] = (subjectTimeMap[subjectName] || 0) + diffMinutes;

      // Track time spent by day
      if (!timeSpentByDayMap[submittedStr]) {
        timeSpentByDayMap[submittedStr] = { totalMinutes: 0, subjects: {} };
      }
      timeSpentByDayMap[submittedStr].totalMinutes += diffMinutes;
      timeSpentByDayMap[submittedStr].subjects[subjectName] =
        (timeSpentByDayMap[submittedStr].subjects[subjectName] || 0) + diffMinutes;

      // Track time spent by month
      if (!timeSpentByMonthMap[submittedMonth]) {
        timeSpentByMonthMap[submittedMonth] = { totalMinutes: 0, subjects: {} };
      }
      timeSpentByMonthMap[submittedMonth].totalMinutes += diffMinutes;
      timeSpentByMonthMap[submittedMonth].subjects[subjectName] =
        (timeSpentByMonthMap[submittedMonth].subjects[subjectName] || 0) + diffMinutes;

      // Track time spent by year
      if (!timeSpentByYearMap[submittedYear]) {
        timeSpentByYearMap[submittedYear] = { totalMinutes: 0, subjects: {} };
      }
      timeSpentByYearMap[submittedYear].totalMinutes += diffMinutes;
      timeSpentByYearMap[submittedYear].subjects[subjectName] =
        (timeSpentByYearMap[submittedYear].subjects[subjectName] || 0) + diffMinutes;

      totalTimeSpentMinutes += diffMinutes;

      // Overall scores
      const score = parseFloat(attempt.percentage) || 0;
      totalScoresSum += score;

      // Today stats & Hourly breakdown
      if (submittedStr === todayStr) {
        todayAttemptsCount++;
        todayScoresSum += score;
        todaySubjectsSet.add(subjectName);
        todayTimeSpentMinutes += diffMinutes;

        const hour = submitted.getHours();
        if (!timeSpentByHourTodayMap[hour]) {
          timeSpentByHourTodayMap[hour] = { totalMinutes: 0, subjects: {} };
        }
        timeSpentByHourTodayMap[hour].totalMinutes += diffMinutes;
        timeSpentByHourTodayMap[hour].subjects[subjectName] =
          (timeSpentByHourTodayMap[hour].subjects[subjectName] || 0) + diffMinutes;
      }
    });

    const totalAttemptsCount = Object.values(subjectAttemptsMap).reduce((a, b) => a + b, 0);

    const averageScoreOverall = totalAttemptsCount > 0 ? (totalScoresSum / totalAttemptsCount).toFixed(1) : 0;
    const averageScoreToday = todayAttemptsCount > 0 ? (todayScoresSum / todayAttemptsCount).toFixed(1) : 0;

    // Formatting chart data with per-subject breakdowns

    // Today chart: 24 hours
    const todayChartData = [];
    for (let i = 0; i < 24; i++) {
      const label = i === 0 ? "12am" : i === 12 ? "12pm" : i < 12 ? `${i}am` : `${i - 12}pm`;
      const hourObj = timeSpentByHourTodayMap[i] || { totalMinutes: 0, subjects: {} };
      const subjectsList = Object.entries(hourObj.subjects || {}).map(([name, mins]) => ({
        name,
        minutes: Math.round(mins),
        hours: parseFloat((mins / 60).toFixed(1)),
      }));

      todayChartData.push({
        label,
        minutes: Math.round(hourObj.totalMinutes || 0),
        subjects: subjectsList,
      });
    }

    // Day chart: Last 7 days
    const dayChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const shortDay = d.toLocaleDateString("en-US", { weekday: "short" });
      const fullDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      const dayObj = timeSpentByDayMap[dStr] || { totalMinutes: 0, subjects: {} };
      const subjectsList = Object.entries(dayObj.subjects || {}).map(([name, mins]) => ({
        name,
        minutes: Math.round(mins),
        hours: parseFloat((mins / 60).toFixed(1)),
      }));

      dayChartData.push({
        label: i === 0 ? "Today" : shortDay,
        fullDate,
        dateStr: dStr,
        minutes: Math.round(dayObj.totalMinutes || 0),
        subjects: subjectsList,
      });
    }

    // Month chart: All 12 months of current year
    const monthChartData = [];
    const currentYear = now.getFullYear();
    for (let i = 0; i < 12; i++) {
      const mStr = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
      const shortMonth = new Date(currentYear, i, 1).toLocaleDateString("en-US", { month: "short" });
      const monthObj = timeSpentByMonthMap[mStr] || { totalMinutes: 0, subjects: {} };
      const subjectsList = Object.entries(monthObj.subjects || {}).map(([name, mins]) => ({
        name,
        minutes: Math.round(mins),
        hours: parseFloat((mins / 60).toFixed(1)),
      }));

      monthChartData.push({
        label: shortMonth,
        minutes: Math.round(monthObj.totalMinutes || 0),
        hours: parseFloat(((monthObj.totalMinutes || 0) / 60).toFixed(1)),
        subjects: subjectsList,
      });
    }

    // Subject Pie Chart Data with vibrant, accessible color palette
    const COLORS = [
      "#09314F",
      "#C5A97A",
      "#E83831",
      "#10B981",
      "#3B82F6",
      "#8B5CF6",
      "#EC4899",
      "#F59E0B",
      "#06B6D4",
      "#84CC16",
    ];

    const subjectPieData = Object.entries(subjectAttemptsMap).map(([name, count], index) => ({
      name,
      value: count,
      totalTimeMinutes: Math.round(subjectTimeMap[name] || 0),
      percentage: totalAttemptsCount > 0 ? Math.round((count / totalAttemptsCount) * 100) : 0,
      fill: COLORS[index % COLORS.length],
    }));

    return {
      stats: {
        todayAttempts: todayAttemptsCount,
        todayAverageScore: parseFloat(averageScoreToday),
        todaySubjects: todaySubjectsSet.size,
        todayTimeSpentMinutes: Math.round(todayTimeSpentMinutes),
        totalAttempts: totalAttemptsCount,
        totalAverageScore: parseFloat(averageScoreOverall),
        totalSubjects: subjectsSet.size,
        totalTimeSpentMinutes: Math.round(totalTimeSpentMinutes),
      },
      charts: {
        todayData: todayChartData,
        dayData: dayChartData,
        monthData: monthChartData,
        subjectPieData,
      },
    };
  }, [attempts]);
}
