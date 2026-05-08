import React, { useMemo, useState } from "react";

const brand = {
  deepTeal: "#0F3D3A",
  mint: "#1FA78A",
  softMint: "#7EDBB4",
  paleMint: "#E8F5EF",
  offWhite: "#F7F7F4",
};

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
  round_summary: "Round review",
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
      source: "Seen across your saved holes",
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

function LogoMark({ size = 142 }) {
  return (
    <div className="relative mx-auto flex items-center justify-center" style={{ width: size, height: size * 0.9 }}>
      <div
        className="absolute rounded-full border-[10px]"
        style={{
          width: size * 1.35,
          height: size * 0.34,
          borderColor: brand.softMint,
          borderLeftColor: brand.mint,
          borderRightColor: brand.mint,
          transform: "rotate(-6deg)",
          opacity: 0.95,
        }}
      />
      <div
        className="absolute z-10"
        style={{
          width: size * 0.2,
          height: size * 0.42,
          background: `linear-gradient(180deg, ${brand.deepTeal}, #082d2b)`,
          top: size * 0.42,
          clipPath: "polygon(18% 0, 82% 0, 62% 100%, 38% 100%)",
        }}
      />
      <div
        className="relative z-20 flex items-center justify-center rounded-full border shadow-sm"
        style={{
          width: size * 0.52,
          height: size * 0.52,
          background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #f5f5f3 42%, #d8dad8 100%)",
          borderColor: "#d6d6d3",
        }}
      >
        <div className="grid grid-cols-4 gap-1 opacity-35">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="block rounded-full bg-zinc-500" style={{ width: 5 + (i % 3), height: 5 + (i % 3) }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-8 w-10">
        <div className="absolute left-0 top-3 h-3 w-10 rounded-full border-2" style={{ borderColor: brand.softMint, transform: "rotate(-8deg)" }} />
        <div className="absolute left-[15px] top-[14px] h-4 w-2" style={{ background: brand.deepTeal, clipPath: "polygon(15% 0, 85% 0, 62% 100%, 38% 100%)" }} />
        <div className="absolute left-[12px] top-0 h-5 w-5 rounded-full border bg-white" style={{ borderColor: "#d6d6d3" }} />
      </div>
      <span className="text-sm font-bold" style={{ color: brand.deepTeal }}>SugarCaddy</span>
    </div>
  );
}

function FeatureIcon({ symbol }) {
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full" style={{ background: brand.paleMint, color: brand.mint }}>
      <span className="text-3xl font-semibold">{symbol}</span>
    </div>
  );
}

function Icon({ symbol, size = 18, className = "" }) {
  return (
    <span className={`inline-flex items-center justify-center leading-none ${className}`} style={{ width: size, height: size, fontSize: size * 0.9 }} aria-hidden="true">
      {symbol}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", className = "" }) {
  const base = "inline-flex h-14 items-center justify-center rounded-2xl px-4 font-semibold transition active:scale-[0.98]";
  const style = variant === "outline" ? "border bg-white hover:bg-[#F7F7F4]" : "text-white shadow-sm";
  const inlineStyle = variant === "outline"
    ? { borderColor: brand.deepTeal, color: brand.deepTeal }
    : { background: `linear-gradient(135deg, ${brand.mint}, #168d77)` };

  return (
    <button type="button" onClick={onClick} className={`${base} ${style} ${className}`} style={inlineStyle}>
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border bg-white/95 shadow-sm ${className}`} style={{ borderColor: "rgba(126, 219, 180, 0.22)" }}>
      {children}
    </div>
  );
}

function Pill({ children, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-3 py-2 text-sm transition active:scale-[0.98]"
      style={{
        background: active ? brand.deepTeal : brand.offWhite,
        color: active ? "white" : "rgba(15,61,58,0.78)",
        border: active ? "1px solid transparent" : "1px solid rgba(126,219,180,0.25)",
      }}
    >
      {children}
    </button>
  );
}

function PhoneShell({ children }) {
  return (
    <div className="mx-auto flex min-h-screen w-full items-center justify-center p-4" style={{ background: brand.paleMint }}>
      <div className="relative h-[844px] w-[390px] overflow-hidden rounded-[46px] border-[10px] border-zinc-900 bg-white shadow-2xl">
        <div className="absolute left-1/2 top-0 z-20 h-7 w-36 -translate-x-1/2 rounded-b-3xl bg-zinc-900" />
        <div
          className="h-full overflow-hidden pt-8"
          style={{ background: `linear-gradient(180deg, #ffffff 0%, ${brand.offWhite} 70%, ${brand.paleMint} 100%)` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Header({ title, subtitle, onBack, showBack = true }) {
  return (
    <div className="sticky top-0 z-10 border-b bg-white/90 px-5 pb-3 pt-4 backdrop-blur" style={{ borderColor: "rgba(126,219,180,0.2)" }}>
      <div className="flex items-center gap-3">
        {showBack ? (
          <button type="button" onClick={onBack} className="rounded-full p-2 active:scale-[0.98]" style={{ background: brand.paleMint, color: brand.deepTeal }}>
            <Icon symbol="‹" size={20} />
          </button>
        ) : (
          <div className="h-9 w-9" />
        )}
        <div>
          <h1 className="text-lg font-semibold" style={{ color: brand.deepTeal }}>{title}</h1>
          {subtitle && <p className="text-xs" style={{ color: "rgba(15,61,58,0.58)" }}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function BottomNav({ go }) {
  const items = [
    ["home", "⛳", "Home"],
    ["ready_to_play", "◌", "Ready"],
    ["round_capture", "＋", "Round"],
    ["next_plan", "◎", "Plan"],
    ["practice", "◉", "Practice"],
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t bg-white/95 px-4 pb-6 pt-2 backdrop-blur" style={{ borderColor: "rgba(126,219,180,0.22)" }}>
      <div className="grid grid-cols-5 gap-2 text-xs">
        {items.map(([target, symbol, label]) => (
          <button key={target} type="button" onClick={() => go(target)} className="flex flex-col items-center gap-1 rounded-2xl p-2" style={{ color: "rgba(15,61,58,0.72)" }}>
            <Icon symbol={symbol} size={18} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Welcome({ go }) {
  return (
    <div
      className="relative flex h-full flex-col justify-between overflow-hidden px-7 pb-8 pt-12"
      style={{ background: `linear-gradient(180deg, #ffffff 0%, ${brand.offWhite} 58%, ${brand.paleMint} 100%)` }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-24 h-72 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 20% 30%, rgba(31,167,138,0.10), transparent 42%), radial-gradient(ellipse at 80% 20%, rgba(126,219,180,0.14), transparent 44%)",
        }}
      />

      <div className="relative z-10 pt-1 text-center">
        <LogoMark size={142} />
        <h1 className="mt-2 text-5xl font-extrabold tracking-tight" style={{ color: brand.deepTeal }}>
          SugarCaddy
        </h1>
        <p className="mx-auto mt-8 max-w-[330px] text-center text-[1.68rem] font-medium leading-[1.45]" style={{ color: brand.deepTeal }}>
          An easier way to <span style={{ color: brand.mint }} className="font-extrabold">track your round</span>,
          <br />
          <span style={{ color: brand.mint }} className="font-extrabold">spot patterns</span> and play your next round with a <span style={{ color: brand.mint }} className="font-extrabold">clearer plan</span>.
        </p>
      </div>

      <div className="relative z-10 space-y-6">
        <Card className="overflow-hidden rounded-[2rem] border-white/80 bg-white/95 shadow-xl">
          <div className="divide-y divide-zinc-100 p-5">
            <div className="flex items-center gap-5 py-2">
              <FeatureIcon symbol="✓" />
              <div>
                <p className="text-lg font-bold" style={{ color: brand.deepTeal }}>Simple post-hole tracking</p>
                <p className="mt-1 text-sm text-zinc-500">Quick to use. Built for your game.</p>
              </div>
            </div>
            <div className="flex items-center gap-5 py-5">
              <FeatureIcon symbol="▥" />
              <div>
                <p className="text-lg font-bold" style={{ color: brand.deepTeal }}>Clear insight from your patterns</p>
                <p className="mt-1 text-sm text-zinc-500">See what’s working and what’s not.</p>
              </div>
            </div>
            <div className="flex items-center gap-5 pt-5">
              <FeatureIcon symbol="◎" />
              <div>
                <p className="text-lg font-bold" style={{ color: brand.deepTeal }}>Practice that transfers to the course</p>
                <p className="mt-1 text-sm text-zinc-500">Build better habits. Play better golf.</p>
              </div>
            </div>
          </div>
        </Card>

        <button
          type="button"
          onClick={() => go("profile")}
          className="flex h-16 w-full items-center justify-center rounded-3xl text-xl font-bold text-white shadow-lg transition active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg, ${brand.mint}, #168d77)` }}
        >
          Get started <span className="ml-3 text-3xl">→</span>
        </button>
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
        <MiniLogo />
        <Card>
          <div className="p-5">
            <p className="text-sm font-medium" style={{ color: "rgba(15,61,58,0.62)" }}>Current handicap</p>
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => setHcp(Math.max(1, hcp - 1))} className="rounded-full p-3" style={{ background: brand.paleMint, color: brand.deepTeal }}>
                <Icon symbol="−" size={18} />
              </button>
              <div className="text-6xl font-bold tracking-tight" style={{ color: brand.deepTeal }}>{hcp}</div>
              <button type="button" onClick={() => setHcp(hcp + 1)} className="rounded-full p-3" style={{ background: brand.paleMint, color: brand.deepTeal }}>
                <Icon symbol="+" size={18} />
              </button>
            </div>
          </div>
        </Card>
        <div>
          <p className="mb-3 text-sm font-medium" style={{ color: "rgba(15,61,58,0.62)" }}>Main goal</p>
          <div className="flex flex-wrap gap-2">
            {["Break 90", "Break 85", "Break 80", "Single figures"].map((x) => (
              <Pill key={x} active={goal === x} onClick={() => setGoal(x)}>{x}</Pill>
            ))}
          </div>
        </div>
        <Button onClick={() => go("home")} className="w-full text-base">Continue</Button>
      </div>
    </div>
  );
}

function Home({ go }) {
  return (
    <div className="h-full pb-24">
      <Header title="Today" subtitle="Get ready, play, then review what mattered." showBack={false} />
      <div className="space-y-5 p-5">
        <MiniLogo />
        <div className="rounded-[2rem] p-6 text-white shadow-lg" style={{ background: `linear-gradient(145deg, ${brand.deepTeal}, #082d2b)` }}>
          <p className="text-sm opacity-75">Before you tee off</p>
          <h2 className="mt-2 text-3xl font-bold">Ready to Play</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-200">A short warm-up to loosen up, find rhythm and settle your first tee focus.</p>
          <button type="button" onClick={() => go("ready_to_play")} className="mt-5 h-12 rounded-2xl bg-white px-5 font-semibold" style={{ color: brand.deepTeal }}>
            Start prep
          </button>
        </div>

        <Card>
          <div className="p-5">
            <h3 className="font-semibold" style={{ color: brand.deepTeal }}>How better rounds are built</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: "rgba(15,61,58,0.62)" }}>
              A simple rhythm that helps you learn from each round and carry improvements into the next one.
            </p>
            <div className="mt-5 flex items-center justify-between gap-2 text-center">
              {["Play", "Review", "Practise", "Improve"].map((label, i) => (
                <React.Fragment key={label}>
                  <div className="flex-1">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold" style={{ background: brand.paleMint, color: brand.deepTeal }}>
                      {i + 1}
                    </div>
                    <p className="mt-2 text-xs font-medium" style={{ color: "rgba(15,61,58,0.72)" }}>{label}</p>
                  </div>
                  {i < 3 && <div className="h-px flex-1" style={{ background: "rgba(126,219,180,0.45)" }} />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </Card>
        <Button onClick={() => go("round_capture")} className="w-full text-base">Start round capture</Button>
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
        <div className="rounded-[2rem] p-6 text-white shadow-lg" style={{ background: `linear-gradient(145deg, ${brand.deepTeal}, #082d2b)` }}>
          <p className="text-sm opacity-75">First tee reset</p>
          <h2 className="mt-2 text-3xl font-bold">Loosen up and find rhythm</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-200">Simple movements you can do by the car park or practice green.</p>
          <p className="mt-4 rounded-2xl px-4 py-3 text-xs leading-5" style={{ background: "rgba(255,255,255,0.10)", color: "#E8F5EF" }}>
            Better starts usually lead to steadier opening holes.
          </p>
        </div>
        {moves.map((m, i) => (
          <Card key={m}>
            <div className="flex items-center gap-4 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white" style={{ background: brand.deepTeal }}>{i + 1}</div>
              <div>
                <p className="font-semibold" style={{ color: brand.deepTeal }}>{m}</p>
                <p className="text-sm" style={{ color: "rgba(15,61,58,0.58)" }}>30–45 seconds. Smooth and easy.</p>
              </div>
            </div>
          </Card>
        ))}
        <Card>
          <div className="p-5">
            <p className="text-sm font-medium" style={{ color: "rgba(15,61,58,0.58)" }}>First tee focus</p>
            <p className="mt-2 text-lg font-semibold" style={{ color: brand.deepTeal }}>Pick a safe target. Commit to one smooth swing.</p>
          </div>
        </Card>
        <Button onClick={() => go("round_capture")} className="w-full text-base">Start round</Button>
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
            className="rounded-2xl px-2 py-3 text-center text-sm transition active:scale-[0.98]"
            style={{
              background: active ? brand.deepTeal : h.saved ? brand.paleMint : brand.offWhite,
              color: active ? "white" : h.saved ? brand.mint : "rgba(15,61,58,0.58)",
              border: h.saved ? `1px solid ${brand.softMint}` : "1px solid rgba(126,219,180,0.18)",
            }}
          >
            <div className="font-semibold">{h.hole}</div>
            <div className="mt-1 text-[10px]">{h.saved ? "Saved" : active ? "Now" : ""}</div>
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
        {lastSaved && (
          <div className="rounded-2xl px-4 py-3 text-sm font-medium" style={{ background: brand.paleMint, color: brand.mint }}>
            Hole {lastSaved} saved. Ready for the next one.
          </div>
        )}
        <Card>
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs" style={{ color: "rgba(15,61,58,0.58)" }}>Current hole</p>
                <p className="text-3xl font-bold" style={{ color: brand.deepTeal }}>Hole {current.hole}</p>
              </div>
              <div className="rounded-full px-3 py-2 text-sm" style={{ background: brand.paleMint, color: brand.deepTeal }}>Par {current.par}</div>
            </div>
            <div className="h-2 rounded-full" style={{ background: brand.paleMint }}>
              <div className="h-2 rounded-full" style={{ width: `${(completed / 18) * 100}%`, background: brand.mint }} />
            </div>
            <p className="mt-2 text-xs" style={{ color: "rgba(15,61,58,0.58)" }}>{completed} of 18 holes saved</p>
          </div>
        </Card>
        <HoleGrid round={round} selectedHole={selectedHole} setSelectedHole={setSelectedHole} />
        <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: brand.offWhite, color: "rgba(15,61,58,0.62)" }}>
          Most golfers log each hole walking to the next tee.
        </div>
        <Button onClick={() => go("round_summary")} className="w-full text-base">Finish and review</Button>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function TagSection({ title, hint, options, selected, onToggle }) {
  return (
    <Card>
      <div className="p-4">
        <div className="mb-3">
          <p className="font-semibold" style={{ color: brand.deepTeal }}>{title}</p>
          <p className="text-xs" style={{ color: "rgba(15,61,58,0.58)" }}>{hint}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((x) => (
            <Pill key={x} active={selected.includes(x)} onClick={() => onToggle(x)}>{x}</Pill>
          ))}
        </div>
      </div>
    </Card>
  );
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
        <Card>
          <div className="p-5">
            <p className="text-sm font-medium" style={{ color: "rgba(15,61,58,0.58)" }}>Score</p>
            <div className="mt-4 flex items-center justify-between">
              <button type="button" onClick={() => updateHole({ score: Math.max(1, hole.score - 1) })} className="rounded-full p-3" style={{ background: brand.paleMint, color: brand.deepTeal }}>
                <Icon symbol="−" size={18} />
              </button>
              <div className="text-6xl font-bold tracking-tight" style={{ color: brand.deepTeal }}>{hole.score}</div>
              <button type="button" onClick={() => updateHole({ score: hole.score + 1 })} className="rounded-full p-3" style={{ background: brand.paleMint, color: brand.deepTeal }}>
                <Icon symbol="+" size={18} />
              </button>
            </div>
          </div>
        </Card>
        <TagSection title="Tee shot" hint="Only the first shot on par 4s and par 5s." options={["Fairway hit", "Miss left", "Miss right", "Penalty", "Recovery shot"]} selected={hole.tee} onToggle={(tag) => toggle("tee", tag)} />
        <TagSection title="Approach" hint="The shot into the green." options={["Green hit", "Miss short", "Miss left", "Miss right", "Miss long"]} selected={hole.approach} onToggle={(tag) => toggle("approach", tag)} />
        <TagSection title="Around green" hint="Only if you missed the green." options={["Up and down", "Poor chip", "Bunker miss", "Good recovery"]} selected={hole.aroundGreen} onToggle={(tag) => toggle("aroundGreen", tag)} />
        <TagSection title="Putting" hint="What happened once you reached the green." options={["1-putt", "2-putt", "3-putt"]} selected={hole.putting} onToggle={(tag) => toggle("putting", tag)} />
        <button
          type="button"
          onClick={save}
          className="flex w-full items-center justify-center rounded-2xl px-5 text-base font-semibold leading-none text-white shadow-sm transition active:scale-[0.98]"
          style={{ height: "56px", minHeight: "56px", background: `linear-gradient(135deg, ${brand.deepTeal}, #082d2b)` }}
        >
          Save hole and continue
        </button>
      </div>
    </div>
  );
}

function RoundSummary({ go, back, round }) {
  const insights = analyseRound(round);

  return (
    <div className="h-full pb-24">
      <Header title="Round review" subtitle="Clear patterns from your saved holes." onBack={back} />
      <div className="space-y-4 p-5">
        <div className="rounded-[2rem] p-6 text-white shadow-lg" style={{ background: `linear-gradient(145deg, ${brand.deepTeal}, #082d2b)` }}>
          <p className="text-sm opacity-75">Round reflection</p>
          <h2 className="mt-2 text-3xl font-bold">You were closer than the score suggests</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-200">Most dropped shots came from one recurring pattern rather than your whole game breaking down.</p>
          <p className="mt-4 rounded-full px-3 py-2 text-xs" style={{ background: "rgba(255,255,255,0.10)" }}>{insights[0].source}</p>
        </div>
        <Card>
          <div className="p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-semibold" style={{ color: brand.deepTeal }}>What stayed solid</p>
              <span className="rounded-full px-3 py-1 text-xs" style={{ background: brand.paleMint, color: brand.mint }}>Positive trend</span>
            </div>
            <p className="text-sm leading-6" style={{ color: "rgba(15,61,58,0.72)" }}>Your putting stayed steady and avoided extra damage once you reached the green.</p>
            <p className="mt-3 text-xs font-medium" style={{ color: "rgba(15,61,58,0.52)" }}>Based on your saved holes</p>
          </div>
        </Card>
        {insights.map((item) => (
          <Card key={item.title}>
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-semibold" style={{ color: brand.deepTeal }}>{item.title}</p>
                <span className="rounded-full px-3 py-1 text-xs" style={{ background: brand.offWhite, color: "rgba(15,61,58,0.68)" }}>{item.confidence}</span>
              </div>
              <p className="text-sm leading-6" style={{ color: "rgba(15,61,58,0.72)" }}>{item.detail}</p>
              <p className="mt-3 text-xs font-medium" style={{ color: "rgba(15,61,58,0.52)" }}>{item.source}</p>
            </div>
          </Card>
        ))}
        <Card>
          <div className="p-5">
            <p className="text-sm font-medium" style={{ color: "rgba(15,61,58,0.58)" }}>Credibility note</p>
            <p className="mt-2 text-sm leading-6" style={{ color: "rgba(15,61,58,0.72)" }}>Your plan is based on repeated behaviours you logged during the round, not generic tips. More rounds will make the pattern clearer.</p>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => go("next_plan")} className="text-base">Next Round Plan</Button>
          <Button onClick={() => go("practice")} variant="outline" className="text-base">Practice ideas</Button>
        </div>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function PlanCard({ number, title, body, evidence }) {
  return (
    <Card>
      <div className="flex gap-4 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: brand.deepTeal }}>{number}</div>
        <div>
          <h3 className="font-semibold" style={{ color: brand.deepTeal }}>{title}</h3>
          <p className="mt-1 text-sm leading-6" style={{ color: "rgba(15,61,58,0.72)" }}>{body}</p>
          <p className="mt-3 text-xs font-medium" style={{ color: "rgba(15,61,58,0.52)" }}>{evidence}</p>
        </div>
      </div>
    </Card>
  );
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
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => go("in_round")} className="text-base"><span className="mr-2">▶</span>Start round</Button>
          <Button onClick={() => go("practice")} variant="outline" className="text-base"><span className="mr-2">◉</span>Practise</Button>
        </div>
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
        <div className="rounded-[2rem] p-6 text-white shadow-lg" style={{ background: `linear-gradient(145deg, ${brand.deepTeal}, #082d2b)` }}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.10)" }}><Icon symbol="!" size={24} /></div>
          <p className="text-sm opacity-75">Before you hit</p>
          <h2 className="mt-2 text-3xl font-bold">{insight.action}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-200">{insight.detail}</p>
        </div>
        <Card>
          <div className="p-5">
            <p className="text-sm font-medium" style={{ color: "rgba(15,61,58,0.58)" }}>Why this prompt appears</p>
            <p className="mt-2 text-sm leading-6" style={{ color: "rgba(15,61,58,0.72)" }}>{insight.source}. This prompt only appears when it connects to your current plan.</p>
          </div>
        </Card>
        <Button onClick={() => go("round_capture")} className="w-full text-base">Log this hole</Button>
      </div>
      <BottomNav go={go} />
    </div>
  );
}

function Drill({ title, body }) {
  return (
    <Card>
      <div className="flex gap-4 p-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white" style={{ background: brand.mint }}>
          <Icon symbol="✓" size={18} />
        </div>
        <div>
          <p className="font-semibold" style={{ color: brand.deepTeal }}>{title}</p>
          <p className="mt-1 text-sm leading-6" style={{ color: "rgba(15,61,58,0.72)" }}>{body}</p>
        </div>
      </div>
    </Card>
  );
}

function Practice({ go, back, round }) {
  const insight = analyseRound(round)[0];

  return (
    <div className="h-full pb-24">
      <Header title="Practice plan" subtitle="Short, practical and built for your next round." onBack={back} />
      <div className="space-y-4 p-5">
        <div className="rounded-[2rem] p-6 text-white shadow-lg" style={{ background: `linear-gradient(145deg, ${brand.deepTeal}, #082d2b)` }}>
          <p className="text-sm opacity-75">Primary focus</p>
          <h2 className="mt-2 text-3xl font-bold">{insight.title}</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-200">{insight.action}</p>
        </div>
        <Drill title="Start Here · 10 mins" body="Hit 15 balls from 100–150 yards using one extra club. Focus only on solid contact and finishing pin-high, not attacking flags." />
        <Drill title="Pressure Practice · 15 mins" body="Create a fairway-width target on the range. Hit 10 drives or hybrids and score one point every time the ball finishes inside your target zone." />
        <Drill title="Take It To The Course · 10 mins" body="Finish with 9 random golf shots. Change club and target every ball. Step back each time and rehearse your full on-course routine before swinging." />
        <Button onClick={() => go("progress")} className="w-full text-base">Mark practice complete</Button>
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
        <div className="rounded-[2rem] p-6 text-white shadow-lg" style={{ background: `linear-gradient(145deg, ${brand.deepTeal}, #082d2b)` }}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.10)" }}><Icon symbol="★" size={24} /></div>
          <p className="text-sm opacity-75">Current pattern</p>
          <h2 className="mt-2 text-3xl font-bold">Approach misses are reducing</h2>
          <p className="mt-3 text-sm text-zinc-200">Your short/right approach pattern has softened over the last three logged rounds.</p>
        </div>
        <Card>
          <div className="p-5">
            <h3 className="font-semibold" style={{ color: brand.deepTeal }}>Trend confidence</h3>
            <div className="mt-5 space-y-4">
              {[["Round 1", "Short/right misses", "High"], ["Round 2", "Fewer short misses", "Improving"], ["Round 3", "More greens hit", "Stronger"]].map(([r, label, status]) => (
                <div key={r} className="flex items-center justify-between rounded-2xl p-3" style={{ background: brand.offWhite }}>
                  <div>
                    <p className="font-medium" style={{ color: brand.deepTeal }}>{r}</p>
                    <p className="text-sm" style={{ color: "rgba(15,61,58,0.58)" }}>{label}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs" style={{ color: "rgba(15,61,58,0.68)" }}>{status}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Button onClick={() => go("next_plan")} className="w-full text-base">View updated plan</Button>
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
    <div className="min-h-screen" style={{ background: brand.paleMint }}>
      <PhoneShell>{current}</PhoneShell>
    </div>
  );
}
