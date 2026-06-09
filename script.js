const state = {
  family: "surface",
  mode: "transfer",
  target: 19,
  steps: 1200,
  density: 8,
  seed: 7,
  selected: { x: 4, y: 4 },
};

const families = {
  surface: {
    sourceLabel: "d = 7",
    sourceSize: 7,
    targets: [
      { label: "d = 11", value: 11 },
      { label: "d = 15", value: 15 },
      { label: "d = 19", value: 19 },
      { label: "d = 23", value: 23 },
      { label: "d = 25", value: 25 },
    ],
    targetLabel(value) {
      return `d = ${value}`;
    },
    baseDistance: 7,
    maxStep: 5000,
  },
  bb: {
    sourceLabel: "[[72,12,6]]",
    sourceSize: 6,
    targets: [{ label: "[[144,12,12]]", value: 12 }],
    targetLabel() {
      return "[[144,12,12]]";
    },
    baseDistance: 6,
    maxStep: 5000,
  },
};

const els = {
  targetScale: document.querySelector("#target-scale"),
  sourceLabel: document.querySelector("#source-label"),
  targetLabel: document.querySelector("#target-label"),
  sourceLattice: document.querySelector("#source-lattice"),
  targetLattice: document.querySelector("#target-lattice"),
  chart: document.querySelector("#curve-chart"),
  stepSlider: document.querySelector("#step-slider"),
  noiseSlider: document.querySelector("#noise-slider"),
  stepReadout: document.querySelector("#step-readout"),
  accuracyReadout: document.querySelector("#accuracy-readout"),
  lerReadout: document.querySelector("#ler-readout"),
  computeReadout: document.querySelector("#compute-readout"),
  stateReadout: document.querySelector("#state-readout"),
  advanceBtn: document.querySelector("#advance-btn"),
  resampleBtn: document.querySelector("#resample-btn"),
  copyBibtex: document.querySelector("#copy-bibtex"),
  bibtex: document.querySelector("#bibtex"),
};

function rng(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function eventSet(size, density, seed) {
  const count = Math.max(2, Math.round((size * size * density) / 100));
  const events = new Set();
  let cursor = seed * 17 + size;
  while (events.size < count) {
    cursor += 1;
    const x = Math.floor(rng(cursor) * size);
    const y = Math.floor(rng(cursor + 81) * size);
    events.add(`${x},${y}`);
  }
  return events;
}

function motifFor(x, y, size) {
  return [
    [x, y],
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
    [x + 1, y + 1],
  ].filter(([px, py]) => px >= 0 && py >= 0 && px < size && py < size);
}

function drawLattice(svg, options) {
  const { size, family, selected, density, seed, compact } = options;
  const width = 440;
  const height = 330;
  const pad = compact ? 54 : 34;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;
  const step = Math.min(plotW, plotH) / Math.max(1, size - 1);
  const offsetX = (width - step * (size - 1)) / 2;
  const offsetY = (height - step * (size - 1)) / 2;
  const events = eventSet(size, density, seed);
  const motif = motifFor(selected.x, selected.y, size);
  const motifKeys = new Set(motif.map(([x, y]) => `${x},${y}`));
  const pointRadius = Math.max(3.2, Math.min(10, step * 0.25));

  svg.innerHTML = "";

  if (family === "bb") {
    const torus = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    torus.setAttribute("x", offsetX - 13);
    torus.setAttribute("y", offsetY - 13);
    torus.setAttribute("width", step * (size - 1) + 26);
    torus.setAttribute("height", step * (size - 1) + 26);
    torus.setAttribute("rx", 18);
    torus.setAttribute("class", "bb-plane");
    svg.appendChild(torus);
  }

  for (let i = 0; i < size; i += 1) {
    const x1 = offsetX + i * step;
    const y1 = offsetY;
    const x2 = offsetX + i * step;
    const y2 = offsetY + step * (size - 1);
    const vLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    vLine.setAttribute("x1", x1);
    vLine.setAttribute("y1", y1);
    vLine.setAttribute("x2", x2);
    vLine.setAttribute("y2", y2);
    vLine.setAttribute("class", "grid-line");
    svg.appendChild(vLine);

    const hLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    hLine.setAttribute("x1", offsetX);
    hLine.setAttribute("y1", offsetY + i * step);
    hLine.setAttribute("x2", offsetX + step * (size - 1));
    hLine.setAttribute("y2", offsetY + i * step);
    hLine.setAttribute("class", "grid-line");
    svg.appendChild(hLine);
  }

  motif.forEach(([x, y]) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", offsetX + x * step - step * 0.38);
    rect.setAttribute("y", offsetY + y * step - step * 0.38);
    rect.setAttribute("width", step * 0.76);
    rect.setAttribute("height", step * 0.76);
    rect.setAttribute("rx", 5);
    rect.setAttribute("class", "motif");
    svg.appendChild(rect);
  });

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const key = `${x},${y}`;
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", offsetX + x * step);
      c.setAttribute("cy", offsetY + y * step);
      c.setAttribute("r", motifKeys.has(key) ? pointRadius * 1.15 : pointRadius);
      c.setAttribute(
        "class",
        [
          "detector",
          events.has(key) ? "event" : "",
          selected.x === x && selected.y === y ? "selected" : "",
        ]
          .filter(Boolean)
          .join(" "),
      );
      c.addEventListener("click", () => {
        state.selected = { x, y };
        render();
      });
      svg.appendChild(c);
    }
  }

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("x", 22);
  label.setAttribute("y", 304);
  label.setAttribute("class", "chart-label");
  label.textContent =
    family === "surface" ? "local stencil: 1 + x + y + xy" : "polynomial motif: A, B offsets";
  svg.appendChild(label);
}

function transferAccuracy(step, distance, family) {
  const d = family === "bb" ? 12 : distance;
  const tau = family === "bb" ? 950 : 520 + Math.max(0, d - 11) * 34;
  const cap = family === "bb" ? 0.895 : 0.955 - Math.max(0, d - 19) * 0.012;
  return 0.5 + (cap - 0.5) * (1 - Math.exp(-step / tau));
}

function scratchAccuracy(step, distance, family) {
  const d = family === "bb" ? 12 : distance;
  const plateau = family === "bb" ? 3000 : 620 + Math.max(0, d - 11) * 285;
  const cap = family === "bb" ? 0.84 : 0.91 - Math.max(0, d - 19) * 0.018;
  if (step < plateau) {
    return 0.5 + 0.018 * Math.max(0, Math.sin(step / 180));
  }
  return 0.5 + (cap - 0.5) * (1 - Math.exp(-(step - plateau) / 820));
}

function accuracyAt(mode, step, distance, family) {
  return mode === "transfer"
    ? transferAccuracy(step, distance, family)
    : scratchAccuracy(step, distance, family);
}

function drawChart() {
  const svg = els.chart;
  const family = state.family;
  const distance = Number(state.target);
  const width = 520;
  const height = 330;
  const pad = { left: 52, right: 18, top: 22, bottom: 46 };
  const maxStep = families[family].maxStep;
  const yMin = 0.48;
  const yMax = 0.98;

  const x = (step) => pad.left + (step / maxStep) * (width - pad.left - pad.right);
  const y = (acc) => pad.top + ((yMax - acc) / (yMax - yMin)) * (height - pad.top - pad.bottom);
  const pathFor = (mode) => {
    const points = [];
    for (let s = 0; s <= maxStep; s += 100) {
      points.push(`${x(s).toFixed(1)},${y(accuracyAt(mode, s, distance, family)).toFixed(1)}`);
    }
    return points.join(" ");
  };

  svg.innerHTML = "";
  [0.5, 0.7, 0.9].forEach((tick) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", pad.left);
    line.setAttribute("y1", y(tick));
    line.setAttribute("x2", width - pad.right);
    line.setAttribute("y2", y(tick));
    line.setAttribute("class", "chart-grid");
    svg.appendChild(line);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", 12);
    label.setAttribute("y", y(tick) + 4);
    label.setAttribute("class", "chart-label");
    label.textContent = tick.toFixed(1);
    svg.appendChild(label);
  });

  const axisX = document.createElementNS("http://www.w3.org/2000/svg", "line");
  axisX.setAttribute("x1", pad.left);
  axisX.setAttribute("y1", height - pad.bottom);
  axisX.setAttribute("x2", width - pad.right);
  axisX.setAttribute("y2", height - pad.bottom);
  axisX.setAttribute("class", "chart-axis");
  svg.appendChild(axisX);

  const axisY = document.createElementNS("http://www.w3.org/2000/svg", "line");
  axisY.setAttribute("x1", pad.left);
  axisY.setAttribute("y1", pad.top);
  axisY.setAttribute("x2", pad.left);
  axisY.setAttribute("y2", height - pad.bottom);
  axisY.setAttribute("class", "chart-axis");
  svg.appendChild(axisY);

  const transfer = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  transfer.setAttribute("points", pathFor("transfer"));
  transfer.setAttribute("class", "line-transfer");
  svg.appendChild(transfer);

  const scratch = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  scratch.setAttribute("points", pathFor("scratch"));
  scratch.setAttribute("class", "line-scratch");
  svg.appendChild(scratch);

  const marker = document.createElementNS("http://www.w3.org/2000/svg", "line");
  marker.setAttribute("x1", x(state.steps));
  marker.setAttribute("y1", pad.top);
  marker.setAttribute("x2", x(state.steps));
  marker.setAttribute("y2", height - pad.bottom);
  marker.setAttribute("class", "chart-marker");
  svg.appendChild(marker);

  const labels = [
    { text: "NTU transfer", x: width - 142, y: y(transferAccuracy(maxStep, distance, family)) - 10, fill: "#16736b" },
    { text: "scratch", x: width - 92, y: y(scratchAccuracy(maxStep, distance, family)) + 20, fill: "#6555a6" },
    { text: "fine-tuning steps", x: width - 140, y: height - 12, fill: "#5e6b73" },
  ];

  labels.forEach((item) => {
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", item.x);
    label.setAttribute("y", item.y);
    label.setAttribute("class", "chart-label");
    label.setAttribute("fill", item.fill);
    label.textContent = item.text;
    svg.appendChild(label);
  });
}

function formatSci(value) {
  return value.toExponential(1).replace("+", "");
}

function updateReadouts() {
  const family = state.family;
  const distance = Number(state.target);
  const acc = accuracyAt(state.mode, state.steps, distance, family);
  const base = families[family].baseDistance;
  const gamma = state.mode === "transfer" ? 1.27 : 2.02;
  const multiplier = Math.pow(distance / base, gamma);
  const ler = Math.pow(10, -2 - Math.max(0, acc - 0.5) * 9 - Math.max(0, distance - base) / 18);

  let status = "transfer lift-off";
  if (state.mode === "scratch" && acc < 0.56) status = "cold-start plateau";
  if (state.mode === "transfer" && state.steps < 300) status = "aligned initialization";
  if (acc > 0.88) status = "boundary fine-tuning";

  els.stepReadout.textContent = `${state.steps} steps`;
  els.accuracyReadout.textContent = acc.toFixed(3);
  els.lerReadout.textContent = formatSci(ler);
  els.computeReadout.textContent = `Gamma = ${gamma.toFixed(2)} (${multiplier.toFixed(1)}x)`;
  els.stateReadout.textContent = status;
}

function populateTargets() {
  const config = families[state.family];
  els.targetScale.innerHTML = "";
  config.targets.forEach((target) => {
    const option = document.createElement("option");
    option.value = target.value;
    option.textContent = target.label;
    els.targetScale.appendChild(option);
  });
  state.target = config.targets[config.targets.length - 1].value;
  els.targetScale.value = state.target;
  state.selected = {
    x: Math.floor(state.target / 2),
    y: Math.floor(state.target / 2),
  };
}

function render() {
  const config = families[state.family];
  const sourceSize = config.sourceSize;
  const targetSize = Number(state.target);

  els.sourceLabel.textContent = config.sourceLabel;
  els.targetLabel.textContent = config.targetLabel(targetSize);

  drawLattice(els.sourceLattice, {
    size: sourceSize,
    family: state.family,
    selected: {
      x: Math.min(sourceSize - 2, Math.max(1, Math.floor(sourceSize / 2))),
      y: Math.min(sourceSize - 2, Math.max(1, Math.floor(sourceSize / 2))),
    },
    density: state.density,
    seed: state.seed,
    compact: true,
  });

  state.selected.x = Math.min(targetSize - 1, state.selected.x);
  state.selected.y = Math.min(targetSize - 1, state.selected.y);
  drawLattice(els.targetLattice, {
    size: targetSize,
    family: state.family,
    selected: state.selected,
    density: state.density,
    seed: state.seed + 91,
    compact: false,
  });

  drawChart();
  updateReadouts();
}

document.querySelectorAll("[data-family]").forEach((button) => {
  button.addEventListener("click", () => {
    state.family = button.dataset.family;
    document.querySelectorAll("[data-family]").forEach((b) => b.classList.toggle("active", b === button));
    populateTargets();
    render();
  });
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    state.mode = button.dataset.mode;
    document.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("active", b === button));
    render();
  });
});

els.targetScale.addEventListener("change", (event) => {
  state.target = Number(event.target.value);
  state.selected = {
    x: Math.floor(state.target / 2),
    y: Math.floor(state.target / 2),
  };
  render();
});

els.stepSlider.addEventListener("input", (event) => {
  state.steps = Number(event.target.value);
  render();
});

els.noiseSlider.addEventListener("input", (event) => {
  state.density = Number(event.target.value);
  render();
});

els.advanceBtn.addEventListener("click", () => {
  state.steps = Math.min(5000, state.steps + 200);
  els.stepSlider.value = state.steps;
  render();
});

els.resampleBtn.addEventListener("click", () => {
  state.seed += 13;
  render();
});

els.copyBibtex.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.bibtex.textContent);
    els.copyBibtex.textContent = "Copied";
    window.setTimeout(() => {
      els.copyBibtex.textContent = "Copy BibTeX";
    }, 1200);
  } catch {
    els.copyBibtex.textContent = "Select text";
  }
});

populateTargets();
render();

const assistantWidget = document.querySelector(".assistant-widget");
const assistantToggle = document.querySelector("#assistant-toggle");
const assistantHeroButton = document.querySelector("#open-assistant-hero");
const assistantClose = document.querySelector("#assistant-close");
const assistantForm = document.querySelector("#assistant-form");
const assistantInput = document.querySelector("#assistant-input");
const assistantMessages = document.querySelector("#assistant-messages");
const assistantStatus = document.querySelector("#assistant-status");
const assistantEndpoint = assistantWidget?.dataset.endpoint || "";
const assistantHistory = [];
const assistantConfigured =
  assistantEndpoint &&
  !assistantEndpoint.includes("YOUR_WORKERS_SUBDOMAIN") &&
  /^https:\/\/.+\/chat$/.test(assistantEndpoint);

function setAssistantOpen(open) {
  if (!assistantWidget) return;
  assistantWidget.classList.toggle("open", open);
  assistantToggle?.setAttribute("aria-expanded", String(open));
  if (open) {
    window.setTimeout(() => assistantInput?.focus(), 80);
  }
}

function setAssistantStatus(text, type = "") {
  if (!assistantStatus) return;
  assistantStatus.textContent = text;
  assistantStatus.className = ["assistant-status", type].filter(Boolean).join(" ");
}

function addAssistantMessage(text, role) {
  const message = document.createElement("div");
  message.className = `assistant-message assistant-message-${role === "user" ? "user" : "bot"}`;
  message.textContent = text;
  assistantMessages.appendChild(message);
  assistantMessages.scrollTop = assistantMessages.scrollHeight;
  return message;
}

if (assistantWidget) {
  if (assistantConfigured) {
    setAssistantStatus("Connected to the paper assistant backend.", "ready");
  } else {
    setAssistantStatus(
      "Backend not connected yet. Deploy the Cloudflare Worker, then replace the endpoint in index.html.",
      "error",
    );
    assistantInput.disabled = true;
    assistantForm.querySelector("button").disabled = true;
  }
}

assistantToggle?.addEventListener("click", () => {
  setAssistantOpen(!assistantWidget.classList.contains("open"));
});

assistantHeroButton?.addEventListener("click", () => {
  setAssistantOpen(true);
});

assistantClose?.addEventListener("click", () => {
  setAssistantOpen(false);
});

assistantForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!assistantConfigured) return;

  const question = assistantInput.value.trim();
  if (!question) return;

  assistantInput.value = "";
  assistantInput.disabled = true;
  assistantForm.querySelector("button").disabled = true;
  addAssistantMessage(question, "user");
  const pending = addAssistantMessage("Thinking...", "bot");
  setAssistantStatus("Retrieving relevant paper context...", "ready");

  try {
    const response = await fetch(assistantEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: question,
        history: assistantHistory.slice(-6),
      }),
    });

    if (!response.ok) {
      throw new Error(`Assistant request failed (${response.status})`);
    }

    const data = await response.json();
    const answer = data.answer || "The assistant did not return an answer.";
    pending.textContent = answer;
    assistantHistory.push({ role: "user", content: question });
    assistantHistory.push({ role: "assistant", content: answer });
    setAssistantStatus(
      data.sources?.length ? `Sources: ${data.sources.join(", ")}` : "Answered from paper context.",
      "ready",
    );
  } catch (error) {
    pending.textContent =
      "I could not reach the assistant backend. Check the Worker URL and Cloudflare deployment.";
    setAssistantStatus(error.message, "error");
  } finally {
    assistantInput.disabled = false;
    assistantForm.querySelector("button").disabled = false;
    assistantInput.focus();
  }
});
