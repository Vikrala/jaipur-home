from pathlib import Path
import re

BASE=Path(__file__).parent/'output/jaipur-home'
if Path('/private/tmp/jaipur-GLTFExporter.js').exists():
    exporter=Path('/private/tmp/jaipur-GLTFExporter.js').read_text()
    exporter=re.sub(r"import\s*\{([\s\S]*?)\}\s*from 'three';",r'const {\1}=window.THREE;',exporter,count=1)
    exporter=re.sub(r"import \{ decompress \} from .*?;", "const decompress=()=>{throw new Error('No compressed textures used');};",exporter)
    exporter=exporter.replace('export { GLTFExporter };','window.JAIPUR_GLTFExporter=GLTFExporter;')
    (BASE/'model/gltf-exporter.js').write_text('(function(){\n'+exporter+'\n})();\n')
template=(BASE/'walkthrough.template.html').read_text()
def inline(name):
    return '<script>\n'+(BASE/'model'/name).read_text()+'\n</script>'
libraries='\n'.join(inline(name) for name in ('three.min.js','three-postfx.js','gltf-exporter.js'))
plan='\n'.join(inline(name) for name in ('plan-data.js','textures-baked.js','realism.js'))
out=template.replace('<!-- LIBRARIES -->',libraries).replace('<!-- PLAN -->',plan).replace('<!-- INTERIOR -->',inline('interior.js'))
(BASE/'walkthrough.html').write_text(out)
print('Offline walkthrough:',BASE/'walkthrough.html','bytes:',len(out.encode()))
