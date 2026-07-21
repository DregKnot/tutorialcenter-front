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
    const timeSpentByHourTodayMap = {}; // { [hour 0-23]: minutes }
    const timeSpentByDayMap = {}; // { [YYYY-MM-DD]: minutes }
    const timeSpentByMonthMap = {}; // { [YYYY-MM]: minutes }
    const timeSpentByYearMap = {}; // { [YYYY]: minutes }

    attempts.forEach(attempt => {
      // Exclude abandoned or incomplete? Usually we only count completed, but we'll check if submitted_at exists
      if (!attempt.submitted_at || attempt.status === "abandoned") return;

      const started = new Date(attempt.started_at);
      const submitted = new Date(attempt.submitted_at);
      const diffMinutes = Math.max(0, (submitted - started) / 1000 / 60);

      const submittedStr = submitted.toISOString().split("T")[0]; // YYYY-MM-DD
      const submittedMonth = submittedStr.substring(0, 7); // YYYY-MM
      const submittedYear = submittedStr.substring(0, 4); // YYYY

      // Track time spent
      timeSpentByDayMap[submittedStr] = (timeSpentByDayMap[submittedStr] || 0) + diffMinutes;
      timeSpentByMonthMap[submittedMonth] = (timeSpentByMonthMap[submittedMonth] || 0) + diffMinutes;
      timeSpentByYearMap[submittedYear] = (timeSpentByYearMap[submittedYear] || 0) + diffMinutes;
      totalTimeSpentMinutes += diffMinutes;

      // Subject tracking
      const subjectName = attempt.exam_year?.subject?.name || "Unknown Subject";
      subjectsSet.add(subjectName);
      subjectAttemptsMap[subjectName] = (subjectAttemptsMap[subjectName] || 0) + 1;

      // Overall scores
      const score = parseFloat(attempt.percentage) || 0;
      totalScoresSum += score;

      // Today stats
      if (submittedStr === todayStr) {
        todayAttemptsCount++;
        todayScoresSum += score;
        todaySubjectsSet.add(subjectName);
        todayTimeSpentMinutes += diffMinutes;

        const hour = submitted.getHours();
        timeSpentByHourTodayMap[hour] = (timeSpentByHourTodayMap[hour] || 0) + diffMinutes;
      }
    });

    const totalAttemptsCount = Object.values(subjectAttemptsMap).reduce((a, b) => a + b, 0);

    const averageScoreOverall = totalAttemptsCount > 0 ? (totalScoresSum / totalAttemptsCount).toFixed(1) : 0;
    const averageScoreToday = todayAttemptsCount > 0 ? (todayScoresSum / todayAttemptsCount).toFixed(1) : 0;

    // Formatting chart data
    // Today chart: 24 hours
    const todayChartData = [];
    for (let i = 0; i < 24; i++) {
      const label = i === 0 ? "12am" : i === 12 ? "12pm" : i < 12 ? `${i}am` : `${i - 12}pm`;
      todayChartData.push({
        label,
        minutes: Math.round(timeSpentByHourTodayMap[i] || 0)
      });
    }

    // Day chart: Last 7 days
    const dayChartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const shortDay = d.toLocaleDateString("en-US", { weekday: "short" });
      dayChartData.push({
        label: i === 0 ? "Today" : shortDay,
        minutes: Math.round(timeSpentByDayMap[dStr] || 0)
      });
    }

    // Month chart: All 12 months of current year
    const monthChartData = [];
    const currentYear = now.getFullYear();
    for (let i = 0; i < 12; i++) {
      const mStr = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
      const shortMonth = new Date(currentYear, i, 1).toLocaleDateString("en-US", { month: "short" });
      monthChartData.push({
        label: shortMonth,
        minutes: Math.round(timeSpentByMonthMap[mStr] || 0),
        hours: parseFloat(((timeSpentByMonthMap[mStr] || 0) / 60).toFixed(1))
      });
    }

    // Subject Pie Chart Data
    const COLORS = ["#09314F", "#E83831", "#BB9E7F", "#10B981", "#F59E0B", "#3B82F6"];
    const subjectPieData = Object.entries(subjectAttemptsMap).map(([name, count], index) => ({
      name,
      value: count,
      fill: COLORS[index % COLORS.length]
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
      }
    };
  }, [attempts]);
}
