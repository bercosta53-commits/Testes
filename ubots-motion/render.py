"""Renderizador da cena (index2.html) via Playwright.
Uso:
  python render.py events                 -> gera events.json (mapa de eventos p/ o áudio)
  python render.py preview 1.8,5.6,14.8   -> stills de conferência (prev_*.jpg)
  python render.py full [inicio] [fim]    -> quadros em frames2/ (padrão 0..600)
Variável GL=swiftshader força render por CPU (padrão: tenta GPU).
"""
import sys, os, json, time, subprocess
from playwright.sync_api import sync_playwright

FPS, TOTAL = 30, 600
mode = sys.argv[1]
args = ["--ignore-gpu-blocklist", "--enable-gpu-rasterization"]
if os.environ.get("GL") == "swiftshader":
    args += ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
os.makedirs("frames2", exist_ok=True)
srv = subprocess.Popen(["python3", "-m", "http.server", "8765"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=args)
        pg = b.new_page(viewport={"width": 1080, "height": 1350})
        pg.on("pageerror", lambda e: print("ERRO JS:", e))
        pg.goto("http://localhost:8765/index2.html")
        pg.wait_for_function("window.ready===true", timeout=120000)
        pg.evaluate("window.renderFrame(0.5)")  # aquecimento: compila shaders
        if mode == "events":
            json.dump(pg.evaluate("window.EVENTS"), open("events.json", "w"))
            print("events.json ok")
        elif mode == "preview":
            for t in [float(x) for x in sys.argv[2].split(",")]:
                pg.evaluate(f"window.renderFrame({t})")
                pg.screenshot(path=f"prev_{t:05.2f}.jpg", type="jpeg", quality=88)
        else:
            a = int(sys.argv[2]) if len(sys.argv) > 2 else 0
            z = int(sys.argv[3]) if len(sys.argv) > 3 else TOTAL
            t0 = time.time()
            for i in range(a, z):
                pg.evaluate(f"window.renderFrame({i / FPS})")
                pg.screenshot(path=f"frames2/f{i:04d}.jpg", type="jpeg", quality=94)
                if i % 30 == 0:
                    print(f"quadro {i}  {time.time() - t0:.1f}s", flush=True)
        b.close()
finally:
    srv.terminate()
