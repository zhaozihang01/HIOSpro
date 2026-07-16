# HIOSprofrom pathlib import Path
import zipfile, shutil

root=Path('/mnt/data/HIOS_V0.1')
if root.exists():
    shutil.rmtree(root)
(root/'app').mkdir(parents=True)
(root/'components').mkdir()
(root/'public').mkdir()

(root/'README.md').write_text("# HIOS V0.1\n\nStarter project.\n",encoding='utf-8')
(root/'package.json').write_text('{"name":"hios-pro","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start"}}',encoding='utf-8')
(root/'app'/'layout.tsx').write_text("""export default function RootLayout({children}:{children:React.ReactNode}){return(<html><body style={{margin:0,fontFamily:'system-ui',background:'#eef3f8'}}>{children}</body></html>)}""",encoding='utf-8')
(root/'app'/'page.tsx').write_text("""export default function Home(){return(<main style={{padding:32}}><h1>🏛 HIOS Morning Research</h1><p>Version 0.1</p><div style={{background:'#fff',padding:20,borderRadius:12}}><h2>Today's Top 3</h2><ol><li>Tokyo Marine</li><li>Microsoft</li><li>Broadcom</li></ol></div></main>)}""",encoding='utf-8')

zip_path=Path('/mnt/data/HIOS_V0.1.zip')
if zip_path.exists():
    zip_path.unlink()
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
    for p in root.rglob('*'):
        z.write(p,p.relative_to(root.parent))
print(zip_path)
