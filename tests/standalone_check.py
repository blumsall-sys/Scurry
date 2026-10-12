"""Dependency-free checks for the one-file GitHub Pages runtime.
Run: python tests/standalone_check.py
"""
from pathlib import Path
from html.parser import HTMLParser
import re

root = Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
assert '<script>' in html and 'window.SCurryStatus' in html
assert '<style>' in html and '.viewport-frame' in html
assert 'src="./src/main.js"' not in html
assert 'href="./style.css"' not in html
assert 'requestAnimationFrame(frame)' in html and 'function drawTile' in html
assert 'VERSION 0.9.2' in html
assert 'id="interactBtn"' in html
assert 'INTERIORS,NPCS' in (root/'src/game.js').read_text()
assert 'clickHotspot(wx,wy)' in html
assert all((root / 'src' / f'{stem}.js').exists() for stem in ('data','world','game','render','ui','main'))
assert not re.search(r'<script[^>]+src\s*=', html, re.I), 'Unexpected external runtime script'
assert not re.search(r'<link[^>]+stylesheet', html, re.I), 'Unexpected external stylesheet'
assert sum(p.is_file() for p in root.rglob('*')) < 100
print('PASS: single-file Scurry entry point has embedded game, CSS and no external assets; under 100 files.')
