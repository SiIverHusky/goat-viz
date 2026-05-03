import { useMemo, useState, useRef, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as d3 from "d3";
import { METRICS } from "../../data/attributeMap";

const SPORTS = [
  { key: "football", label: "Football", color: "#F59E0B" },
  { key: "chess", label: "Chess", color: "#14B8A6" },
  { key: "boxing", label: "Boxing", color: "#EF4444" },
];

const SPORT_ICONS = {
  football: "⚽",
  chess: "♟",
  boxing: "🥊",
};

export default function Stage5_Experimental({
  athletes,
  overallScores,
  weights,
  goTo,
}) {
  const [selectedSports, setSelectedSports] = useState(() =>
    SPORTS.map((s) => s.key),
  );
  const [groupBySport, setGroupBySport] = useState(false);
  const [sortByVisibleOnly, setSortByVisibleOnly] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(() =>
    METRICS.map((m) => m.key),
  );
  const [focusedMetric, setFocusedMetric] = useState(null);
  const [viewMode, setViewMode] = useState("stacked");

  const activeMetrics = useMemo(
    () => METRICS.filter((m) => selectedMetrics.includes(m.key)),
    [selectedMetrics],
  );

  const currentSortMode = useMemo(
    () =>
      sortByVisibleOnly && activeMetrics.length > 0
        ? "selected-categories"
        : "overall",
    [sortByVisibleOnly, activeMetrics],
  );

  const rankedAthletes = useMemo(() => {
    const all = [
      ...athletes.football.map((a) => ({ ...a, sport: "football" })),
      ...athletes.chess.map((a) => ({ ...a, sport: "chess" })),
      ...athletes.boxing.map((a) => ({ ...a, sport: "boxing" })),
    ];

    return all
      .map((a) => ({
        ...a,
        overallScore: overallScores[a.id]?.score || 0,
        breakdown: overallScores[a.id]?.breakdown || {},
      }))
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [athletes, overallScores]);

  const visibleAthletes = useMemo(() => {
    const filtered = rankedAthletes.filter((a) =>
      selectedSports.includes(a.sport),
    );
    if (currentSortMode === "overall") return filtered;

    const sortable = filtered.map((athlete, idx) => {
      const selectedTotal = activeMetrics.reduce((sum, metric) => {
        const value = athlete.breakdown?.[metric.key] || 0;
        const weight = weights[metric.key] || 0;
        return sum + value * weight;
      }, 0);

      return {
        athlete,
        idx,
        selectedTotal,
      };
    });

    sortable.sort((a, b) => {
      if (b.selectedTotal !== a.selectedTotal)
        return b.selectedTotal - a.selectedTotal;
      return a.idx - b.idx;
    });

    return sortable.map((entry) => entry.athlete);
  }, [rankedAthletes, selectedSports, currentSortMode, activeMetrics, weights]);

  const metricWeights = useMemo(() => ({ ...weights }), [weights]);

  const chartData = useMemo(
    () => toChartRows(visibleAthletes, METRICS, metricWeights),
    [visibleAthletes, metricWeights],
  );

  const groupedData = useMemo(() => {
    return SPORTS.map((sport) => ({
      sport,
      rows: toChartRows(
        visibleAthletes.filter((a) => a.sport === sport.key),
        METRICS,
        metricWeights,
      ),
    })).filter((group) => group.rows.length > 0);
  }, [visibleAthletes, metricWeights]);

  const totalShown = visibleAthletes.length;

  const toggleSport = (sportKey) => {
    setSelectedSports((prev) => {
      if (prev.includes(sportKey)) {
        if (prev.length === 1) return prev;
        return prev.filter((s) => s !== sportKey);
      }
      return [...prev, sportKey];
    });
  };

  const toggleMetric = (metricKey) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(metricKey)) {
        if (prev.length === 1) return prev;
        const next = prev.filter((m) => m !== metricKey);
        if (focusedMetric === metricKey) setFocusedMetric(null);
        return next;
      }
      return [...prev, metricKey];
    });
  };

  const toggleMetricFocus = (metricKey) => {
    setFocusedMetric((prev) => (prev === metricKey ? null : metricKey));
  };

  const isolateMetric = (metricKey) => {
    setSelectedMetrics([metricKey]);
    setFocusedMetric(metricKey);
  };

  const toggleMetricFilter = (metricKey) => {
    setSelectedMetrics((prev) => {
      if (prev.length === 1 && prev.includes(metricKey)) {
        // Currently filtering by this metric, so show all
        return METRICS.map((m) => m.key);
      } else {
        // Filter to only this metric
        return [metricKey];
      }
    });
    setFocusedMetric(null);
  };

  const clearCategoryFilters = () => {
    setSelectedMetrics(METRICS.map((metric) => metric.key));
    setFocusedMetric(null);
    setSortByVisibleOnly(false);
  };

  const clearMetricFilter = () => {
    clearCategoryFilters();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "36px 20px 64px",
        maxWidth: 1240,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 12,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: "clamp(1.9rem, 4vw, 3.1rem)",
              fontWeight: 900,
              margin: "0 0 8px",
              background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Experimental
          </h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
            Horizontal stacked bars ranked by overall score. Tweak filters to
            inspect the composition.
          </p>
        </div>

        <button
          onClick={() => goTo(2)}
          style={{
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #374151",
            backgroundColor: "#111827",
            color: "#d1d5db",
            cursor: "pointer",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Back to Cross-Sport
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(250px, 320px) 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        <aside
          style={{
            backgroundColor: "#121212",
            border: "1px solid #262626",
            borderRadius: 14,
            padding: 16,
            position: "sticky",
            top: 72,
          }}
        >
          <ControlSection title="Filter by sport">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SPORTS.map((s) => {
                const active = selectedSports.includes(s.key);
                return (
                  <button
                    key={s.key}
                    onClick={() => toggleSport(s.key)}
                    style={{
                      textAlign: "left",
                      borderRadius: 999,
                      border: `1px solid ${active ? s.color : "#2f2f2f"}`,
                      backgroundColor: active ? `${s.color}22` : "transparent",
                      color: active ? s.color : "#9ca3af",
                      padding: "7px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </ControlSection>

          <ControlSection title="Display mode">
            <div style={{ display: "grid", gap: 8 }}>
              <label
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  color: "#d1d5db",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={groupBySport}
                  onChange={(e) => setGroupBySport(e.target.checked)}
                />
                Group by sport
              </label>

              <label
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  color: "#d1d5db",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={sortByVisibleOnly}
                  onChange={(e) => setSortByVisibleOnly(e.target.checked)}
                  disabled={activeMetrics.length === 0}
                />
                Sort by selected categories only
              </label>
            </div>
          </ControlSection>

          <ControlSection title="Filter values by category">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 260,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {METRICS.map((metric) => {
                const active = selectedMetrics.includes(metric.key);
                return (
                  <button
                    key={metric.key}
                    onClick={() => toggleMetric(metric.key)}
                    style={{
                      textAlign: "left",
                      borderRadius: 8,
                      border: `1px solid ${active ? metric.color : "#2f2f2f"}`,
                      backgroundColor: active
                        ? `${metric.color}1f`
                        : "transparent",
                      color: active ? "#f3f4f6" : "#9ca3af",
                      padding: "7px 10px",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        backgroundColor: metric.color,
                        marginRight: 8,
                      }}
                      onDoubleClick={clearMetricFilter}
                      title="Double-click to clear category filters"
                    />
                    {metric.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={clearCategoryFilters}
              style={{
                marginTop: 10,
                width: "100%",
                border: "1px solid #374151",
                backgroundColor: "#111827",
                color: "#d1d5db",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                padding: "8px 10px",
                cursor: "pointer",
              }}
            >
              Show all categories
            </button>
          </ControlSection>

          <div
            style={{
              marginTop: 16,
              borderTop: "1px solid #262626",
              paddingTop: 12,
              color: "#9ca3af",
              fontSize: 12,
              lineHeight: 1.45,
            }}
          >
            <div>{totalShown} athletes visible</div>
            <div>{activeMetrics.length} categories shown</div>
            <div style={{ marginTop: 6, color: "#6b7280" }}>
              Sort mode:{" "}
              {currentSortMode === "overall"
                ? "overall score"
                : "selected categories"}
            </div>
          </div>
        </aside>

        <main
          style={{
            backgroundColor: "#121212",
            border: "1px solid #262626",
            borderRadius: 14,
            padding: 14,
            overflow: "hidden",
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              onClick={() => setViewMode("stacked")}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${viewMode === "stacked" ? "#9ca3af" : "#2f2f2f"}`,
                background: viewMode === "stacked" ? "#111827" : "transparent",
                color: viewMode === "stacked" ? "#fff" : "#9ca3af",
                cursor: "pointer",
              }}
            >
              Stacked view
            </button>
            <button
              onClick={() => setViewMode("compare")}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${viewMode === "compare" ? "#9ca3af" : "#2f2f2f"}`,
                background: viewMode === "compare" ? "#111827" : "transparent",
                color: viewMode === "compare" ? "#fff" : "#9ca3af",
                cursor: "pointer",
              }}
            >
              Compare view
            </button>
          </div>

          {viewMode === "stacked" ? (
            activeMetrics.length === 0 ? (
              <p style={{ color: "#6b7280", fontSize: 14, padding: 12 }}>
                Select at least one category to render stacked values.
              </p>
            ) : totalShown === 0 ? (
              <p style={{ color: "#6b7280", fontSize: 14, padding: 12 }}>
                No athletes match the selected sport filters.
              </p>
            ) : groupBySport ? (
              <div style={{ display: "grid", gap: 28 }}>
                {groupedData.map((group) => (
                  <section
                    key={group.sport.key}
                    style={{
                      border: "1px solid #232323",
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 24,
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 8px",
                        fontSize: 15,
                        color: group.sport.color,
                        fontWeight: 700,
                      }}
                    >
                      {group.sport.label}
                    </h3>
                    <StackedAthleteChart
                      rows={group.rows}
                      activeMetrics={activeMetrics}
                      focusedMetric={focusedMetric}
                      onMetricFocus={toggleMetricFocus}
                      onMetricIsolate={toggleMetricFilter}
                      selectedMetrics={selectedMetrics}
                    />
                  </section>
                ))}
              </div>
            ) : (
              <StackedAthleteChart
                rows={chartData}
                activeMetrics={activeMetrics}
                focusedMetric={focusedMetric}
                onMetricFocus={toggleMetricFocus}
                onMetricIsolate={toggleMetricFilter}
                selectedMetrics={selectedMetrics}
              />
            )
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              <CompareView
                athletes={rankedAthletes.filter((a) =>
                  selectedSports.includes(a.sport),
                )}
                metrics={METRICS}
                selectedSports={selectedSports}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function toChartRows(athletes, metrics, weights) {
  return athletes.map((athlete, idx) => {
    const icon = SPORT_ICONS[athlete.sport] || "•";
    const row = {
      id: athlete.id,
      rank: idx + 1,
      name: athlete.name,
      icon,
      overall: round1((athlete.overallScore || 0) * 100),
      sport: athlete.sport,
    };

    metrics.forEach((metric) => {
      const value = athlete.breakdown?.[metric.key] || 0;
      const weight = weights[metric.key] || 0;
      row[metric.key] = round1(value * weight * 100);
    });

    return row;
  });
}

function AthleteAxisTick({ x, y, payload, rowById }) {
  const row = rowById.get(payload.value);
  if (!row) return null;

  const rankX = x - 206;
  const iconX = x - 168;
  const nameX = x - 140;

  return (
    <g>
      <text
        x={rankX}
        y={y}
        dy={4}
        textAnchor="start"
        fill="#9ca3af"
        fontSize={11}
      >
        {row.rank}.
      </text>
      <text
        x={iconX}
        y={y}
        dy={4}
        textAnchor="start"
        fill="#d1d5db"
        fontSize={12}
      >
        {row.icon}
      </text>
      <text
        x={nameX}
        y={y}
        dy={4}
        textAnchor="start"
        fill="#d1d5db"
        fontSize={11}
      >
        {row.name}
      </text>
    </g>
  );
}

function StackedAthleteChart({
  rows,
  activeMetrics,
  focusedMetric,
  onMetricFocus,
  onMetricIsolate,
  selectedMetrics,
}) {
  const chartHeight = Math.max(320, rows.length * 34 + 30);
  const rowById = useMemo(
    () => new Map(rows.map((row) => [row.id, row])),
    [rows],
  );

  const lastClickRef = useMemo(() => ({ metric: null, time: 0 }), []);

  const handleSegmentClick = (metricKey) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickRef.time;

    if (lastClickRef.metric === metricKey && timeSinceLastClick < 300) {
      // Double click detected
      onMetricIsolate(metricKey);
      lastClickRef.metric = null;
      lastClickRef.time = 0;
    } else {
      // Single click
      onMetricFocus(metricKey);
      lastClickRef.metric = metricKey;
      lastClickRef.time = now;
    }
  };

  return (
    <div style={{ width: "100%", height: chartHeight, paddingBottom: 28 }}>
      <ResponsiveContainer>
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 16 }}
          barCategoryGap={4}
        >
          <CartesianGrid horizontal={false} stroke="#1f2937" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: "#9ca3af", fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
          />
          <YAxis
            type="category"
            dataKey="id"
            width={240}
            tick={<AthleteAxisTick rowById={rowById} />}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: "rgba(148,163,184,0.08)" }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const row = payload[0].payload;
              return (
                <div
                  style={{
                    backgroundColor: "#0b0b0b",
                    border: "1px solid #2a2a2a",
                    borderRadius: 10,
                    padding: 10,
                    minWidth: 220,
                  }}
                >
                  <div
                    style={{
                      color: "#f3f4f6",
                      fontSize: 12,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {row.name}
                  </div>
                  <div
                    style={{ color: "#9ca3af", fontSize: 11, marginBottom: 8 }}
                  >
                    Overall:{" "}
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                      {row.overall.toFixed(1)}%
                    </span>
                  </div>
                  {activeMetrics.map((metric) => (
                    <div
                      key={metric.key}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 11,
                        marginBottom: 2,
                      }}
                    >
                      <span style={{ color: "#d1d5db" }}>{metric.label}</span>
                      <span style={{ color: metric.color, fontWeight: 700 }}>
                        {(row[metric.key] || 0).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              );
            }}
          />

          {activeMetrics.map((metric) => (
            <Bar
              key={metric.key}
              dataKey={metric.key}
              stackId="score"
              fill={metric.color}
              fillOpacity={
                focusedMetric && focusedMetric !== metric.key ? 0.2 : 1
              }
              radius={[0, 0, 0, 0]}
              isAnimationActive
              animationDuration={620}
              animationEasing="ease-in-out"
              style={{ cursor: "pointer" }}
            >
              {rows.map((row) => (
                <Cell
                  key={`${row.id}-${metric.key}`}
                  onClick={() => handleSegmentClick(metric.key)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div
        style={{
          marginTop: 16,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          alignItems: "center",
          paddingBottom: 4,
        }}
      >
        {activeMetrics.map((metric) => {
          const active = focusedMetric === metric.key;
          const dimmed = focusedMetric && focusedMetric !== metric.key;
          return (
            <button
              key={metric.key}
              onClick={() => onMetricFocus(metric.key)}
              style={{
                border: `1px solid ${metric.color}`,
                backgroundColor: active ? `${metric.color}33` : "transparent",
                color: active ? "#f3f4f6" : "#d1d5db",
                opacity: dimmed ? 0.45 : 1,
                borderRadius: 999,
                fontSize: 11,
                padding: "4px 9px",
                cursor: "pointer",
              }}
              onDoubleClick={() => onMetricIsolate(metric.key)}
            >
              {metric.label}
            </button>
          );
        })}

        {focusedMetric && (
          <button
            onClick={() => onMetricFocus(focusedMetric)}
            style={{
              border: "1px solid #374151",
              backgroundColor: "#111827",
              color: "#d1d5db",
              borderRadius: 999,
              fontSize: 11,
              padding: "4px 9px",
              cursor: "pointer",
            }}
          >
            Clear focus
          </button>
        )}
      </div>
    </div>
  );
}

function ControlSection({ title, children }) {
  return (
    <section style={{ marginBottom: 16 }}>
      <h3
        style={{
          margin: "0 0 8px",
          color: "#e5e5e5",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function CompareView({ athletes, metrics, selectedSports }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <BubbleCompare
        athletes={athletes}
        metrics={metrics}
        selectedSports={selectedSports}
      />
      <HeatmapCompare
        athletes={athletes}
        metrics={metrics}
        selectedSports={selectedSports}
      />
    </div>
  );
}

function BubbleCompare({ athletes, metrics, selectedSports }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [width, setWidth] = useState(700);
  const [xKey, setXKey] = useState(metrics[0]?.key || "overall");
  const [yKey, setYKey] = useState(
    metrics[1]?.key || metrics[0]?.key || "overall",
  );
  const [sizeKey, setSizeKey] = useState("none");
  const [tooltip, setTooltip] = useState(null);
  const [highlighted, setHighlighted] = useState(null);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const data = athletes;
    const height = 360;
    const margin = { top: 24, right: 16, bottom: 50, left: 60 };
    const W = Math.max(320, width - margin.left - margin.right);
    const H = height - margin.top - margin.bottom;

    d3.select(svgRef.current).selectAll("*").remove();
    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, W]);
    const y = d3.scaleLinear().domain([0, 1]).range([H, 0]);

    const getVal = (d, key) =>
      key === "overall" ? (d.overallScore ?? 0) : (d.breakdown?.[key] ?? 0);
    const sizeValues =
      sizeKey === "none"
        ? data.map(() => 0.5)
        : data.map((d) => getVal(d, sizeKey));
    const r = d3.scaleLinear().domain(d3.extent(sizeValues)).range([5, 28]);

    // axes
    g.append("g")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text")
      .style("fill", "#6b7280")
      .style("font-size", "10px");
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")))
      .selectAll("text")
      .style("fill", "#6b7280")
      .style("font-size", "10px");

    // bubbles
    const circles = g
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(getVal(d, xKey)))
      .attr("cy", (d) => y(getVal(d, yKey)))
      .attr("r", 0)
      .attr(
        "fill",
        (d) => SPORTS.find((s) => s.key === d.sport)?.color || "#777",
      )
      .attr("fill-opacity", (d) =>
        highlighted ? (d.id === highlighted ? 0.95 : 0.2) : 0.7,
      )
      .attr("stroke", (d) =>
        d.id === highlighted
          ? "#fff"
          : SPORTS.find((s) => s.key === d.sport)?.color,
      )
      .attr("stroke-width", (d) => (d.id === highlighted ? 2 : 0.6))
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        const rect = svgRef.current.getBoundingClientRect();
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          athlete: d,
        });
        setHighlighted(d.id);
      })
      .on("mouseleave", () => {
        setTooltip(null);
        setHighlighted(null);
      })
      .on("click", (_, d) =>
        setHighlighted((prev) => (prev === d.id ? null : d.id)),
      );

    circles
      .transition()
      .duration(600)
      .attr("r", (d) => (sizeKey === "none" ? 10 : r(getVal(d, sizeKey))));

    // labels
    svg
      .append("text")
      .attr("x", margin.left + W / 2)
      .attr("y", height - 6)
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", 11)
      .text(
        xKey === "overall"
          ? "Overall score"
          : metrics.find((m) => m.key === xKey)?.label || xKey,
      );
    svg
      .append("text")
      .attr("x", -(margin.top + H / 2))
      .attr("y", 14)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("fill", "#6b7280")
      .attr("font-size", 11)
      .text(
        yKey === "overall"
          ? "Overall score"
          : metrics.find((m) => m.key === yKey)?.label || yKey,
      );
  }, [athletes, width, xKey, yKey, sizeKey, highlighted, metrics]);

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        border: "1px solid #232323",
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <div style={{ color: "#9ca3af", fontSize: 13 }}>X:</div>
        <select
          value={xKey}
          onChange={(e) => setXKey(e.target.value)}
          style={{ padding: 6, borderRadius: 8 }}
        >
          <option value="overall">Overall score</option>
          {metrics.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <div style={{ color: "#9ca3af", fontSize: 13 }}>Y:</div>
        <select
          value={yKey}
          onChange={(e) => setYKey(e.target.value)}
          style={{ padding: 6, borderRadius: 8 }}
        >
          <option value="overall">Overall score</option>
          {metrics.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
        <div style={{ color: "#9ca3af", fontSize: 13 }}>Size:</div>
        <select
          value={sizeKey}
          onChange={(e) => setSizeKey(e.target.value)}
          style={{ padding: 6, borderRadius: 8 }}
        >
          <option value="none">None</option>
          <option value="overall">Overall score</option>
          {metrics.map((m) => (
            <option key={m.key} value={m.key}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <svg ref={svgRef} style={{ width: "100%", overflow: "visible" }} />
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            backgroundColor: "#0f0f0f",
            border: "1px solid #222",
            borderRadius: 8,
            padding: 10,
            fontSize: 12,
            pointerEvents: "none",
          }}
        >
          <div style={{ color: "#f3f4f6", fontWeight: 700 }}>
            {tooltip.athlete.name}
          </div>
          <div style={{ color: "#9ca3af", fontSize: 12 }}>
            {tooltip.athlete.sport}
          </div>
        </div>
      )}
    </div>
  );
}

function HeatmapCompare({ athletes, metrics, selectedSports }) {
  const sports = SPORTS.filter((s) => selectedSports.includes(s.key));

  const averages = metrics.map((metric) => {
    const vals = sports.map((sport) => {
      const group = athletes.filter((a) => a.sport === sport.key);
      if (!group.length) return 0;
      const avg =
        group.reduce((sum, a) => sum + (a.breakdown?.[metric.key] || 0), 0) /
        group.length;
      return avg;
    });

    const mean = vals.reduce((s, v) => s + v, 0) / Math.max(1, vals.length);
    // deviations that sum to zero across sports
    const devs = vals.map((v) => v - mean);
    const maxAbs = Math.max(...devs.map((d) => Math.abs(d)), 1e-6);
    const norm = devs.map((d) => Math.max(-1, Math.min(1, d / maxAbs)));
    return { metric, vals, devs, norm, maxAbs };
  });

  const colorScale = d3
    .scaleLinear()
    .domain([-1, 0, 1])
    .range(["#ffb3b3", "#ffffff", "#86efac"]);

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        border: "1px solid #232323",
        padding: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ color: "#9ca3af", fontWeight: 700 }}>
          Heatmap — mean-centered deviations (sum = 0 per category)
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `160px repeat(${sports.length}, 1fr)`,
          gap: 6,
          alignItems: "center",
        }}
      >
        <div />
        {sports.map((s) => (
          <div
            key={s.key}
            style={{ color: s.color, fontSize: 13, fontWeight: 700 }}
          >
            {s.label}
          </div>
        ))}

        {averages.map((row) => (
          <div key={`row-${row.metric.key}`} style={{ display: "contents" }}>
            <div style={{ color: "#d1d5db", fontSize: 13, padding: "6px 8px" }}>
              {row.metric.label}
            </div>
            {row.devs.map((d, i) => (
              <div
                key={`${row.metric.key}-${i}`}
                style={{
                  background: colorScale(row.norm[i]),
                  padding: 8,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#111",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700 }}>
                  {d.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
