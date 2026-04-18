# GOAT Visualization — Full UI Development Plan

## Tech Stack
- **Framework**: React (with hooks)
- **Charts**: Recharts (for bar charts, radar, line charts) + D3 (for parallel coordinates, bubble chart)
- **Styling**: Tailwind CSS utility classes
- **State**: React `useState` / `useReducer` (no localStorage — all in-memory)
- **Routing**: React Router v6 (hash router, one route per stage)
- **Fonts**: Use a distinctive display font (e.g. `Playfair Display` for headings, `DM Sans` for body) — import via Google Fonts in index.html

---

## Aesthetic Direction

**Theme**: Dark, editorial, premium sports broadcast feel.
- Background: deep charcoal (`#0f0f0f`)
- Surface cards: `#1a1a1a` with subtle `#2a2a2a` borders
- Accent colors per sport:
  - Football: Amber (`#F59E0B`)
  - Chess: Teal (`#14B8A6`)
  - F1: Coral/Red (`#EF4444`)
- GOAT Score: Gold gradient text (`#F59E0B` → `#FBBF24`)
- All transitions: `300ms ease`
- Section transitions: full-screen fade/slide

---

## App Architecture

```
src/
├── App.jsx                  # Router, global state (userProfile, weights, athletes)
├── data/
│   ├── football.js          # 10-15 football athletes with attributes
│   ├── chess.js             # 10-15 chess players with attributes
│   ├── f1.js                # 10-15 F1 drivers with attributes
│   └── attributeMap.js      # Maps tags/answers → weight profiles
├── components/
│   ├── ProgressBar.jsx      # Stage progress indicator at top
│   ├── WeightSliders.jsx    # Reusable weight slider panel
│   └── GoatScoreCard.jsx    # Reusable athlete score card
├── stages/
│   ├── Stage0_Intro.jsx     # Landing screen
│   ├── Stage1_Preferences/
│   │   ├── Step1_Tags.jsx        # Keyword tag selection
│   │   ├── Step2_Pairwise.jsx    # Targeted trade-off questions
│   │   └── Step3_WeightReview.jsx # Inferred weight profile + nudge
│   ├── Stage2_SportDives/
│   │   ├── SportDive.jsx         # Generic sport deep dive (receives sport prop)
│   │   ├── RadarView.jsx
│   │   ├── RankedBarChart.jsx
│   │   └── CareerTimeline.jsx
│   ├── Stage3_CrossSport/
│   │   ├── BubbleChart.jsx
│   │   └── ParallelCoords.jsx
│   └── Stage4_Verdict/
│       ├── Leaderboard.jsx
│       └── Podium.jsx
└── utils/
    ├── scoring.js           # GOAT score computation logic
    └── normalize.js         # Normalize raw stats to 0–1 scale per sport
```

---

## Global State (App.jsx)

```js
const initialState = {
  // Stage 1 outputs
  selectedTags: [],         // string[] — tags user selected
  pairwiseAnswers: [],      // {questionId, choice}[] — trade-off answers
  weights: {                // 0–1, sum to 1 (user can adjust in Stage 1 Step 3)
    dominance: 0.25,
    longevity: 0.25,
    accolades: 0.25,
    eraDifficulty: 0.25,
  },

  // Stage 2 state
  selectedAthletes: {       // which athletes are highlighted in radar/timeline
    football: [],
    chess: [],
    f1: [],
  },

  // Computed (derived in scoring.js)
  sportScores: {},          // { athleteId: { sportScore, breakdown } }
  overallScores: {},        // { athleteId: overallScore }

  currentStage: 0,
  currentSport: 'football', // for Stage 2 navigation
};
```

---

## Stage 0 — Landing Screen (`Stage0_Intro.jsx`)

**Layout**: Full-screen, centered, minimal.

**Content**:
- Animated headline: `"Who is the Greatest of All Time?"` — letters stagger in
- Subheading: `"Football. Chess. Formula 1. You decide."` — fade in after headline
- Three sport icons animating in (ball, chess piece, helmet) using CSS keyframes
- Large CTA button: `"Start Exploring →"` — navigates to Stage 1

**Implementation notes**:
- Use `animation-delay` staggering for text reveal (no libraries needed)
- Sport icons: inline SVG paths, not emoji
- Button click sets `currentStage = 1` in global state

---

## Stage 1 — Preferences (`Stage1_Preferences/`)

Three sequential steps within Stage 1. A small dot-indicator (● ○ ○) shows progress.

### Step 1 — Keyword Tag Selection (`Step1_Tags.jsx`)

**Layout**: Centered, single column.

**Content**:
- Heading: `"What makes a sporting legend?"`
- Subheading: `"Pick up to 5 words that matter most to you"`
- Grid of 12 tags (4 columns × 3 rows), each a pill button
- Tags: `Consistency`, `Peak Dominance`, `Titles & Trophies`, `Longevity`, `Rivalry`, `Beating the Odds`, `Records`, `Era Difficulty`, `Mental Strength`, `Innovation`, `Impact on the Sport`, `Clutch Performance`
- Selected state: amber/gold filled pill; unselected: outlined pill
- Counter: `"3 / 5 selected"` updates live
- `"Next →"` button — disabled until ≥ 1 tag selected

**State**: `selectedTags: string[]`

**Implementation notes**:
- Pills: `<button>` with toggle class
- Max 5: clicking a 6th tag does nothing (or shows subtle shake animation)
- Tags stored in global state on Next

---

### Step 2 — Pairwise Trade-offs (`Step2_Pairwise.jsx`)

**Layout**: Card-based, one question at a time. Slide transition between questions.

**Content**:
- 3 questions, generated from `selectedTags` (see `attributeMap.js`)
- Each question shows:
  - A framing question (e.g. `"Which impresses you more?"`)
  - Two option cards (A and B), each with a title and a 1-sentence description
  - Selecting one highlights it; auto-advances after 400ms delay
- Progress dots: `● ● ○` for Q2 of 3
- Back button returns to previous question

**Question generation logic** (`attributeMap.js`):
```js
// Tags map to question pools
const questionPool = {
  'Peak Dominance + Longevity': {
    question: "Which impresses you more?",
    a: { title: "3 back-to-back titles in 4 years", desc: "A short but overwhelming peak" },
    b: { title: "1 title across a 15-year top-3 career", desc: "Remarkable consistency over time" },
    maps: { a: { dominance: +0.15 }, b: { longevity: +0.15 } }
  },
  // ... more pairings
}
```

**State**: `pairwiseAnswers: [{questionId, choice}]`

---

### Step 3 — Weight Review (`Step3_WeightReview.jsx`)

**Layout**: Split — left shows inferred profile, right shows sliders.

**Content**:
- Left panel:
  - Heading: `"Here's what we heard"`
  - Short summary sentence: `"You value Peak Dominance and Accolades most, with some weight on Era Difficulty"`
  - Mini radar chart (4 axes = the 4 categories) showing inferred weights — read-only, decorative
- Right panel:
  - 4 labeled sliders (one per category) — pre-populated from inference
  - Sliders are linked: adjusting one proportionally reduces others to keep sum = 1
  - Live preview: small ranked list of 3 athletes updates as sliders move (one per sport)
- `"Let's go →"` button — confirms weights, navigates to Stage 2

**State**: `weights: { dominance, longevity, accolades, eraDifficulty }`

**Implementation notes**:
- Linked slider logic: when user drags slider X to value v, calculate delta = v - prev_v, distribute -delta proportionally across other sliders
- Mini radar: use Recharts `RadarChart` with 4 data points

---

## Stage 2 — Sport Deep Dives (`Stage2_SportDives/`)

Three sequential sections (Football → Chess → F1), each using `SportDive.jsx` with different data. A sport selector tab bar at the top lets users jump between sports after first visit.

### SportDive.jsx — Container

**Layout**: Three-panel stacked vertically within a scrollable section.

**Header**: Sport name + tagline (e.g. `"Formula 1 — Speed, strategy, survival"`)

Each sport section contains three views stacked vertically:

---

### View A — Radar Chart (`RadarView.jsx`)

**Purpose**: Compare 2–3 athletes on sport-specific normalized attributes.

**Content**:
- Athlete selector: row of pill buttons (athlete names), click to toggle selection (max 3)
- Recharts `RadarChart` — one colored polygon per selected athlete
- Legend below chart with athlete name + sport color
- Axes: 5–6 sport-specific normalized attributes (from your schema, normalized 0–1)
- Tooltip on hover: shows raw stat value + normalized score

**Implementation notes**:
- Recharts `RadarChart` with `PolarGrid`, `PolarAngleAxis`, `Radar`
- Each athlete gets a distinct color from a fixed palette
- Normalize all attributes to 0–1 in `normalize.js` using min-max per attribute

---

### View B — Ranked Bar Chart (`RankedBarChart.jsx`)

**Purpose**: Rank all athletes in this sport by current weighted GOAT score.

**Content**:
- Horizontal bar chart — athletes on Y axis, score on X axis
- Bars sorted by score (updates live when weights change)
- Each bar: filled with sport accent color, with a subtle score label at end
- Highlighted athlete (from radar selection) has a gold outline
- Weight sliders panel sits to the right of the chart (collapsible on mobile)
- Live update: bars animate (width transition 300ms) when sliders change

**Implementation notes**:
- Recharts `BarChart` with `layout="vertical"`
- Score = `sum(weight_i * normalizedAttribute_i)` computed in `scoring.js`
- Slider panel is a slimmer version of Step 3 sliders (sport-specific attributes only)

---

### View C — Career Timeline (`CareerTimeline.jsx`)

**Purpose**: Show a key performance metric over time — longevity and peak story.

**Content**:
- Recharts `LineChart` — X axis: year, Y axis: key metric (goals/season, Elo rating, championship points)
- One line per athlete currently selected in the radar
- Hover tooltip: year + metric value
- Annotations: small labeled dots for major titles/awards in that year
- Shaded "prime" region: the span where the athlete was above their own career average

**Implementation notes**:
- Data shape: `{ year, value, award? }` per athlete per year
- Prime region: `ReferenceArea` in Recharts with low opacity fill
- Award annotations: custom dot renderer that draws a small star shape at award years

---

### Sport GOAT Card

At the bottom of each sport section, a prominent card reveals:
- `"Based on your values, the [Sport] GOAT is..."` 
- Athlete photo placeholder (colored avatar with initials)
- Name, sport GOAT score, and top 2 reasons (highest-weighted attributes)
- `"See how the scores compare →"` navigates to Stage 3

---

## Stage 3 — Cross-Sport Comparison (`Stage3_CrossSport/`)

Two views stacked vertically.

### View A — Bubble Chart (`BubbleChart.jsx`)

**Purpose**: Show all athletes from all sports in a shared space.

**Content**:
- D3 force-simulation or simple SVG scatter plot
- X axis: Longevity score (normalized, 0–1)
- Y axis: Dominance score (normalized, 0–1)
- Bubble size: Accolades score
- Bubble color: sport (amber = football, teal = chess, coral = F1)
- Hover tooltip: athlete name, sport, all 4 category scores
- Click on bubble: highlights athlete in the parallel coordinates below
- Legend: 3 sport color swatches

**Implementation notes**:
- Use D3 for bubble rendering (SVG circles in a React ref container)
- Tooltip: absolute-positioned div, show/hide on mouse enter/leave
- Animate bubbles in on mount: scale from 0 using CSS transform transition

---

### View B — Parallel Coordinates (`ParallelCoords.jsx`)

**Purpose**: Show all athletes on the same 4 axes simultaneously.

**Content**:
- D3 parallel coordinates — 4 vertical axes: Dominance, Longevity, Accolades, Era Difficulty
- One polyline per athlete, colored by sport
- Brushing: drag on any axis to filter to athletes within that range
- Hover: highlights one athlete's line, others fade to 10% opacity
- Selected athletes (from bubble chart click) are pre-highlighted

**Implementation notes**:
- D3 `scaleLinear` for each axis
- `d3.brushY` for axis brushing
- Lines: SVG `<path>` elements with `stroke-opacity` transitions
- This is the most complex component — allocate the most dev time here

---

## Stage 4 — The Verdict (`Stage4_Verdict/`)

### Leaderboard (`Leaderboard.jsx`)

**Content**:
- Full ranked list of all 30–45 athletes by overall GOAT score
- Filterable by sport (pill filter buttons)
- Each row: rank number, athlete name, sport badge, overall score, mini bar showing score breakdown (4 colored segments)
- Sorting: click column headers to sort by individual category

**Implementation notes**:
- Overall score = average of normalized sport scores weighted by user weights
- Mini breakdown bar: use inline SVG `<rect>` segments, 4 colors for 4 categories
- Filter state: local to this component

---

### Podium (`Podium.jsx`)

**Content**:
- Top 3 athletes displayed on a podium (1st tallest, 2nd, 3rd)
- Each podium block shows: rank, athlete name, sport, overall GOAT score
- Animated entry: blocks rise from bottom with staggered delay
- Score breakdown radar below the podium for each of the top 3

**Implementation notes**:
- Podium: three `<div>` blocks with different heights (CSS)
- Entry animation: `translateY(100%) → translateY(0)` with `animation-delay`
- Radar: reuse `RadarView.jsx` in read-only mode

**"Change your values" prompt**:
- At the bottom: `"Your values shaped this result. Change them and see who rises."`
- Button: `"Adjust my weights →"` — opens a modal with the weight sliders from Step 3
- On confirm: re-scores everything and updates leaderboard + podium live

---

## Scoring Logic (`utils/scoring.js`)

```js
// Step 1: Normalize each athlete's raw attributes to 0–1 per sport
// (min-max normalization per attribute across all athletes in that sport)

// Step 2: Compute sport-specific GOAT score
function sportScore(athlete, sportAttributes, weights) {
  return sportAttributes.reduce((sum, attr) => {
    return sum + (weights[attr.category] * athlete.normalized[attr.name]);
  }, 0);
}

// Step 3: Map sport scores to the 4 universal categories for cross-sport scoring
// Each sport schema specifies which attributes map to which category

// Step 4: Compute overall GOAT score
function overallScore(athleteSportScore, weights) {
  // Overall = weighted sum of the 4 category scores (normalized across all sports)
}
```

---

## `attributeMap.js` — Tag/Answer to Weight Inference

```js
// Each tag contributes small boosts to weight categories
const tagWeights = {
  'Consistency':        { longevity: +0.1, dominance: +0.05 },
  'Peak Dominance':     { dominance: +0.15 },
  'Titles & Trophies':  { accolades: +0.15 },
  'Longevity':          { longevity: +0.15 },
  'Rivalry':            { eraDifficulty: +0.1, dominance: +0.05 },
  'Beating the Odds':   { eraDifficulty: +0.15 },
  'Records':            { dominance: +0.1, accolades: +0.05 },
  'Era Difficulty':     { eraDifficulty: +0.15 },
  'Mental Strength':    { dominance: +0.08, eraDifficulty: +0.07 },
  'Innovation':         { eraDifficulty: +0.1 },
  'Impact on the Sport':{ accolades: +0.1, longevity: +0.05 },
  'Clutch Performance': { dominance: +0.1, accolades: +0.05 },
};

// Pairwise answers add larger boosts to winning category
// Final weights = base (0.25 each) + tag boosts + pairwise boosts, then re-normalized to sum = 1

export function inferWeights(selectedTags, pairwiseAnswers) {
  const deltas = { dominance: 0, longevity: 0, accolades: 0, eraDifficulty: 0 };
  selectedTags.forEach(tag => {
    Object.entries(tagWeights[tag] || {}).forEach(([k, v]) => deltas[k] += v);
  });
  pairwiseAnswers.forEach(({ maps }) => {
    Object.entries(maps).forEach(([k, v]) => deltas[k] += v);
  });
  const base = { dominance: 0.25, longevity: 0.25, accolades: 0.25, eraDifficulty: 0.25 };
  const raw = Object.fromEntries(
    Object.keys(base).map(k => [k, Math.max(0.05, base[k] + deltas[k])])
  );
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.keys(raw).map(k => [k, raw[k] / total]));
}
```

---

## Progress Indicator (`ProgressBar.jsx`)

Always visible at the top of the screen (sticky header):

```
Stage 1: Your Values  →  Stage 2: Sport Dives  →  Stage 3: Compare  →  Stage 4: Verdict
          ●                       ○                       ○                    ○
```

- Completed stages: filled circle + solid line
- Current stage: filled circle + label highlighted
- Future stages: empty circle + muted label
- Clicking a completed stage navigates back (with confirmation if weights would be reset)

---

## Data File Structure (`data/football.js` example)

```js
export const footballAthletes = [
  {
    id: 'messi',
    name: 'Lionel Messi',
    yearsActive: [2004, 2024],
    raw: {
      // Raw stats — normalized separately in normalize.js
      ballonorors: 8,          // category: accolades
      leagueTitles: 12,        // category: accolades
      careerGoals: 850,        // category: dominance
      goalsPerGame: 0.78,      // category: dominance
      primeYears: 10,          // category: longevity (years above career avg)
      careerLength: 20,        // category: longevity
      eraCompetitiveness: 9.2, // category: eraDifficulty (manual score 0–10)
      // ... more attributes from your schema
    },
    timeline: [
      { year: 2005, value: 6 },
      { year: 2006, value: 17 },
      // goals per season...
    ],
  },
  // ...
];

// Each attribute must specify which universal category it maps to
export const footballAttributeMeta = [
  { name: 'ballonDors',       label: "Ballon d'Or awards", category: 'accolades',      weight: 1.0 },
  { name: 'leagueTitles',     label: 'League titles',       category: 'accolades',      weight: 0.8 },
  { name: 'careerGoals',      label: 'Career goals',        category: 'dominance',      weight: 0.9 },
  { name: 'goalsPerGame',     label: 'Goals per game',      category: 'dominance',      weight: 1.0 },
  { name: 'primeYears',       label: 'Years at peak',       category: 'longevity',      weight: 0.9 },
  { name: 'careerLength',     label: 'Career length',       category: 'longevity',      weight: 0.7 },
  { name: 'eraCompetitiveness',label:'Era difficulty',      category: 'eraDifficulty',  weight: 1.0 },
];
```

---

## Key Implementation Priorities (in order)

1. **Data layer first** — build all three sport data files + `attributeMap.js` + `scoring.js` + `normalize.js`. Everything depends on this.
2. **Stage 1** — the preference elicitation is the most novel part; get it right early so you can test whether inferred weights feel accurate.
3. **Stage 2 — RankedBarChart** — simplest visualization, good for testing the scoring pipeline end-to-end.
4. **Stage 2 — RadarChart** — second easiest, immediately visually rewarding.
5. **Stage 2 — CareerTimeline** — needs the most data prep (per-year stats).
6. **Stage 4 — Leaderboard + Podium** — straightforward once scoring works.
7. **Stage 3 — BubbleChart** — moderate D3 complexity.
8. **Stage 3 — ParallelCoordinates** — hardest component, save for last.

---

## Notes for Claude Code

- Use `npm create vite@latest goat-viz -- --template react` to scaffold
- Install: `recharts`, `d3`, `react-router-dom`
- All data is static (hardcoded in `data/` files) — no API calls needed
- No `localStorage` — all state lives in React (resets on refresh, which is fine)
- Test scoring logic independently with `console.log` before building UI
- The parallel coordinates component is the hardest — consider using a D3 example as a reference and adapting it into a React component using `useRef` + `useEffect`
