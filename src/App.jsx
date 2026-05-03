import { useState, useMemo, useCallback, useEffect } from "react";
import { footballAthletes, footballAttributeMeta } from "./data/football";
import { chessAthletes, chessAttributeMeta } from "./data/chess";
import { boxingAthletes, boxingAttributeMeta } from "./data/boxing";
import { initialWeights } from "./data/attributeMap";
import { normalizeAthletes } from "./utils/normalize";
import { computeAllSportScores, computeOverallScores } from "./utils/scoring";
import ProgressBar from "./components/ProgressBar";
import SidePanel from "./components/SidePanel";
import RightVerdictPanel from "./components/RightVerdictPanel";
import Stage0_Intro from "./stages/Stage0_Intro";
import Stage2_SportDives from "./stages/Stage2_SportDives/index";
import Stage3_CrossSport from "./stages/Stage3_CrossSport/index";
import Stage5_Experimental from "./stages/Stage5_Experimental/index";

const normalizedFootball = normalizeAthletes(footballAthletes);
const normalizedChess = normalizeAthletes(chessAthletes);
const normalizedBoxing = normalizeAthletes(boxingAthletes);

const PANEL_WIDTH = 272;
const RIGHT_PANEL_WIDTH = 360;

export default function App() {
  const [currentStage, setCurrentStage] = useState(0);
  const [currentSport, setCurrentSport] = useState("football");
  const [selectedTags, setSelectedTags] = useState([]);
  const [weights, setWeights] = useState(initialWeights);
  const [panelOpen, setPanelOpen] = useState(true);
  const [leaderboardOpen, setLeaderboardOpen] = useState(true);
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);
  const [chartHighlightedAthleteId, setChartHighlightedAthleteId] =
    useState(null);
  const [leaderboardHoveredAthleteId, setLeaderboardHoveredAthleteId] =
    useState(null);
  const [selectedAthletes, setSelectedAthletes] = useState({
    football: [normalizedFootball[0].id, normalizedFootball[1].id],
    chess: [normalizedChess[0].id, normalizedChess[1].id],
    boxing: [normalizedBoxing[0].id, normalizedBoxing[1].id],
  });

  const sportScores = useMemo(
    () =>
      computeAllSportScores(
        {
          football: normalizedFootball,
          chess: normalizedChess,
          boxing: normalizedBoxing,
        },
        weights,
      ),
    [weights],
  );

  const overallScores = useMemo(
    () => computeOverallScores(sportScores),
    [sportScores],
  );

  const goTo = useCallback((stage) => setCurrentStage(stage), []);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const showPanels = currentStage >= 1;
  const isDesktopDocked = viewportWidth >= 1200;
  const leftOffset =
    showPanels && isDesktopDocked ? (panelOpen ? PANEL_WIDTH : 20) : 0;
  const rightOffset =
    showPanels && isDesktopDocked
      ? leaderboardOpen
        ? RIGHT_PANEL_WIDTH + 16
        : 24
      : 0;
  const isSportDive = currentStage === 1;
  const isCrossSport = currentStage === 2;
  const isExperimental = currentStage === 3;
  const highlightedAthleteId = isCrossSport
    ? (leaderboardHoveredAthleteId ?? chartHighlightedAthleteId)
    : null;

  const handleSportDiveLeaderboardClick = useCallback(
    (athleteId) => {
      setSelectedAthletes((prev) => {
        const current = prev[currentSport] || [];
        const exists = current.includes(athleteId);
        const next = exists
          ? current.filter((id) => id !== athleteId)
          : [...current, athleteId];
        return { ...prev, [currentSport]: next };
      });
    },
    [currentSport],
  );

  const handleLeaderboardHover = useCallback((athleteId) => {
    setLeaderboardHoveredAthleteId(athleteId);
  }, []);

  const sharedProps = {
    currentStage,
    goTo,
    currentSport,
    setCurrentSport,
    selectedTags,
    setSelectedTags,
    weights,
    setWeights,
    selectedAthletes,
    setSelectedAthletes,
    sportScores,
    overallScores,
    athletes: {
      football: normalizedFootball,
      chess: normalizedChess,
      boxing: normalizedBoxing,
    },
    attributeMeta: {
      football: footballAttributeMeta,
      chess: chessAttributeMeta,
      boxing: boxingAttributeMeta,
    },
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f0f0f",
        color: "#e5e5e5",
      }}
    >
      {showPanels && (
        <SidePanel
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          weights={weights}
          setWeights={setWeights}
          isOpen={panelOpen}
          setIsOpen={setPanelOpen}
        />
      )}

      {showPanels && (
        <RightVerdictPanel
          athletes={sharedProps.athletes}
          sportScores={sportScores}
          overallScores={overallScores}
          selectedTags={selectedTags}
          currentStage={currentStage}
          currentSport={currentSport}
          selectedAthletes={selectedAthletes}
          highlightedAthleteId={highlightedAthleteId}
          isOpen={leaderboardOpen}
          setIsOpen={setLeaderboardOpen}
          onAthleteClick={
            isSportDive ? handleSportDiveLeaderboardClick : undefined
          }
          onAthleteHover={isCrossSport ? handleLeaderboardHover : undefined}
          isDocked={isDesktopDocked}
          width={RIGHT_PANEL_WIDTH}
        />
      )}

      <div
        style={{
          marginLeft: leftOffset,
          marginRight: rightOffset,
          transition:
            "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1), margin-right 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {currentStage > 0 && (
          <ProgressBar currentStage={currentStage} goTo={goTo} />
        )}
        {currentStage === 0 && <Stage0_Intro goTo={goTo} />}
        {currentStage === 1 && <Stage2_SportDives {...sharedProps} />}
        {currentStage === 2 && (
          <Stage3_CrossSport
            {...sharedProps}
            highlightedAthleteId={highlightedAthleteId}
            setHighlightedAthleteId={setChartHighlightedAthleteId}
          />
        )}
        {currentStage === 3 && <Stage5_Experimental {...sharedProps} />}
      </div>
    </div>
  );
}
