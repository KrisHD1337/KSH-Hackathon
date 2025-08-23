const form = document.getElementById("plot-form") as HTMLFormElement;
const fnInput = document.getElementById("function-input") as HTMLInputElement;
const gridToggle = document.getElementById("toggle-grid") as HTMLInputElement;
const plotSlot = document.getElementById("plot-slot") as HTMLDivElement;
const drawBtn = document.getElementById("draw-button") as HTMLButtonElement;
const optsTextarea = document.getElementById("options-input") as HTMLTextAreaElement;
const exportBtn = document.getElementById("export-button") as HTMLButtonElement;

//funktion um Nachrichten im UI anzuzeigen
function showMessage(text: string) {
    plotSlot.innerHTML = "";
    const msg = document.createElement("div");
    msg.setAttribute("role", "status");
    msg.textContent = text;
    plotSlot.appendChild(msg);
}

//verarbeitet einen String-Parameter und wandelt ihn in ein Objekt um.
function parseOptions(raw: string | undefined): Record<string, string> {
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

let lastQueryString: string | null = null;

//ladet den eigentlichen Plot und zeigt ihn an.
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
    const params = new URLSearchParams({f: expr});
    if (gridToggle?.checked) params.set("grid", "1");
    const extra = parseOptions(optsTextarea?.value);
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    params.set("_ts", String(Date.now()));
    url.search = params.toString();
    lastQueryString = "?" + new URLSearchParams(Object.fromEntries(
        [...params.entries()].filter(([k]) => k !== "_ts")
    )).toString();
    try {
        const res = await fetch(url.toString());
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
        await refreshCurveData(params);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        showMessage(`Fehler: ${message}`);
    } finally {
        drawBtn.disabled = false;
    }
}

form.addEventListener("submit", renderPlot); //Important!!!

fnInput.addEventListener("keydown", (ev: KeyboardEvent) => {
    if (ev.key === "Enter") {
        ev.preventDefault();
        renderPlot();
    }
});

exportBtn.addEventListener("click", async () => {
    if (!lastQueryString) {
        alert("Bitte zuerst einen Plot zeichnen.");
        return;
    }
    const url = new URL("/curves", window.location.origin);
    const params = new URLSearchParams(lastQueryString.slice(1));
    params.set("download", "1");
    url.search = params.toString();
    try {
        const res = await fetch(url.toString(), {method: "GET"});
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || `Serverfehler (${res.status})`);
        }
        const blob = await res.blob();
        const cd = res.headers.get("Content-Disposition");
        let filename = "plot.png";
        if (cd) {
            const m = /filename\*=UTF-8''([^;]+)|filename="?([^\";]+)"?/i.exec(cd);
            filename = decodeURIComponent(m?.[1] || m?.[2] || filename);
        }
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        alert("Download fehlgeschlagen: " + msg);
    }
});

const curveDataBox = document.getElementById("curve-data-content") as HTMLDivElement;

function setCurveDataMessage(text: string) {
    if (!curveDataBox) return;
    curveDataBox.innerHTML = `<em>${text}</em>`;
}

function formatNum(n: number | null | undefined): string {
    if (typeof n !== "number" || !isFinite(n)) return "–";
    return new Intl.NumberFormat("de-CH", {maximumFractionDigits: 6}).format(n);
}

function statsToHtml(s: any): string {
    if (!s || s.error) {
        return `<div class="error">Keine Daten: ${s?.error ?? "unbekannter Fehler"}</div>`;
    }
    const zeros = (s.zeros ?? []).map((z: number) => formatNum(z)).join(", ") || "keine";
    const maxList = (s.extrema?.maxima ?? [])
        .map((p: any) => `(${formatNum(p.x)} | ${formatNum(p.y)})`).join(", ") || "–";
    const minList = (s.extrema?.minima ?? [])
        .map((p: any) => `(${formatNum(p.x)} | ${formatNum(p.y)})`).join(", ") || "–";
    return `
    <ul class="curve-stats">
      <li><strong>f(x)</strong>: ${s.expression ?? "—"}</li>
      <li><strong>Domain</strong>: [${formatNum(s.xmin)}; ${formatNum(s.xmax)}], Samples: ${s.samples}</li>
      <li><strong>Gültige Punkte</strong>: ${s.finite_points} (ungültig: ${s.invalid_points})</li>
      <li><strong>y<sub>min</sub></strong>: (${formatNum(s.y_min?.x)} | ${formatNum(s.y_min?.y)})</li>
      <li><strong>y<sub>max</sub></strong>: (${formatNum(s.y_max?.x)} | ${formatNum(s.y_max?.y)})</li>
      <li><strong>Ø (mean)</strong>: ${formatNum(s.mean)}, Median: ${formatNum(s.median)}, σ: ${formatNum(s.stdev)}</li>
      <li><strong>Nullstellen (≈)</strong>: ${zeros}</li>
      <li><strong>Maxima (≈)</strong>: ${maxList}</li>
      <li><strong>Minima (≈)</strong>: ${minList}</li>
    </ul>
  `;
}

async function refreshCurveData(params: URLSearchParams) {
    if (!curveDataBox) return;
    const p = new URLSearchParams(
        Object.fromEntries([...params.entries()].filter(([k]) => k !== "_ts"))
    );
    const url = new URL("/curves/stats", window.location.origin);
    url.search = p.toString();
    setCurveDataMessage("Berechne Kennwerte …");
    try {
        const res = await fetch(url.toString());
        if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || `Serverfehler (${res.status})`);
        }
        const stats = await res.json();
        curveDataBox.innerHTML = statsToHtml(stats);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setCurveDataMessage("Fehler: " + msg);
    }
}
