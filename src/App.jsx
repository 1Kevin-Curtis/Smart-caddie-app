import React, { useMemo, useState } from "react";
 
const screens = [
  "welcome",
  "profile",
  "home",
  "ready_to_play",
  "round_capture",
  "hole_detail",
  "round_summary",
  "next_plan",
  "in_round",
  "practice",
  "progress",
];

const screenLabels = {
  welcome: "Welcome",
  profile: "Golfer profile",
  home: "Home",
  ready_to_play: "Ready to Play",
  round_capture: "Round capture",
  hole_detail: "Hole detail",
  round_summary: "Round summary",
  next_plan: "Next Round Plan",
  in_round: "Smart prompt",
  practice: "Practice plan",
  progress: "Progress",
};

const holePars = [4, 5, 3, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5, 4];

function buildInitialRound() {
  return Array.from({ length: 18 }, (_, i) => ({
    hole: i + 1,
    par: holePars[i],
    score: holePars[i] + 1,
    saved: i < 4,
    tee: i === 1 ? ["Miss right"] : i === 3 ? ["Fairway hit"] : [],
    approach: i === 1 || i === 2 ? ["Miss short"] : i === 3 ? ["Green hit"] : [],
    aroundGreen: i === 2 ? ["Poor chip"] : [],
    putting: i === 0 ? ["2-putt"] : i === 1 ? ["3-putt"] : [],
  }));
}

function analyseRound(round) {
  const saved = round.filter((h) => h.saved);
  const sample = saved.length ? saved : round.slice(0, 4);

  const shortApproaches = sample.filter((h) => h.approach.includes("Miss short")).length;
  const teeMissRight = sample.filter((h) => h.tee.includes("Miss right")).length;
  const penalties = sample.filter((h) => h.tee.includes("Penalty") || h.aroundGreen.includes("Bunker miss")).length;
  const threePutts = sample.filter((h) => h.putting.includes("3-putt")).length;
  const poorChips = sample.filter((h) => h.aroundGreen.includes("Poor chip")).length;
  const completedFront = sample.filter((h) => h.hole <= 9).length;
  const frontNineDrops = sample.filter((h) => h.hole <= 3 && h.score > h.par + 1).length;

  const insights = [];

  if (shortApproaches >= 2) {
    insights.push({
      title: "Approach pattern",
      detail: "Most missed greens came from approaches finishing short.",
      source: `Based on ${sample.length} logged holes`,
      action: "Club up and aim for the middle of the green.",
      confidence: "Strong pattern",
    });
  }

  if (teeMissRight >= 1 || penalties >= 1) {
    insights.push({
      title: "Tee-shot risk",
      detail: "Right-side misses are creating recovery shots and bringing doubles into play.",
      source: `Seen across your saved holes`,
      action: "Use a safer club when trouble sits right.",
      confidence: "Worth watching",
    });
  }

  if (threePutts >= 1) {
    insights.push({
      title: "Putting distance control",
      detail: "The biggest putting risk is leaving yourself too much work from the first putt.",
      source: "Observed from post-hole putting tags",
      action: "Lag first putts into a 3ft circle.",
      confidence: "Early signal",
    });
  }

  if (poorChips >= 1) {
    insights.push({
      title: "Around the green",
      detail: "Short-game mistakes are turning missed greens into dropped shots.",
      source: "Based on your around-green tags",
      action: "Get the first chip on the green before chasing the flag.",
      confidence: "Early signal",
    });
  }

  if (frontNineDrops >= 1 || completedFront >= 3) {
    insights.push({
      title: "Opening holes",
      detail: "Your early holes need a steadier start and fewer aggressive choices.",
      source: "Based on your first few logged holes",
      action: "Play the first three holes with the safest target in mind.",
      confidence: "Recurring phase to track",
    });
  }

  if (!insights.length) {
    insights.push({
      title: "Course management",
      detail: "No major leak stands out yet. Keep logging to build a clearer pattern.",
      source: "Based on the holes saved so far",
      action: "Choose the shot that removes the worst miss.",
      confidence: "Needs more rounds",
    });
  }

  return insights.slice(0, 3);
}

function Icon({ symbol, size = 18, className = "" }) {
  return (
    <span className={`inline-flex items-center justify-center leading-none ${className}`} style={{ width: size, height: size, fontSize: size * 0.9 }} aria-hidden="true">
      {symbol}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", className = "" }) {
  const base = "inline-flex min-h-[54px] items-center justify-center rounded-2xl px-4 py-3 font-semibold transition active:scale-[0.98]";
  const style = variant === "outline" ? "border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50" : "bg-zinc-950 text-white hover:bg-zinc-800";
  return <button type="button" onClick={onClick} className={`${base} ${style} ${className}`}>{children}</button>;
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-zinc-100 bg-white shadow-sm ${className}`}>{children}</div>;
}

function Pill({ children, active = false, onClick }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-full px-3 py-2 text-sm transition active:scale-[0.98] ${active ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-700"}`}>
      {children}
    </button>
  );
}

function PhoneShell({ children }) {
  return (
    <div className="mx-auto flex min-h-screen w-full items-center justify-center bg-zinc-100 p-4">
      <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[46px] border-[10px] border-zinc-900 bg-white shadow-2xl">
        <div className="absolute left-1/2 top-0 z-20 h-7 w-36 -translate-x-1/2 rounded-b-3xl bg-zinc-900" />
        <div className="h-full overflow-hidden bg-white pt-8">{children}</div>
      </div>
    </div>
  );
}

function Header({ title, subtitle, onBack, showBack = true }) {
  return (
    <div className="sticky top-0 z-10 border-b border-zinc-100 bg-white/90 px-5 pb-3 pt-4 backdrop-blur">
      <div className="flex items-center gap-3">
        {showBack ? <button type="button" onClick={onBack} className="rounded-full bg-zinc-100 p-2 active:scale-[0.98]"><Icon symbol="‹" size={20} /></button> : <div className="h-9 w-9" />}
        <div>
          <h1 className="text-lg font-semibold text-zinc-950">{title}</h1>
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function BottomNav({ go }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-zinc-100 bg-white px-4 pb-6 pt-2">
      <div className="grid grid-cols-5 gap-2 text-xs">
        <button type="button" onClick={() => go("home")} className="flex flex-col items-center gap-1 rounded-2xl p-2 text-zinc-600"><Icon symbol="⛳" size={18} /> Home</button>
        <button type="button" onClick={() => go("ready_to_play")} className="flex flex-col items-center gap-1 rounded-2xl p-2 text-zinc-600"><Icon symbol="◌" size={18} /> Ready</button>
        <button type="button" onClick={() => go("round_capture")} className="flex flex-col items-center gap-1 rounded-2xl p-2 text-zinc-600"><Icon symbol="＋" size={18} /> Round</button>
        <button type="button" onClick={() => go("next_plan")} className="flex flex-col items-center gap-1 rounded-2xl p-2 text-zinc-600"><Icon symbol="◎" size={18} /> Plan</button>
        <button type="button" onClick={() => go("practice")} className="flex flex-col items-center gap-1 rounded-2xl p-2 text-zinc-600"><Icon symbol="◉" size={18} /> Practice</button>
      </div>
    </div>
  );
}

function Welcome({ go }) {
  return (
    <div className="flex h-full flex-col justify-between p-6 pb-8">
      <div className="pt-14">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-950 text-white"><Icon symbol="⛳" size={30} /></div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950">Sugar Caddie</h1>
        <p className="mt-4 text-lg leading-7 text-zinc-600">An easier way to track a round, spot patterns and play the next one with a clearer plan.</p>
      </div>
      <div className="space-y-3">
        <Card><div className="space-y-3 p-4 text-sm text-zinc-700"><div className="flex gap-3"><Icon symbol="✓" size={18} /> Simple post-hole tracking</div><div className="flex gap-3"><Icon symbol="✓" size={18} /> Clear insight from your playing patterns</div><div className="flex gap-3"><Icon symbol="✓" size={18} /> Practice that transfers to the course</div></div></Card>
        <Button onClick={() => go("profile")} className="h-14 w-full text-base">Get started</Button>
      </div>
    </div>
  );
}

function Profile({ go, back }) {
  const [hcp, setHcp] = useState(14);
  const [goal, setGoal] = useState("Break 80");
  return (
    <div className="h-full">
      <Header title="Your golfer profile" subtitle="A quick setup so advice feels relevant." onBack={back} />
      <div className="space-y-6 p-5">
        <Card><div className="p-5"><p className="text-sm font-medium text-zinc-500">Current handicap</p><div className="mt-4 flex items-center justify-between"><button type="button" onClick={() => setHcp(Math.max(1, hcp - 1))} className="rounded-full bg-zinc-100 p-3"><Icon symbol="−" size={18} /></button><div className="text-6xl font-bold tracking-tight">{hcp}</div><button type="button" onClick={() => setHcp(hcp + 1)} className="rounded-full bg-zinc-100 p-3"><Icon symbol="+" size={18} /></button></div></div></Card>
        <div><p className="mb-3 text-sm font-medium text-zinc-500">Main goal</p><div className="flex flex-wrap gap-2">{["Break 90", "Break 85", "Break 80", "Single figures"].map((x) => <Pill key={x} active={goal === x} onClick={() => setGoal(x)}>{x}</Pill>)}</div></div>
        <Button onClick={() => go("home")} className="h-14 w-full text-base">Continue</Button>
      </div>
    </div>
  );
}

function Home({ go }) {
  return (
    <div className="h-full pb-24">
      <Header title="Today" subtitle="Get ready, play, then review what mattered." showBack={false} />
      <div className="space-y-5 p-5">
        <div className="rounded-[2rem] bg-zinc-950 p-6 text-white"><p className="text-sm opacity-70">Before you tee off</p><h2 className="mt-2 text-3xl font-bold">Ready to Play</h2><p className="mt-3 text-sm leading-6 text-zinc-300">A short warm-up to loosen up, find rhythm and settle your first tee focus.</p><button type="button" onClick={() => go("ready_to_play")} className="mt-5 h-12 rounded-2xl bg-white px-5 font-semibold text-black">Start prep</button></div>
        <Card><div className="p-5"><h3 className="font-semibold">How better rounds are built</h3><p className="mt-2 text-sm leading-6 text-zinc-500">A simple rhythm that helps you learn from each round and carry improvements into the next one.</p><div className="mt-5 flex items-center justify-between gap-2 text-center"><div className="flex-1"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">1</div><p className="mt-2 text-xs font-medium text-zinc-600">Play</p></div><div className="h-px flex-1 bg-zinc-200" /><div className="flex-1"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">2</div><p className="mt-2 text-xs font-medium text-zinc-600">Review</p></div><div className="h-px flex-1 bg-zinc-200" /><div className="flex-1"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">3</div><p className="mt-2 text-xs font-medium text-zinc-600">Practise</p></div><div className="h-px flex-1 bg-zinc-200" /><div className="flex-1"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold text-zinc-700">4</div><p className="mt-2 text-xs font-medium text-zinc-600">Improve</p></div></div></div></Card>
        <Button onClick={() => go("round_capture")} className="h-14 w-full text-base">Start round capture</Button>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function ReadyToPlay({ go, back }) {
  const moves = ["Shoulder turns", "Hip openers", "Hamstring sweep", "Wrist circles", "Three easy swings"];
  return (
    <div className="h-full pb-24">
      <Header title="Ready to Play" subtitle="Four minutes. Calm body, clear first tee." onBack={back} />
      <div className="space-y-4 p-5">
        <div className="rounded-[2rem] bg-zinc-950 p-6 text-white"><p className="text-sm opacity-70">First tee reset</p><h2 className="mt-2 text-3xl font-bold">Loosen up and find rhythm</h2><p className="mt-3 text-sm leading-6 text-zinc-300">Simple movements you can do by the car park or practice green.</p><p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-xs leading-5 text-zinc-200">Better starts usually lead to steadier opening holes.</p></div>
        {moves.map((m, i) => <Card key={m}><div className="flex items-center gap-4 p-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-950 text-white text-sm">{i + 1}</div><div><p className="font-semibold">{m}</p><p className="text-sm text-zinc-500">30–45 seconds. Smooth and easy.</p></div></div></Card>)}
        <Card><div className="p-5"><p className="text-sm font-medium text-zinc-500">First tee focus</p><p className="mt-2 text-lg font-semibold">Pick a safe target. Commit to one smooth swing.</p></div></Card>
        <Button onClick={() => go("round_capture")} className="h-14 w-full text-base">Start round</Button>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function HoleGrid({ round, selectedHole, setSelectedHole }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {round.map((h, index) => {
        const active = index === selectedHole;
        return (
          <button
            key={h.hole}
            type="button"
            onClick={() => {
              setSelectedHole(index);
              window.requestAnimationFrame(() => {
                const event = new CustomEvent("openHoleDetail");
                window.dispatchEvent(event);
              });
            }}
            className={`rounded-2xl px-2 py-3 text-center text-sm transition active:scale-[0.98] ${
              active
                ? "bg-zinc-950 text-white"
                : h.saved
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-zinc-100 text-zinc-500"
            }`}
          >
            <div className="font-semibold">{h.hole}</div>
            <div className="mt-1 text-[10px]">
              {h.saved ? "Saved" : active ? "Now" : ""}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function RoundCapture({ go, back, round, selectedHole, setSelectedHole, lastSaved }) {
  React.useEffect(() => {
    const handler = () => go("hole_detail");
    window.addEventListener("openHoleDetail", handler);
    return () => window.removeEventListener("openHoleDetail", handler);
  }, [go]);
  const completed = round.filter((h) => h.saved).length;
  const current = round[selectedHole];
  return (
    <div className="h-full pb-24">
      <Header title="Round capture" subtitle="Simple post-hole tracking" onBack={back} />
      <div className="space-y-4 p-5">
        {lastSaved && <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">Hole {lastSaved} saved. Ready for the next one.</div>}
        <Card><div className="p-5"><div className="mb-3 flex items-center justify-between"><div><p className="text-xs text-zinc-500">Current hole</p><p className="text-3xl font-bold">Hole {current.hole}</p></div><div className="rounded-full bg-zinc-100 px-3 py-2 text-sm">Par {current.par}</div></div><div className="h-2 rounded-full bg-zinc-100"><div className="h-2 rounded-full bg-zinc-950" style={{ width: `${(completed / 18) * 100}%` }} /></div><p className="mt-2 text-xs text-zinc-500">{completed} of 18 holes saved</p></div></Card>
        <HoleGrid round={round} selectedHole={selectedHole} setSelectedHole={setSelectedHole} />
        <div className="rounded-2xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
          Most golfers log each hole walking to the next tee.
        </div>
        <Button onClick={() => go("round_summary")} className="h-14 w-full text-base">Finish and review</Button>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function TagSection({ title, hint, options, selected, onToggle }) {
  return <Card><div className="p-4"><div className="mb-3"><p className="font-semibold">{title}</p><p className="text-xs text-zinc-500">{hint}</p></div><div className="flex flex-wrap gap-2">{options.map((x) => <Pill key={x} active={selected.includes(x)} onClick={() => onToggle(x)}>{x}</Pill>)}</div></div></Card>;
}

function HoleDetail({ go, back, round, setRound, selectedHole, setSelectedHole, setLastSaved }) {
  const hole = round[selectedHole];
  const updateHole = (patch) => setRound((prev) => prev.map((h, i) => i === selectedHole ? { ...h, ...patch } : h));
  const toggle = (section, tag) => updateHole({ [section]: hole[section].includes(tag) ? hole[section].filter((x) => x !== tag) : [...hole[section], tag] });
  const save = () => {
    updateHole({ saved: true });
    setLastSaved(hole.hole);
    setSelectedHole(Math.min(selectedHole + 1, 17));
    go("round_capture");
  };
  return (
    <div className="h-full pb-6">
      <Header title={`Hole ${hole.hole}`} subtitle={`Par ${hole.par} · Quick round capture`} onBack={back} />
      <div className="h-[730px] space-y-4 overflow-y-auto p-5">
        <Card><div className="p-5"><p className="text-sm font-medium text-zinc-500">Score</p><div className="mt-4 flex items-center justify-between"><button type="button" onClick={() => updateHole({ score: Math.max(1, hole.score - 1) })} className="rounded-full bg-zinc-100 p-3"><Icon symbol="−" size={18} /></button><div className="text-6xl font-bold tracking-tight">{hole.score}</div><button type="button" onClick={() => updateHole({ score: hole.score + 1 })} className="rounded-full bg-zinc-100 p-3"><Icon symbol="+" size={18} /></button></div></div></Card>
        <TagSection title="Tee shot" hint="Only the first shot on par 4s and par 5s." options={["Fairway hit", "Miss left", "Miss right", "Penalty", "Recovery shot"]} selected={hole.tee} onToggle={(tag) => toggle("tee", tag)} />
        <TagSection title="Approach" hint="The shot into the green." options={["Green hit", "Miss short", "Miss left", "Miss right", "Miss long"]} selected={hole.approach} onToggle={(tag) => toggle("approach", tag)} />
        <TagSection title="Around green" hint="Only if you missed the green." options={["Up and down", "Poor chip", "Bunker miss", "Good recovery"]} selected={hole.aroundGreen} onToggle={(tag) => toggle("aroundGreen", tag)} />
        <TagSection title="Putting" hint="What happened once you reached the green." options={["1-putt", "2-putt", "3-putt"]} selected={hole.putting} onToggle={(tag) => toggle("putting", tag)} />
        <Button onClick={save} className="min-h-[56px] w-full text-base">Save hole and continue</Button>
      </div>
    </div>
  );
}

function RoundSummary({ go, back, round }) {
  const insights = analyseRound(round);
  const saved = round.filter((h) => h.saved).length;
  return (
    <div className="h-full pb-24">
      <Header title="Round review" subtitle="Clear patterns from your saved holes." onBack={back} />
      <div className="space-y-4 p-5">
        <div className="rounded-[2rem] bg-zinc-950 p-6 text-white"><p className="text-sm opacity-70">Round reflection</p><h2 className="mt-2 text-3xl font-bold">You were closer than the score suggests</h2><p className="mt-3 text-sm leading-6 text-zinc-300">Most dropped shots came from one recurring pattern rather than your whole game breaking down.</p><p className="mt-4 rounded-full bg-white/10 px-3 py-2 text-xs">{insights[0].source}</p></div>
        <Card><div className="p-5"><div className="mb-2 flex items-center justify-between gap-3"><p className="font-semibold">What stayed solid</p><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Positive trend</span></div><p className="text-sm leading-6 text-zinc-600">Your putting stayed steady and avoided extra damage once you reached the green.</p><p className="mt-3 text-xs font-medium text-zinc-500">Based on your saved holes</p></div></Card>
        {insights.map((item) => <Card key={item.title}><div className="p-5"><div className="mb-2 flex items-center justify-between gap-3"><p className="font-semibold">{item.title}</p><span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">{item.confidence}</span></div><p className="text-sm leading-6 text-zinc-600">{item.detail}</p><p className="mt-3 text-xs font-medium text-zinc-500">{item.source}</p></div></Card>)}
        <Card><div className="p-5"><p className="text-sm font-medium text-zinc-500">Credibility note</p><p className="mt-2 text-sm leading-6 text-zinc-600">Your plan is based on repeated behaviours you logged during the round, not generic tips. More rounds will make the pattern clearer.</p></div></Card>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => go("next_plan")} className="h-14 text-base">Next Round Plan</Button>
          <Button onClick={() => go("practice")} variant="outline" className="h-14 text-base">Practice ideas</Button>
        </div>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function PlanCard({ number, title, body, evidence }) {
  return <Card><div className="flex gap-4 p-5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-sm font-bold text-white">{number}</div><div><h3 className="font-semibold text-zinc-950">{title}</h3><p className="mt-1 text-sm leading-6 text-zinc-600">{body}</p><p className="mt-3 text-xs font-medium text-zinc-500">{evidence}</p></div></div></Card>;
}

function NextPlan({ go, back, round }) {
  const insights = analyseRound(round);
  const main = insights[0];
  return (
    <div className="h-full pb-24">
      <Header title="Next Round Plan" subtitle="Three simple rules to take to the course." onBack={back} />
      <div className="space-y-4 p-5">
        <PlanCard number="1" title={main.action} body="Use this as your main playing rule next round. Keep it simple and repeat it before each relevant shot." evidence={main.source} />
        <PlanCard number="2" title="Play the first three holes safely" body="Start steady. Pick targets that remove the worst miss and avoid chasing early birdies." evidence="Your opening holes are now being tracked as a round phase." />
        <PlanCard number="3" title="Protect against doubles" body="A bogey after a poor shot is fine. The scorecard damage comes from forcing the next one." evidence="This is the fastest improvement route for most mid-handicap golfers." />
        <div className="grid grid-cols-2 gap-3"><Button onClick={() => go("in_round")} className="h-14 text-base"><span className="mr-2">▶</span>Start round</Button><Button onClick={() => go("practice")} variant="outline" className="h-14 text-base"><span className="mr-2">◉</span>Practise</Button></div>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function InRound({ go, back, round }) {
  const insight = analyseRound(round)[0];
  return (
    <div className="h-full pb-24">
      <Header title="Hole 4" subtitle="Smart prompt · based on your plan" onBack={back} />
      <div className="space-y-4 p-5">
        <div className="rounded-[2rem] bg-zinc-950 p-6 text-white"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><Icon symbol="!" size={24} /></div><p className="text-sm opacity-70">Before you hit</p><h2 className="mt-2 text-3xl font-bold">{insight.action}</h2><p className="mt-3 text-sm leading-6 text-zinc-300">{insight.detail}</p></div>
        <Card><div className="p-5"><p className="text-sm font-medium text-zinc-500">Why this prompt appears</p><p className="mt-2 text-sm leading-6 text-zinc-600">{insight.source}. This prompt only appears when it connects to your current plan.</p></div></Card>
        <Button onClick={() => go("round_capture")} className="h-14 w-full text-base">Log this hole</Button>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function Drill({ title, body }) {
  return <Card><div className="flex gap-4 p-5"><Icon symbol="✓" size={22} /><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm leading-6 text-zinc-600">{body}</p></div></div></Card>;
}

function Practice({ go, back, round }) {
  const insight = analyseRound(round)[0];
  return (
    <div className="h-full pb-24">
      <Header title="Practice plan" subtitle="Short, practical and built for your next round." onBack={back} />
      <div className="space-y-4 p-5">
        <div className="rounded-[2rem] bg-zinc-950 p-6 text-white"><p className="text-sm opacity-70">Primary focus</p><h2 className="mt-2 text-3xl font-bold">{insight.title}</h2><p className="mt-3 text-sm leading-6 text-zinc-300">{insight.action}</p></div>
        <Drill title="Start Here · 10 mins" body="Hit 15 balls from 100–150 yards using one extra club. Focus only on solid contact and finishing pin-high, not attacking flags." />
        <Drill title="Pressure Practice · 15 mins" body="Create a fairway-width target on the range. Hit 10 drives or hybrids and score one point every time the ball finishes inside your target zone." />
        <Drill title="Take It To The Course · 10 mins" body="Finish with 9 random golf shots. Change club and target every ball. Step back each time and rehearse your full on-course routine before swinging." />
        <Button onClick={() => go("progress")} className="h-14 w-full text-base">Mark practice complete</Button>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function Progress({ go, back }) {
  return (
    <div className="h-full pb-24">
      <Header title="Progress" subtitle="Simple trends. No stats overload." onBack={back} />
      <div className="space-y-4 p-5">
        <div className="rounded-[2rem] bg-zinc-950 p-6 text-white"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10"><Icon symbol="★" size={24} /></div><p className="text-sm opacity-70">Current pattern</p><h2 className="mt-2 text-3xl font-bold">Approach misses are reducing</h2><p className="mt-3 text-sm text-zinc-300">Your short/right approach pattern has softened over the last three logged rounds.</p></div>
        <Card><div className="p-5"><h3 className="font-semibold">Trend confidence</h3><div className="mt-5 space-y-4">{[["Round 1", "Short/right misses", "High"], ["Round 2", "Fewer short misses", "Improving"], ["Round 3", "More greens hit", "Stronger"]].map(([r, label, status]) => <div key={r} className="flex items-center justify-between rounded-2xl bg-zinc-50 p-3"><div><p className="font-medium">{r}</p><p className="text-sm text-zinc-500">{label}</p></div><span className="rounded-full bg-white px-3 py-1 text-xs text-zinc-600">{status}</span></div>)}</div></div></Card>
        <Button onClick={() => go("next_plan")} className="h-14 w-full text-base">View updated plan</Button>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

export default function SmartCaddiePrototype() {
  const [screen, setScreen] = useState("welcome");
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(buildInitialRound);
  const [selectedHole, setSelectedHole] = useState(4);
  const [lastSaved, setLastSaved] = useState(null);

  const go = (next) => {
    if (!screens.includes(next)) return;
    setHistory((h) => [...h, screen]);
    setScreen(next);
  };

  const back = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const next = h[h.length - 1];
      setScreen(next);
      return h.slice(0, -1);
    });
  };

  const current = useMemo(() => {
    const props = { go, back, round, setRound, selectedHole, setSelectedHole, lastSaved, setLastSaved };
    switch (screen) {
      case "welcome": return <Welcome {...props} />;
      case "profile": return <Profile {...props} />;
      case "home": return <Home {...props} />;
      case "ready_to_play": return <ReadyToPlay {...props} />;
      case "round_capture": return <RoundCapture {...props} />;
      case "hole_detail": return <HoleDetail {...props} />;
      case "round_summary": return <RoundSummary {...props} />;
      case "next_plan": return <NextPlan {...props} />;
      case "in_round": return <InRound {...props} />;
      case "practice": return <Practice {...props} />;
      case "progress": return <Progress {...props} />;
      default: return <Welcome {...props} />;
    }
  }, [screen, history, round, selectedHole, lastSaved]);

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="fixed left-4 top-4 z-50 hidden w-64 rounded-3xl bg-white p-4 shadow-xl lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">V2 clickable flow</p>
        <div className="space-y-1">{screens.map((s) => <button key={s} type="button" onClick={() => setScreen(s)} className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${screen === s ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>{screenLabels[s]}</button>)}</div>
      </div>
      <PhoneShell>{current}</PhoneShell>
    </div>
  );
}
