from math import lcm, gcd
from functools import reduce
from io import BytesIO
from flask import Flask, render_template, request, send_file
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


def compile_user_function(text: str):
    allowed = {
        'x': x, 'sin': sp.sin, 'cos': sp.cos, 'tan': sp.tan, 'exp': sp.exp,
        'log': sp.log, 'sqrt': sp.sqrt, 'abs': sp.Abs, 'pi': sp.pi, 'e': sp.E
    }
    expr = parse_expr(text, transformations=transformations,
                      local_dict=allowed, evaluate=True)
    return sp.lambdify(x, expr, 'numpy')


app = Flask(__name__)


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
def home():
    return render_template("about.html")


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


@app.route("/baseconverter", methods=["GET"])
def baseconverter():
    return render_template("baseconverter.html")


if __name__ == "__main__":
    app.run(debug=True)