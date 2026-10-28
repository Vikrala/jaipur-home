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
libraries='<script>\n'+(BASE/'model/three.min.js').read_text()+'\n</script>\n<script>\n'+(BASE/'model/gltf-exporter.js').read_text()+'\n</script>'
out=template.replace('<!-- LIBRARIES -->',libraries).replace('<!-- PLAN -->','<script>\n'+(BASE/'model/plan-data.js').read_text()+'\n</script>').replace('<!-- INTERIOR -->','<script>\n'+(BASE/'model/interior.js').read_text()+'\n</script>')
(BASE/'walkthrough.html').write_text(out)
print('Offline walkthrough:',BASE/'walkthrough.html','bytes:',len(out.encode()))
