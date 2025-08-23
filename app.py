from math import lcm, gcd
from functools import reduce
from io import BytesIO
from flask import Flask, render_template, request, send_file, jsonify
import numpy as np
import sympy as sp
import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
from sympy.parsing.sympy_parser import (
    parse_expr, standard_transformations,
    implicit_multiplication_application, convert_xor
)

transformations = standard_transformations + (
    implicit_multiplication_application,
    convert_xor,
)

x = sp.symbols('x')

app = Flask(__name__)


def compile_user_function(text: str):
    allowed = {
        'x': x, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan, 'exp': sp.exp,
        'log': sp.log, 'sqrt': sp.sqrt, 'abs': sp.Abs, 'pi': sp.pi, 'e': sp.E
    }
    expr = parse_expr(text, transformations=transformations,
                      local_dict=allowed, evaluate=True)
    return sp.lambdify(x, expr, 'numpy')


def compute_curve_stats(xs: np.ndarray, ys: np.ndarray):
    finite = np.isfinite(ys)
    n_total = int(ys.size)
    n_valid = int(np.count_nonzero(finite))
    n_invalid = n_total - n_valid
    stats = {
        "samples": n_total,
        "finite_points": n_valid,
        "invalid_points": n_invalid,
        "zeros": [],
        "extrema": {"maxima": [], "minima": []},
    }
    if n_valid == 0:
        return stats
    vxs = xs[finite]
    vys = ys[finite]
    ymin_idx = int(np.argmin(vys))
    ymax_idx = int(np.argmax(vys))
    stats.update({
        "domain": [float(xs[0]), float(xs[-1])],
        "y_min": {"x": float(vxs[ymin_idx]), "y": float(vys[ymin_idx])},
        "y_max": {"x": float(vxs[ymax_idx]), "y": float(vys[ymax_idx])},
        "mean": float(np.mean(vys)),
        "median": float(np.median(vys)),
        "stdev": float(np.std(vys)),
    })
    zeros = []
    for i in range(len(xs) - 1):
        y0, y1 = ys[i], ys[i + 1]
        if not (np.isfinite(y0) and np.isfinite(y1)):
            continue
        if y0 == 0:
            zeros.append(float(xs[i]))
        elif y0 * y1 < 0:
            x0 = xs[i] - y0 * (xs[i + 1] - xs[i]) / (y1 - y0)
            zeros.append(float(x0))
    if zeros:
        zeros = sorted(zeros)
        filtered = []
        eps = (xs[-1] - xs[0]) * 1e-6
        for z in zeros:
            if not filtered or abs(z - filtered[-1]) > eps:
                filtered.append(z)
        zeros = filtered[:20]
    stats["zeros"] = zeros
    if len(vxs) >= 3:
        d = np.gradient(vys, vxs)
        s = np.sign(d)
        for i in range(1, len(s)):
            if s[i - 1] > 0 > s[i]:
                stats["extrema"]["maxima"].append(
                    {"x": float(vxs[i]), "y": float(vys[i])}
                )
            if s[i - 1] < 0 < s[i]:
                stats["extrema"]["minima"].append(
                    {"x": float(vxs[i]), "y": float(vys[i])}
                )
        stats["extrema"]["maxima"] = stats["extrema"]["maxima"][:10]
        stats["extrema"]["minima"] = stats["extrema"]["minima"][:10]
    return stats


@app.route("/curves/stats", methods=["GET"])
def curves_stats():
    data = request.get_json(silent=True) if request.is_json else request.args
    expr_text = (data.get("f") or data.get("function") or "").strip()
    if not expr_text:
        return jsonify({"error": "Parameter 'f' fehlt (der Funktionsausdruck)."}), 400
    try:
        xmin = float(data.get("xmin", -10))
        xmax = float(data.get("xmax", 10))
        samples = int(data.get("samples", 1000))
    except (TypeError, ValueError):
        return jsonify({"error": "Einer der xmin/xmax/samples Werte ist ungültig."}), 400
    if xmax <= xmin:
        return jsonify({"error": "'xmax' muss grösser sein als 'xmin'."}), 400
    samples = max(10, min(samples, 20000))
    try:
        f = compile_user_function(expr_text)
    except Exception as e:
        return jsonify({"error": f"Ausdruck konnte nicht gelesen werden: {e}"}), 400
    xs = np.linspace(xmin, xmax, samples, dtype=float)
    with np.errstate(all="ignore"):
        ys = np.asarray(f(xs), dtype=float)
    if ys.shape != xs.shape:
        return jsonify({"error": "Der Ausdruck liefert kein 1D-Array der Länge samples."}), 400
    stats = compute_curve_stats(xs, ys)
    stats["expression"] = expr_text
    stats["xmin"] = xmin
    stats["xmax"] = xmax
    return jsonify(stats)


def kgv(nums):
    return reduce(lcm, nums)


def ggt(nums):
    return reduce(gcd, nums)


@app.route("/primenumber", methods=["GET", "POST"])
def primenumber(number):
    if number <= 1:
        return False
    for i in range(2, int(number ** 0.5) + 1):
        if number % i == 0:
            return False
    return True


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/baseconverter", methods=["GET"])
def baseconverter():
    return render_template("baseconverter.html")


@app.route("/prime")
def prime():
    return render_template("primenumber.html")


@app.route("/curves", methods=["GET", "POST"])
def curves():
    data = request.get_json(silent=True) if request.is_json else request.args
    expr_text = (data.get("f") or data.get("function") or "").strip()
    if not expr_text:
        return "Parameter 'f' fehlt (der Funktionsausdruck).", 400
    try:
        xmin = float(data.get("xmin", -10))
        xmax = float(data.get("xmax", 10))
        samples = int(data.get("samples", 1000))
        show_grid = str(data.get("grid", "0")) in ("1", "true", "True")
        w = int(data.get("w", 1200))  # in pixeln
        h = int(data.get("h", 800))  # in pixeln
        dpi = int(data.get("dpi", 150))
    except (TypeError, ValueError):
        return "Einer der xmin/xmax/samples/w/h/dpi werte ist ungültig.", 400
    if xmax <= xmin:
        return "'xmax' muss grösser sein als 'xmin'.", 400
    samples = max(10, min(samples, 20000))
    try:
        f = compile_user_function(expr_text)
    except Exception as e:
        return f"Ausruck {e} konnte nicht gelesen werden.", 400
    xs = np.linspace(xmin, xmax, samples, dtype=float)
    with np.errstate(all='ignore'):
        ys = f(xs)
    ys = np.asarray(ys, dtype=float)
    if ys.shape != xs.shape:
        return "Der Ausdruck hat kein zu x passendes 1-D array zurückgegeben.", 400

    fig_w, fig_h = w / dpi, h / dpi
    fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=dpi)

    ax.plot(xs, ys, linewidth=2)
    ax.set_xlim(xmin, xmax)
    ax.set_xlabel("x")
    ax.set_ylabel("f(x)")
    ax.set_title(f"f(x) = {expr_text}")
    ax.axhline(0, linewidth=1, color="black", alpha=0.35)
    ax.axvline(0, linewidth=1, color="black", alpha=0.35)

    if show_grid:
        ax.grid(True, linestyle="--", alpha=0.35)

    fig.tight_layout()
    buf = BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return send_file(
        buf,
        mimetype="image/png",
        download_name="curve.png",
        as_attachment=False
    )


if __name__ == "__main__":
    app.run(debug=True)
