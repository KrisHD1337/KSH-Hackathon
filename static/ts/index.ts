const form = document.getElementById("plot-form") as HTMLFormElement;
const fnInput = document.getElementById("function-input") as HTMLInputElement;
const gridToggle = document.getElementById("toggle-grid") as HTMLInputElement;
const plotSlot = document.getElementById("plot-slot") as HTMLDivElement;
const drawBtn = document.getElementById("draw-button") as HTMLButtonElement;
const optsTextarea = document.getElementById("options-input") as HTMLTextAreaElement | null;

function showMessage(text: string) {
  plotSlot.innerHTML = "";
  const msg = document.createElement("div");
  msg.setAttribute("role", "status");
  msg.textContent = text;
  plotSlot.appendChild(msg);
}

function parseOptions(raw: string | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!raw) return out;
  raw
    .split(/[,\n;]+/)
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(pair => {
      const eq = pair.indexOf("=");
      if (eq > 0) {
        const k = pair.slice(0, eq).trim();
        const v = pair.slice(eq + 1).trim();
        if (k) out[k] = v;
      }
    });
  return out;
}

async function renderPlot(e?: Event) {
  e?.preventDefault();
  const expr = (fnInput.value || "").trim();
  if (!expr) {
    showMessage("Bitte eine Funktion eingeben (z. B. x^2 + 2x + 1).");
    return;
  }
  drawBtn.disabled = true;
  showMessage("Zeichne…");
  const url = new URL("/curves", window.location.origin);
  const params = new URLSearchParams({ f: expr });
  if (gridToggle?.checked) params.set("grid", "1");
  const extra = parseOptions(optsTextarea?.value);
  Object.entries(extra).forEach(([k, v]) => params.set(k, v));
  params.set("_ts", String(Date.now()));
  url.search = params.toString();
  try {
    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Serverfehler (${res.status})`);
    }
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    plotSlot.innerHTML = "";
    const img = document.createElement("img");
    img.id = "plot-image";
    img.alt = `Plot von f(x) = ${expr}`;
    img.src = objectUrl;
    img.onload = () => {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    };
    plotSlot.appendChild(img);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    showMessage(`Fehler: ${message}`);
  } finally {
    drawBtn.disabled = false;
  }
}

form.addEventListener("submit", renderPlot);

fnInput.addEventListener("keydown", (ev: KeyboardEvent) => {
  if (ev.key === "Enter") {
    ev.preventDefault();
    renderPlot();
  }
});
