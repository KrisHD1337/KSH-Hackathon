from math import lcm, gcd
from functools import reduce
from flask import Flask, render_template, request, url_for, redirect, send_file, session, current_app, flash
app = Flask(__name__)
@app.route("/kopfrechnen")
def kopfrechnen():
    def kgv(nums):
        return reduce(lcm, nums)

    def ggt(nums):
        return reduce(gcd, nums)

@app.route("/primenumber")
def primenumber(number):
        if number <= 1:
            return False
        for i in range(2, int(number**0.5)+1):
            if number % i == 0:
                return False
        return True

@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
