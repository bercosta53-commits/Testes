"""Renderizador da v3 (index3.html) via Playwright.
Uso:
  python render3.py events                       -> events3.json (mapa de eventos p/ o áudio)
  python render3.py preview 1.8,5.6,14.8 [fmt]   -> stills prev3_<fmt>_<t>.jpg
  python render3.py full [fmt] [inicio] [fim]    -> quadros em frames3_<fmt>/ (padrão 0..600)
fmt: 4x5 (padrão) | 9x16 | 1x1.  GL=swiftshader força render por CPU.
"""
import sys, os, json, time, subprocess, socket
from playwright.sync_api import sync_playwright

FPS, TOTAL = 30, 600
SIZES = {"4x5": (1080, 1350), "9x16": (1080, 1920), "1x1": (1080, 1080)}
mode = sys.argv[1]
fmt = (sys.argv[3] if mode == "preview" and len(sys.argv) > 3 else
       sys.argv[2] if mode == "full" and len(sys.argv) > 2 else "4x5")
W, H = SIZES[fmt]
args = ["--ignore-gpu-blocklist", "--enable-gpu-rasterization"]
if os.environ.get("GL") == "swiftshader":
    args += ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
s = socket.socket(); s.bind(("", 0)); port = s.getsockname()[1]; s.close()
srv = subprocess.Popen(["python3", "-m", "http.server", str(port)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=args)
        pg = b.new_page(viewport={"width": W, "height": H})
        pg.on("pageerror", lambda e: print("ERRO JS:", e))
        pg.on("console", lambda m: m.type == "error" and print("CONSOLE:", m.text))
        pg.goto(f"http://localhost:{port}/index3.html?f={fmt}")
        pg.wait_for_function("window.ready===true", timeout=120000)
        pg.evaluate("window.renderFrame(0.5)")  # aquecimento: compila shaders
        if mode == "events":
            json.dump(pg.evaluate("window.EVENTS"), open("events3.json", "w"))
            print("events3.json ok")
        elif mode == "preview":
            for t in [float(x) for x in sys.argv[2].split(",")]:
                pg.evaluate(f"window.renderFrame({t})")
                pg.screenshot(path=f"prev3_{fmt}_{t:05.2f}.jpg", type="jpeg", quality=90)
        else:
            out = f"frames3_{fmt}"; os.makedirs(out, exist_ok=True)
            a = int(sys.argv[3]) if len(sys.argv) > 3 else 0
            z = int(sys.argv[4]) if len(sys.argv) > 4 else TOTAL
            t0 = time.time()
            for i in range(a, z):
                pg.evaluate(f"window.renderFrame({i / FPS})")
                pg.screenshot(path=f"{out}/f{i:04d}.jpg", type="jpeg", quality=96)
                if i % 30 == 0:
                    print(f"{fmt} quadro {i}  {time.time() - t0:.1f}s", flush=True)
        b.close()
finally:
    srv.terminate()
