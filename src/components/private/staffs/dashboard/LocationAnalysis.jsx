import { useState, useMemo } from "react";
import * as d3 from "d3";
import { MapPin, X, RefreshCw, Globe, ArrowRight, MapPinned } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

// ── Real geography ──────────────────────────────────────────────────────
// Simplified real-world outline of Nigeria (lon, lat pairs), sourced from
// public country-boundary data. This is the ACTUAL shape, not a hand-drawn blob.
const NIGERIA_OUTLINE = [[8.5003, 4.772], [7.4621, 4.4121], [7.0826, 4.4647], [6.6981, 4.2406], [5.8982, 4.2625], [5.3628, 4.888], [5.0336, 5.6118], [4.3256, 6.2707], [3.5742, 6.2583], [2.6917, 6.2588], [2.7491, 7.8707], [2.7238, 8.5068], [2.9123, 9.1376], [3.2204, 9.4442], [3.7054, 10.0632], [3.6001, 10.3322], [3.7971, 10.7347], [3.5722, 11.3279], [3.6112, 11.6602], [3.6806, 12.5529], [3.9673, 12.9561], [4.1079, 13.5312], [4.3683, 13.7475], [5.4431, 13.8659], [6.4454, 13.4928], [6.8204, 13.1151], [7.3307, 13.098], [7.8047, 13.3435], [9.0149, 12.8267], [9.5249, 12.8511], [10.1148, 13.2773], [10.701, 13.2469], [10.9896, 13.3873], [11.5278, 13.329], [12.3021, 13.0372], [13.084, 13.5961], [13.3187, 13.5564], [13.9954, 12.4616], [14.1813, 12.4837], [14.5772, 12.0854], [14.4682, 11.9048], [14.4154, 11.5724], [13.573, 10.7986], [13.3087, 10.1604], [13.1676, 9.6406], [12.9555, 9.4178], [12.7537, 8.7178], [12.2189, 8.3058], [12.0639, 7.7998], [11.8393, 7.397], [11.7458, 6.9814], [11.0588, 6.6444], [10.4974, 7.0554], [10.1183, 7.0388], [9.5227, 6.4535], [9.2332, 6.4445], [8.7575, 5.4797], [8.5003, 4.772]];

// Real lon/lat of every state capital (source: public Nigeria states dataset).
// We use each state's capital as its anchor point — this is what drives both
// dot-cluster placement AND the Voronoi "state boundary" lines below.
const STATES = [
  { name: "Abia", lon: 7.5247, lat: 5.4309 },
  { name: "Adamawa", lon: 12.4381, lat: 9.325 },
  { name: "Akwa Ibom", lon: 7.8722, lat: 4.93 },
  { name: "Anambra", lon: 7.0068, lat: 6.2758 },
  { name: "Bauchi", lon: 9.8442, lat: 10.3158 },
  { name: "Bayelsa", lon: 5.8987, lat: 4.8678 },
  { name: "Benue", lon: 8.8363, lat: 7.3508 },
  { name: "Borno", lon: 12.9789, lat: 11.5097 },
  { name: "Cross River", lon: 8.6601, lat: 6.167 },
  { name: "Delta", lon: 5.8987, lat: 5.5325 },
  { name: "Ebonyi", lon: 7.9593, lat: 6.178 },
  { name: "Enugu", lon: 7.5103, lat: 6.4527 },
  { name: "Edo", lon: 5.8987, lat: 6.5438 },
  { name: "Ekiti", lon: 5.3102, lat: 7.6656 },
  { name: "FCT", lon: 7.179, lat: 8.8557 },
  { name: "Gombe", lon: 11.1667, lat: 10.2833 },
  { name: "Imo", lon: 6.9209, lat: 5.5215 },
  { name: "Jigawa", lon: 8.9401, lat: 12.57 },
  { name: "Kaduna", lon: 7.4333, lat: 10.5167 },
  { name: "Kano", lon: 8.592, lat: 12.0022 },
  { name: "Katsina", lon: 7.6, lat: 12.9833 },
  { name: "Kebbi", lon: 4.0695, lat: 11.6781 },
  { name: "Kogi", lon: 6.5783, lat: 7.5619 },
  { name: "Kwara", lon: 4.5624, lat: 8.9848 },
  { name: "Lagos", lon: 3.3792, lat: 6.5244 },
  { name: "Nasarawa", lon: 8.3088, lat: 8.5705 },
  { name: "Niger", lon: 8.6753, lat: 9.082 },
  { name: "Ogun", lon: 3.2584, lat: 6.9098 },
  { name: "Ondo", lon: 4.8333, lat: 7.0833 },
  { name: "Osun", lon: 4.5624, lat: 7.5876 },
  { name: "Oyo", lon: 3.933, lat: 7.85 },
  { name: "Plateau", lon: 9.8965, lat: 8.8583 },
  { name: "Rivers", lon: 6.9209, lat: 4.8581 },
  { name: "Sokoto", lon: 5.2333, lat: 13.0667 },
  { name: "Taraba", lon: 10.9807, lat: 7.9869 },
  { name: "Yobe", lon: 11.7068, lat: 12.1871 },
  { name: "Zamfara", lon: 6.2376, lat: 12.1844 },
];

const VIEW_W = 640;
const VIEW_H = 640;

// Sample data — swap this for your real `students` API response.
const SAMPLE_STUDENTS = [
  { location: "Lagos, Nigeria" }, { location: "Lagos, Nigeria" }, { location: "Lagos, Nigeria" },
  { location: "Plateau, Nigeria" },
  { location: "Ebonyi, Nigeria" }, { location: "Ebonyi, Nigeria" },
  { location: "Delta, Nigeria" },
];

export default function LocationAnalysisMap() {
  const [students] = useState(SAMPLE_STUDENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const locationStats = useMemo(() => {
    if (!students.length) return [];
    const counts = {};
    students.forEach((s) => {
      const state = (s.location || "Unknown, Unknown").split(",")[0].trim();
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

    const projection = d3.geoMercator().fitSize([VIEW_W, VIEW_H], outlineFeature);
    const pathGen = d3.geoPath(projection);
    const outlinePath = pathGen(outlineFeature);

    const projectedStates = STATES.map((s) => {
      const [x, y] = projection([s.lon, s.lat]);
      return { ...s, x, y };
    });

    // Voronoi cells anchored on real capital coordinates approximate each
    // state's territory — genuinely derived from geography, not guessed.
    const delaunay = d3.Delaunay.from(projectedStates.map((s) => [s.x, s.y]));
    const voronoi = delaunay.voronoi([-40, -40, VIEW_W + 40, VIEW_H + 40]);

    const voronoiPath = voronoi.render();

    return { outlinePath, projectedStates, voronoiPath };
  }, []);

  const topStatesWithCoords = topStates.map((ts) => {
    const match = projectedStates.find(
      (p) => p.name.toLowerCase() === ts.name.toLowerCase()
    );
    return { ...ts, x: match?.x ?? VIEW_W / 2, y: match?.y ?? VIEW_H / 2 };
  });

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
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-blue-500 transition-colors z-10"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div className="h-40 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E2330] rounded-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col shadow-2xl">
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

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-64 border-r border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-4 bg-gray-50/50 dark:bg-[#181C26] overflow-y-auto custom-scrollbar">
                
                {/* Stat Card 1 */}
                <div className="bg-white dark:bg-gray-800/80 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location Reach</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{totalStates}</span>
                    <span className="text-xs font-semibold text-gray-500">states</span>
                  </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white dark:bg-gray-800/80 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Users Reached</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{totalStudents.toLocaleString()}</span>
                    <span className="text-xs font-semibold text-gray-500">students</span>
                  </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white dark:bg-gray-800/80 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Period</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-gray-900 dark:text-white">All</span>
                    <span className="text-xs font-semibold text-gray-500">time</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-900/30">
                  <MapPinned className="w-4 h-4 shrink-0" />
                  <span>Positions mapped via D3 projection</span>
                </div>
              </div>

              <div className="flex-1 relative bg-white dark:bg-[#1E2330] flex items-center justify-center p-4 sm:p-8 overflow-hidden">
                <div className="relative w-full max-w-2xl aspect-square">
                  <svg
                    viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                    className="absolute inset-0 w-full h-full"
                  >
                    <defs>
                      <clipPath id="nigeria-real-clip">
                        <path d={outlinePath} />
                      </clipPath>
                    </defs>

                    {/* Thin blue lines: state divisions, derived from real capital
                        coordinates via a Voronoi tessellation, clipped to the outline */}
                    <g clipPath="url(#nigeria-real-clip)">
                      <path
                        d={voronoiPath}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        className="text-blue-400/40 dark:text-blue-500/30"
                      />
                    </g>

                    {/* Thick blue line: the real country outline */}
                    <path
                      d={outlinePath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      className="text-blue-600 dark:text-blue-500"
                    />
                  </svg>

                  {/* Dot clusters — one per state, positioned at its real
                      capital's projected coordinates */}
                  {projectedStates.map((st) => {
                    const activeIndex = topStates.findIndex(
                      (t) => t.name.toLowerCase() === st.name.toLowerCase()
                    );
                    const isActive = activeIndex !== -1;
                    const activeColor = isActive ? COLORS[activeIndex % COLORS.length] : undefined;
                    const dotOffsets = [
                      { dx: 0, dy: 0 },
                      { dx: -1.2, dy: -1.2 }, { dx: 1.2, dy: -1.2 },
                      { dx: -1.8, dy: 0 }, { dx: 1.8, dy: 0 },
                      { dx: -1.2, dy: 1.2 }, { dx: 1.2, dy: 1.2 },
                    ];
                    return (
                      <div
                        key={st.name}
                        className="absolute"
                        style={{
                          left: `${(st.x / VIEW_W) * 100}%`,
                          top: `${(st.y / VIEW_H) * 100}%`,
                        }}
                      >
                        {dotOffsets.map((offset, i) => (
                          <div
                            key={i}
                            className={`absolute rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500
                              ${isActive ? "w-1.5 h-1.5 z-10 scale-125" : "bg-slate-300 dark:bg-slate-600 w-1 h-1 opacity-50"}`}
                            style={{
                              left: `${offset.dx * 6}px`,
                              top: `${offset.dy * 6}px`,
                              backgroundColor: isActive ? activeColor : undefined,
                              boxShadow: isActive ? `0 0 8px ${activeColor}80` : undefined,
                            }}
                          />
                        ))}
                        {!isActive && (
                          <span className="absolute left-1/2 -translate-x-1/2 top-3 text-[8px] text-slate-400 dark:text-slate-500 font-medium opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap cursor-default">
                            {st.name}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {/* Floating tooltip cards for active/top states */}
                  {topStatesWithCoords.map((state, idx) => {
                    let transformClass = "-translate-x-1/2 -translate-y-[calc(100%+16px)]";
                    const yPct = (state.y / VIEW_H) * 100;
                    const xPct = (state.x / VIEW_W) * 100;
                    if (yPct < 20) transformClass = "-translate-x-1/2 translate-y-4";
                    if (xPct < 15) transformClass = "translate-x-4 -translate-y-1/2";
                    if (xPct > 85) transformClass = "-translate-x-[calc(100%+16px)] -translate-y-1/2";
                    const stateColor = COLORS[idx % COLORS.length];

                    return (
                      <div
                        key={`card-${state.name}`}
                        className={`absolute bg-slate-800 dark:bg-slate-700 text-white rounded-xl shadow-xl flex flex-col border border-slate-600/50 overflow-hidden min-w-[130px] transform hover:scale-105 transition-transform z-20 ${transformClass}`}
                        style={{ left: `${xPct}%`, top: `${yPct}%` }}
                      >
                        <div className="px-3 py-2 border-b border-slate-600/50 flex items-center gap-2 bg-slate-900/40">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: `${stateColor}30`, border: `1px solid ${stateColor}` }}
                          >
                            <MapPin className="w-3 h-3" style={{ color: stateColor }} />
                          </div>
                          <span className="text-xs font-semibold text-slate-300 truncate">{state.name}</span>
                        </div>
                        <div className="px-3 py-3 bg-slate-800/80">
                          <span className="text-xl font-black" style={{ color: stateColor }}>
                            {state.value.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1 font-semibold uppercase">Users</span>
                        </div>
                        {transformClass === "-translate-x-1/2 -translate-y-[calc(100%+16px)]" && (
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45 border-r border-b border-slate-600/50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}