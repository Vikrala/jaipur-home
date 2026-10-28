const esbuild=require('esbuild'),path=require('path');
esbuild.build({entryPoints:['postfx-entry.js'],bundle:true,minify:true,format:'iife',outfile:'three-postfx.js',
 plugins:[{name:'three-shim',setup(b){b.onResolve({filter:/^three$/},()=>({path:path.resolve('three-shim.js')}));}}]
}).then(()=>console.log('ok')).catch(()=>process.exit(1));
