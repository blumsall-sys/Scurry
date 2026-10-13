#!/usr/bin/env python3
"""Build fully standalone Scurry/index.html from original sources.
Run from anywhere: python tools/build_single_file.py
Uses Python stdlib only. The resulting index.html works on file:// and GitHub Pages.
"""
import re
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / 'tools' / 'index.template.html'
ORDER = ('data', 'world', 'game', 'render', 'ui', 'main')
MODULE_RE = re.compile(r"import\s*\{([^}]*)\}\s*from\s*['\"]\./([^'\"]+)['\"]\s*;?")
EXPORT_RE = re.compile(r'^\s*export\s+(?:const|class|function)\s+([A-Za-z_][A-Za-z_0-9]*)', re.M)


def render_bundle():
    result = ['/* SCURRY v1.1 | Browser build | Source in src/ */',
              '(function(){"use strict"; const __scurryModules = Object.create(null);']
    for module in ORDER:
        code = (ROOT / 'src' / f'{module}.js').read_text(encoding='utf-8')
        exported = EXPORT_RE.findall(code)
        if module == 'data':
            exported.extend(['CW', 'CH']) # exported from same const statement as TILE
        def convert_import(match):
            items, source = match.group(1), match.group(2)
            assert source.endswith('.js') and '/' not in source, f'Unexpected import: {source}'
            assert source[:-3] in ORDER and ORDER.index(source[:-3]) < ORDER.index(module), f'Invalid import order: {source}'
            return f'const {{{items}}} = __scurryModules.{source[:-3]};'
        code, count = MODULE_RE.subn(convert_import, code)
        if re.search(r'(?m)^\s*import\s+', code) or re.search(r'(?m)^\s*export\s+\{',code):
            raise ValueError(f'Unsupported import/export in {module}.js')
        code = re.sub(r'\bexport\s+(?=(?:class|function|const)\s)', '', code)
        result.append(f'\n/* ---- {module}.js ---- */\n'+('(async function(){' if module == 'main' else '{'))
        result.append(code)
        if module != 'main':
            result.append(f'__scurryModules.{module} = {{{", ".join(dict.fromkeys(exported))}}};')
        result.append(('})().catch(error=>console.error("[Scurry] Boot failed",error));\n' if module == 'main' else '}\n'))
    result.append('})();')
    script = '\n'.join(result)
    if '</script' in script.lower():
        raise ValueError('Source contains HTML-closing script tag; escape before embedding.')
    return script


def main():
    template = TEMPLATE.read_text(encoding='utf-8')
    css = (ROOT / 'style.css').read_text(encoding='utf-8')
    js = render_bundle()
    if '</style' in css.lower():
        raise ValueError('CSS contains HTML-closing style tag.')
    page = template.replace('<!-- SCURRY_CSS -->', '<style>\n'+css+'\n</style>')
    page = page.replace('<!-- SCURRY_JS -->', '<script>\n'+js+'\n</script>')
    page = page.replace('VERSION 0.9 — PLAYABLE ALPHA', 'VERSION 1.0 — ART OVERHAUL')
    if 'SCURRY_CSS' in page or 'SCURRY_JS' in page:
        raise ValueError('Missing template markers')
    (ROOT/'index.html').write_text(page,encoding='utf-8')
    print(f'Generated standalone {ROOT/"index.html"} ({len(page.encode()):,} bytes) from {len(ORDER)} modules.')

if __name__ == '__main__':
    main()
