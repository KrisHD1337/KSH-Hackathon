# KSH-Hackathon

## Ziel & Problem:
Das Mathe-Tool ist eine Webapp, mit der du aus Datenpunkten oder Formeln Kurven erzeugst, analysierst und als PNG exportierst. Es richtet sich an Schüler, die Messreihen oder Aufgaben schnell visualisieren und auswerten wollen.

## Hauptfunktionen (Stand: Alpha)
* Daten‑Plotter: Werte aus der Zwischenablage einfügen -> Sofortiger Plot
* Funktions‑Plotter: y = f(x) eingeben (z. B. sin(x)+0.5*x), Domain/Samples wählen → Kurve.
* Basis‑Analysen: Min/Max, Mittelwert, lineare Regression inkl. R².
* Diagramm als PNG exportierbar
* Achsenbeschriftungen, Raster

## How to install:
* Das Repository klonen (```git clone https://github.com/KrisHD1337/KSH-Hackathon-Alpha.git```).
* Die virtuelle Umgebung mit ```python3 -m venv .venv``` und ```source .venv/bin/activate``` aktivieren.
* Die requirements.txt mit ```pip install -r requirements.txt``` installieren.
* Einrichtung um Typescript zu kompilieren zuerst ```npm init -y``` ins Terminal (vom aktuellen Projekt) und dann ```npm install --save-dev typescript```
* Dann kann ```npx tsc``` ausgeführt werden, damit die typescript files zu Javascript files compiled werden.
* app.py suchen und ausführen
* Gehen Sie zu http://127.0.0.1:5000

ODER
* Alles überspringen und zu https://math.krishd.ch gehen

## How to use (Kurzguide): 
* Funktion eingeben & Parameter setzen
* Analysen aktivieren (optional): z. B. Regression, Nullstellen‑Suche.
* Plot erzeugen: Vorschau wird angezeigt; bei Anpassungen aktualisiert sich der Plot.
* Export: Als PNG herunterladen.

## Developer
* Jérôme Bachmann
* Frederik Spirgi
* Michelle Brändli
* Kristian Cerni

Keine dauerhafte Speicherung von Nutzerdaten in der Alpha-Version; Berechnungen werden im Arbeitsspeicher durchgeführt. Hochgeladene Dateien werden nur zum Erzeugen des Plots genutzt und anschließend verworfen.
