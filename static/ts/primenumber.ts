const input = document.getElementById("input-id") as HTMLInputElement;
const btnSubmit = document.getElementById("sub-id") as HTMLButtonElement;
const btnClear = document.getElementById("id-clear") as HTMLButtonElement;
const msg = document.getElementById("dom-msg") as HTMLParagraphElement;

type MsgKind = "info" | "ok" | "err";

function setMessage(text: string, kind: MsgKind = "info") {
    if (!msg) return;
    msg.textContent = text;
    msg.dataset.status = kind;
    msg.setAttribute("role", "status");
    msg.setAttribute("aria-live", "polite");
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
    let b = ((base % mod) + mod) % mod;
    let e = exp;
    let r = 1n;
    while (e > 0n) {
        if (e & 1n) r = (r * b) % mod;
        b = (b * b) % mod;
        e >>= 1n;
    }
    return r;
}

const SMALL_PRIMES = [
    2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n, 43n, 47n,
    53n, 59n, 61n, 67n, 71n, 73n, 79n, 83n, 89n, 97n
];

function smallDivisor(n: bigint): bigint | null {
    for (const p of SMALL_PRIMES) {
        if (n === p) return p;
        if (n % p === 0n) return p;
    }
    return null;
}

function isPrimeBig(n: bigint): boolean {
    if (n < 2n) return false;
    const sd = smallDivisor(n);
    if (sd !== null) return n === sd;
    let d = n - 1n;
    let s = 0n;
    while ((d & 1n) === 0n) {
        d >>= 1n;
        s++;
    }

    const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n];

    WitnessLoop:
        for (const a0 of bases) {
            if (a0 >= n - 1n) continue;
            let x = modPow(a0, d, n);
            if (x === 1n || x === n - 1n) continue;

            for (let r = 1n; r < s; r++) {
                x = (x * x) % n;
                if (x === n - 1n) continue WitnessLoop;
            }
            return false;
        }
    return true;
}

function parseInputToBigInt(): bigint | null {
    const raw = (input?.value ?? "").trim();
    if (!raw) return null;
    try {
        const n = BigInt(raw);
        return n;
    } catch {
        return null;
    }
}

function handleSubmit(e?: Event) {
    e?.preventDefault();
    const n = parseInputToBigInt();
    if (n === null) {
        setMessage("Bitte eine ganze Zahl eingeben (z. B. 17).", "err");
        return;
    }
    if (n < 0n) {
        setMessage("Nur nichtnegative ganze Zahlen werden geprüft.", "err");
        return;
    }
    if (n === 0n || n === 1n) {
        setMessage(`${n.toString()} ist keine Primzahl.`, "ok");
        return;
    }
    const sd = smallDivisor(n);
    if (sd !== null && sd !== n) {
        setMessage(`${n.toString()} ist keine Primzahl. Kleiner Teiler: ${sd.toString()}`, "ok");
        return;
    }
    const prime = isPrimeBig(n);
    if (prime) {
        setMessage(`${n.toString()} ist eine Primzahl`, "ok");
    } else {
        setMessage(`${n.toString()} ist keine Primzahl`, "ok");
    }
}

function handleClear(e?: Event) {
    e?.preventDefault();
    input.value = "";
    setMessage("Result", "info");
    input.focus();
}

window.addEventListener("DOMContentLoaded", () => {
    input?.setAttribute("inputmode", "numeric");
    input?.setAttribute("step", "1");
    input?.setAttribute("min", "0");
    setMessage("Result", "info");
    btnSubmit?.addEventListener("click", handleSubmit);
    btnClear?.addEventListener("click", handleClear);
    input?.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
            ev.preventDefault();
            handleSubmit();
        }
    });
});