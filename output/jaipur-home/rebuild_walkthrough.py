"""Rebuild the standalone HTML after editing model/interior.js. Python stdlib only."""
from pathlib import Path

base = Path(__file__).resolve().parent
template = (base / 'walkthrough.template.html').read_text()
def script(name):
    return '<script>\n' + (base / 'model' / name).read_text() + '\n</script>'
result = template.replace('<!-- LIBRARIES -->', script('three.min.js') + script('three-postfx.js') + script('gltf-exporter.js'))
result = result.replace('<!-- PLAN -->', script('plan-data.js')).replace('<!-- INTERIOR -->', script('textures-baked.js') + script('realism.js') + '\n' + script('interior.js'))
(base / 'walkthrough.html').write_text(result)
print('Rebuilt:', base / 'walkthrough.html')
