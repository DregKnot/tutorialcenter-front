import { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import * as d3 from "d3";
import { MapPin, X, RefreshCw, Globe, ArrowRight, MapPinned } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

// ── Real geography ──────────────────────────────────────────────────────
// Simplified real-world outline of Nigeria (lon, lat pairs), sourced from
// public country-boundary data. This is the ACTUAL shape, not a hand-drawn blob.
const NIGERIA_OUTLINE = [[8.5003, 4.772], [7.4621, 4.4121], [7.0826, 4.4647], [6.6981, 4.2406], [5.8982, 4.2625], [5.3628, 4.888], [5.0336, 5.6118], [4.3256, 6.2707], [3.5742, 6.2583], [2.6917, 6.2588], [2.7491, 7.8707], [2.7238, 8.5068], [2.9123, 9.1376], [3.2204, 9.4442], [3.7054, 10.0632], [3.6001, 10.3322], [3.7971, 10.7347], [3.5722, 11.3279], [3.6112, 11.6602], [3.6806, 12.5529], [3.9673, 12.9561], [4.1079, 13.5312], [4.3683, 13.7475], [5.4431, 13.8659], [6.4454, 13.4928], [6.8204, 13.1151], [7.3307, 13.098], [7.8047, 13.3435], [9.0149, 12.8267], [9.5249, 12.8511], [10.1148, 13.2773], [10.701, 13.2469], [10.9896, 13.3873], [11.5278, 13.329], [12.3021, 13.0372], [13.084, 13.5961], [13.3187, 13.5564], [13.9954, 12.4616], [14.1813, 12.4837], [14.5772, 12.0854], [14.4682, 11.9048], [14.4154, 11.5724], [13.573, 10.7986], [13.3087, 10.1604], [13.1676, 9.6406], [12.9555, 9.4178], [12.7537, 8.7178], [12.2189, 8.3058], [12.0639, 7.7998], [11.8393, 7.397], [11.7458, 6.9814], [11.0588, 6.6444], [10.4974, 7.0554], [10.1183, 7.0388], [9.5227, 6.4535], [9.2332, 6.4445], [8.7575, 5.4797], [8.5003, 4.772]];

// Real lon/lat of every state capital (source: public Nigeria states dataset).
// lon/lat drives the Voronoi boundary lines (geographic accuracy).
// dx/dy are PIXEL offsets that nudge ONLY the dot cluster — they do NOT
// affect the Voronoi lines. Positive dx = right, positive dy = down.
const STATES = [
  { name: "Abia", lon: 7.5247, lat: 5.4309, dx: 0, dy: 0 },
  { name: "Adamawa", lon: 12.4381, lat: 9.325, dx: 0, dy: 0 },
  { name: "Akwa Ibom", lon: 7.8722, lat: 4.93, dx: 0, dy: 0 },
  { name: "Anambra", lon: 7.0068, lat: 6.2758, dx: 0, dy: 0 },
  { name: "Bauchi", lon: 9.8442, lat: 10.3158, dx: 0, dy: 0 },
  { name: "Bayelsa", lon: 5.8987, lat: 4.8678, dx: 0, dy: 0 },
  { name: "Benue", lon: 8.8363, lat: 7.3508, dx: 0, dy: 0 },
  { name: "Borno", lon: 12.9789, lat: 11.5097, dx: 0, dy: 0 },
  { name: "Cross River", lon: 8.6601, lat: 6.167, dx: 0, dy: 0 },
  { name: "Delta", lon: 5.8987, lat: 5.5325, dx: 0, dy: 0 },
  { name: "Ebonyi", lon: 7.9593, lat: 6.178, dx: 0, dy: 0 },
  { name: "Enugu", lon: 7.5103, lat: 6.4527, dx: 0, dy: 0 },
  { name: "Edo", lon: 5.8987, lat: 6.5438, dx: 0, dy: 0 },
  { name: "Ekiti", lon: 5.3102, lat: 7.6656, dx: 0, dy: 0 },
  { name: "FCT", lon: 7.179, lat: 8.8557, dx: 0, dy: 0 },
  { name: "Gombe", lon: 11.1667, lat: 10.2833, dx: 0, dy: 0 },
  { name: "Imo", lon: 6.9209, lat: 5.5215, dx: 0, dy: 0 },
  { name: "Jigawa", lon: 8.9401, lat: 12.57, dx: 0, dy: 0 },
  { name: "Kaduna", lon: 7.4333, lat: 10.5167, dx: 0, dy: 0 },
  { name: "Kano", lon: 8.592, lat: 12.0022, dx: 0, dy: 0 },
  { name: "Katsina", lon: 7.6, lat: 12.9833, dx: 0, dy: 0 },
  { name: "Kebbi", lon: 4.0695, lat: 11.6781, dx: 0, dy: 0 },
  { name: "Kogi", lon: 6.5783, lat: 7.5619, dx: 0, dy: 0 },
  { name: "Kwara", lon: 4.5624, lat: 8.9848, dx: 0, dy: 0 },
  { name: "Lagos", lon: 3.3792, lat: 6.5244, dx: 0, dy: 0 },
  { name: "Nasarawa", lon: 8.3088, lat: 8.5705, dx: 0, dy: 0 },
  { name: "Niger", lon: 8.6753, lat: 9.082, dx: 0, dy: 0 },
  { name: "Ogun", lon: 3.2584, lat: 6.9098, dx: 0, dy: -8 },
  { name: "Ondo", lon: 4.8333, lat: 7.0833, dx: 0, dy: 0 },
  { name: "Osun", lon: 4.5624, lat: 7.5876, dx: 0, dy: 0 },
  { name: "Oyo", lon: 3.933, lat: 7.85, dx: 0, dy: 0 },
  { name: "Plateau", lon: 9.8965, lat: 8.8583, dx: 0, dy: 0 },
  { name: "Rivers", lon: 6.9209, lat: 4.8581, dx: 0, dy: 0 },
  { name: "Sokoto", lon: 5.2333, lat: 13.0667, dx: 0, dy: 0 },
  { name: "Taraba", lon: 10.9807, lat: 7.9869, dx: 0, dy: 0 },
  { name: "Yobe", lon: 11.7068, lat: 12.1871, dx: 0, dy: 0 },
  { name: "Zamfara", lon: 6.2376, lat: 12.1844, dx: 0, dy: 0 },
];

const VIEW_W = 640;
const VIEW_H = 640;


export default function LocationAnalysisMap() {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hoveredState, setHoveredState] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://tutorialcenter-back.test" || "http://localhost:8000";

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("staff_token");
      const config = {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      };
      const res = await axios.get(`${API_BASE_URL}/api/admin/students/all`, config);
      const fetchedStudents = res.data?.students || res.data?.data || [];
      setStudents(Array.isArray(fetchedStudents) ? fetchedStudents : []);
    } catch (err) {
      console.error("Location Analysis fetch error:", err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const locationStats = useMemo(() => {
    if (!students.length) return [];
    const counts = {};
    students.forEach((s) => {
      let state = (s.location || "Unknown").split(",")[0].trim();
      if (!state || state.toLowerCase() === "unknown") return;
      
      // Normalize state name
      state = state.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      state = state.replace(/\s*state$/i, "").trim();
      if (state.toLowerCase() === "fct") state = "FCT";
      
      counts[state] = (counts[state] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [students]);

  const topStates = locationStats.slice(0, 4);
  const totalStudents = students.length;
  const totalStates = locationStats.length;

  // ── Real projection: lon/lat -> SVG x/y, fitted to the actual outline ──
  const { outlinePath, projectedStates, voronoiPath } = useMemo(() => {
    const outlineFeature = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [NIGERIA_OUTLINE] },
    };

    // 20px padding so outline doesn't touch SVG edges
    const projection = d3.geoMercator().fitExtent(
      [[20, 20], [VIEW_W - 20, VIEW_H - 20]],
      outlineFeature
    );
    const pathGen = d3.geoPath(projection);
    const outlinePath = pathGen(outlineFeature);

    const projected = STATES.map((s) => {
      const [x, y] = projection([s.lon, s.lat]);
      // x/y = Voronoi anchor (geographic). dotX/dotY = visual dot position (nudged).
      return { ...s, x, y, dotX: x + (s.dx || 0), dotY: y + (s.dy || 0) };
    });

    // Voronoi cells — bounds match SVG viewport exactly (no extension beyond)
    const delaunay = d3.Delaunay.from(projected.map((s) => [s.x, s.y]));
    const voronoi = delaunay.voronoi([0, 0, VIEW_W, VIEW_H]);
    const voronoiPath = voronoi.render();

    // Compute per-cell inscribed radius so we can scale dots to fit
    const statesWithRadius = projected.map((s, i) => {
      const cell = voronoi.cellPolygon(i);
      if (!cell) return { ...s, cellRadius: 8 };
      let minDist = Infinity;
      for (const [cx, cy] of cell) {
        const dist = Math.sqrt((cx - s.x) ** 2 + (cy - s.y) ** 2);
        if (dist < minDist) minDist = dist;
      }
      return { ...s, cellRadius: Math.max(4, minDist * 0.55) };
    });

    return { outlinePath, projectedStates: statesWithRadius, voronoiPath };
  }, []);

  return (
    <>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 h-full flex flex-col cursor-pointer hover:shadow-lg transition-shadow group relative overflow-hidden max-w-md"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wide">
              Location Analysis
            </h3>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); fetchStudents(); }}
            disabled={loading}
            className="text-gray-400 hover:text-[#BB9E7F] disabled:text-gray-200 transition-colors z-10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={topStates}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {topStates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ fontWeight: "bold" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-gray-900 dark:text-white">{totalStudents}</span>
              <span className="text-[10px] text-gray-500 font-bold">Students</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {topStates.slice(0, 4).map((state, idx) => (
              <div key={state.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 truncate">{state.name}</span>
              </div>
            ))}
          </div>

          <div className="absolute bottom-0 left-0 right-0 py-2.5 bg-gray-50/80 dark:bg-gray-700/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-600/50 flex justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              View Map Details <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E2330] rounded-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] md:h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-400" />
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-wide">
                  Geographic Distribution
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              <div className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 p-4 md:p-6 flex flex-row md:flex-col gap-3 md:gap-4 bg-gray-50/50 dark:bg-[#181C26] overflow-x-auto md:overflow-x-hidden md:overflow-y-auto custom-scrollbar">
                
                {/* Stat Card 1 */}
                <div className="bg-white dark:bg-gray-800/80 rounded-xl p-3 md:p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-w-[120px] md:min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location Reach</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{totalStates}</span>
                    <span className="text-xs font-semibold text-gray-500">states</span>
                  </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white dark:bg-gray-800/80 rounded-xl p-3 md:p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col min-w-[120px] md:min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Users Reached</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{totalStudents.toLocaleString()}</span>
                    <span className="text-xs font-semibold text-gray-500">students</span>
                  </div>
                </div>

                {/* Stat Card 3 — hidden on mobile to save space */}
                <div className="hidden md:flex bg-white dark:bg-gray-800/80 rounded-xl p-3 md:p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex-col min-w-[120px] md:min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Period</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">All</span>
                    <span className="text-xs font-semibold text-gray-500">time</span>
                  </div>
                </div>

                {/* State Rankings — hidden on mobile, shown in sidebar on desktop */}
                <div className="hidden md:flex bg-white dark:bg-gray-800/80 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Top States</p>
                  <div className="space-y-2">
                    {locationStats.slice(0, 8).map((ls, idx) => (
                      <div key={ls.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: idx < 5 ? COLORS[idx] : "#9CA3AF" }} />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{ls.name}</span>
                        </div>
                        <span className="text-xs font-black text-gray-900 dark:text-white">{ls.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden md:flex mt-auto pt-4 items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <MapPinned className="w-4 h-4 shrink-0" />
                  <span>Positions mapped via D3 projection</span>
                </div>
              </div>

              <div className="flex-1 relative bg-white dark:bg-[#1E2330] flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-hidden min-h-0">
                <div className="relative w-full max-w-2xl aspect-square max-h-full">
                  {/* Single SVG — outline, voronoi, AND dots all clipped together */}
                  <svg
                    viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                    className="absolute inset-0 w-full h-full"
                    overflow="hidden"
                  >
                    <defs>
                      <clipPath id="loc-ng-clip">
                        <path d={outlinePath} />
                      </clipPath>
                    </defs>

                    {/* Everything inside the country outline */}
                    <g clipPath="url(#loc-ng-clip)">
                      {/* Voronoi state-division lines */}
                      <path
                        d={voronoiPath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-blue-400/40 dark:text-blue-500/30"
                      />

                      {/* Dot clusters — SVG circles clipped to the outline */}
                      {projectedStates.map((st) => {
                        const stateRecord = locationStats.find(
                          (ls) => ls.name.toLowerCase() === st.name.toLowerCase()
                        );
                        const studentCount = stateRecord ? stateRecord.value : 0;
                        const isActive = studentCount > 0;

                        const activeIndex = topStates.findIndex(
                          (t) => t.name.toLowerCase() === st.name.toLowerCase()
                        );
                        const dotColor = activeIndex !== -1 
                          ? COLORS[activeIndex % COLORS.length] 
                          : (isActive ? "#3B82F6" : "#64748B");

                        // Scale dot spread based on Voronoi cell radius
                        const spread = Math.min(st.cellRadius * 0.45, 12);
                        const dotR = isActive
                          ? Math.min(spread * 0.22, 3)
                          : Math.min(spread * 0.18, 2);

                        const dotOffsets = [
                          { dx: 0, dy: 0 },
                          { dx: -0.6, dy: -0.6 }, { dx: 0.6, dy: -0.6 },
                          { dx: -0.9, dy: 0 },    { dx: 0.9, dy: 0 },
                          { dx: -0.6, dy: 0.6 },  { dx: 0.6, dy: 0.6 },
                        ];

                        // Use nudged position for dots, original position for hover tooltip
                        const cx = st.dotX;
                        const cy = st.dotY;

                        return (
                          <g key={st.name}>
                            {/* Invisible hit target for hover */}
                            <circle
                              cx={cx} cy={cy} r={Math.max(spread * 1.2, 10)}
                              fill="transparent"
                              className="cursor-pointer"
                              onMouseEnter={() => setHoveredState({ name: st.name, x: cx, y: cy, count: studentCount })}
                              onMouseLeave={() => setHoveredState(null)}
                            />
                            {dotOffsets.map((offset, i) => (
                              <circle
                                key={i}
                                cx={cx + offset.dx * spread}
                                cy={cy + offset.dy * spread}
                                r={dotR}
                                fill={dotColor}
                                opacity={isActive ? 0.9 : 0.3}
                                className="pointer-events-none"
                              />
                            ))}
                          </g>
                        );
                      })}
                    </g>

                    {/* Country outline (on top of everything) */}
                    <path
                      d={outlinePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      className="text-blue-600 dark:text-blue-500"
                    />
                  </svg>

                  {/* Hover tooltip — HTML div on top of SVG */}
                  {hoveredState && (() => {
                    const yPct = (hoveredState.y / VIEW_H) * 100;
                    const xPct = (hoveredState.x / VIEW_W) * 100;
                    let transformClass = "-translate-x-1/2 -translate-y-[calc(100%+16px)]";
                    if (yPct < 20) transformClass = "-translate-x-1/2 translate-y-4";
                    if (xPct < 15) transformClass = "translate-x-4 -translate-y-1/2";
                    if (xPct > 85) transformClass = "-translate-x-[calc(100%+16px)] -translate-y-1/2";

                    const activeIndex = topStates.findIndex(
                      (t) => t.name.toLowerCase() === hoveredState.name.toLowerCase()
                    );
                    const stateColor = activeIndex !== -1 
                      ? COLORS[activeIndex % COLORS.length] 
                      : (hoveredState.count > 0 ? "#3B82F6" : "#9CA3AF");

                    return (
                      <div
                        className={`absolute bg-slate-900/95 dark:bg-slate-800/95 backdrop-blur-md text-white rounded-xl shadow-2xl flex flex-col border border-slate-700/50 overflow-hidden min-w-[130px] pointer-events-none z-30 ${transformClass}`}
                        style={{ left: `${xPct}%`, top: `${yPct}%` }}
                      >
                        <div className="px-3 py-2 border-b border-slate-700/50 flex items-center gap-2 bg-slate-950/40">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: `${stateColor}30`, border: `1px solid ${stateColor}` }}
                          >
                            <MapPin className="w-3 h-3" style={{ color: stateColor }} />
                          </div>
                          <span className="text-xs font-black text-slate-100 truncate">{hoveredState.name}</span>
                        </div>
                        <div className="px-3 py-2.5 flex items-baseline gap-1">
                          <span className="text-lg font-black" style={{ color: stateColor }}>
                            {hoveredState.count.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase">
                            {hoveredState.count === 1 ? "Student" : "Students"}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}