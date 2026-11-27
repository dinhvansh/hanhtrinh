import json, pathlib, urllib.request, hashlib
root=pathlib.Path(__file__).resolve().parent
manifest=json.loads((root/'sources.json').read_text())
out=root/'models';out.mkdir(exist_ok=True)
checks={}
for group in manifest.values():
    for name,path in group['files'].items():
        url=f"https://raw.githubusercontent.com/{group['repo']}/{group['sha']}/{group['root']}{path}"
        req=urllib.request.Request(url,headers={'User-Agent':'PhoenixArtPreview/1.0'})
        with urllib.request.urlopen(req,timeout=60) as response: data=response.read()
        if name.endswith('.glb') and (data[:4]!=b'glTF' or len(data)<100): raise ValueError(name+' is not a binary glTF model')
        (out/name).write_bytes(data)
        checks[name]={'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'source':url}
        print(name,len(data),flush=True)
(out/'checksums.json').write_text(json.dumps(checks,indent=2))

# Ship the pinned Meshopt decoder and its license with the offline art preview.
for filename, package_path in [
    ('meshopt_decoder.module.js', 'meshopt_decoder.module.js'),
    ('meshopt-LICENSE.md', 'LICENSE.md'),
]:
    url = 'https://cdn.jsdelivr.net/npm/meshoptimizer@0.22.0/' + package_path
    req = urllib.request.Request(url, headers={'User-Agent': 'PhoenixArtPreview/1.0'})
    with urllib.request.urlopen(req, timeout=60) as response:
        data = response.read()
    (root / filename).write_bytes(data)
    print(filename, len(data), flush=True)
