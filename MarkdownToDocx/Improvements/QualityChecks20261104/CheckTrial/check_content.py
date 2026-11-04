from pathlib import Path
import re, json, hashlib, time, os
from zipfile import ZipFile
from xml.etree import ElementTree as ET

ROOT=Path(__file__).resolve().parent
EX=ROOT.parent/'Examples'
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
R='{http://schemas.openxmlformats.org/officeDocument/2006/relationships}'
P='{http://schemas.openxmlformats.org/package/2006/relationships}'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def package(root): return {str(p.relative_to(root)).replace('\\','/'):sha(p) for p in sorted(root.rglob('*')) if p.is_file()}
def norm(s): return ' '.join(s.split())
source=EX/'source.md'
expected=json.loads((EX/'internal/construction-checks.json').read_text())['files']
assert all(sha(EX/name)==h for name,h in expected.items()), 'Fixture changed since human review'
source_text=source.read_text(encoding='utf-8')
plain=re.sub(r'```.*?```','',source_text,flags=re.S)
headings=[]; prose=[]; steps=[]; rows=[]; links=[]
for line in plain.splitlines():
    line=line.strip()
    if not line: continue
    if line.startswith('#'):
        headings.append(re.sub(r'^#+\s*','',line)); continue
    if line.startswith('|'):
        if not re.fullmatch(r'[|:\-\s]+',line): rows.append([norm(x) for x in line.strip('|').split('|')])
        continue
    match=re.match(r'^\d+\.\s+(.*)',line)
    if match: steps.append(match.group(1)); continue
    for label,url in re.findall(r'\[([^]]+)\]\(([^)]+)\)',line): links.append([label,url])
    prose.append(re.sub(r'\[([^]]+)\]\(([^)]+)\)',r'\1',line))
spec={'headings':headings,'paragraphs':prose,'steps':steps,'table':rows,'links':links}
(ROOT/'source-expectations.json').write_text(json.dumps(spec,indent=2),encoding='utf-8')
skill=Path(os.environ["SKILL_TARGET"])
(ROOT/'before-identities.json').write_text(json.dumps({'fixtures':expected,'target':package(skill),'checker':sha(Path(__file__)),'plan':sha(ROOT/'Plan.md')},indent=2),encoding='utf-8')
start=time.monotonic(); runs=[]
for file in sorted(EX.glob('*.docx')):
    with ZipFile(file) as z:
        xml=ET.fromstring(z.read('word/document.xml'))
        rels=ET.fromstring(z.read('word/_rels/document.xml.rels'))
        relmap={r.get('Id'):r.get('Target') for r in rels}
        body=xml.find(W+'body')
        paras=[norm(''.join(e.itertext())) for e in []]  # populated from text nodes only
        paras=[norm(''.join(n.text or '' for n in p.iter(W+'t'))) for p in body.findall(W+'p')]
        nonempty=[x for x in paras if x]
        missing=[x for x in prose+steps+headings if norm(x) not in nonempty]
        order=[nonempty.index(norm(x)) for x in headings if norm(x) in nonempty]
        ordered=len(order)==len(headings) and order==sorted(order)
        tables=[[[norm(''.join(n.text or '' for n in c.iter(W+'t'))) for c in row.findall(W+'tc')] for row in t.findall(W+'tr')] for t in body.findall(W+'tbl')]
        hyperlinks=[[norm(''.join(n.text or '' for n in h.iter(W+'t'))),relmap.get(h.get(R+'id'))] for h in xml.iter(W+'hyperlink')]
        checks=[
          {'id':'C1','status':'pass' if not missing and ordered else 'fail','observation':{'missing_native_content':missing,'heading_order_preserved':ordered,'native_paragraphs':nonempty}},
          {'id':'C2','status':'pass' if tables==[rows] else 'fail','observation':{'native_tables':tables,'expected_table':rows}},
          {'id':'C3','status':'pass' if all(x in hyperlinks for x in links) else 'fail','observation':{'live_hyperlinks':hyperlinks,'expected_links':links}}]
        runs.append({'file':file.name,'checks':checks})
(ROOT/'content-observations.json').write_text(json.dumps({'checker_version':'MD-content-v1','seconds':time.monotonic()-start,'runs':runs},indent=2),encoding='utf-8')
print(json.dumps([{'file':r['file'],'checks':{c['id']:c['status'] for c in r['checks']}} for r in runs],indent=2))
