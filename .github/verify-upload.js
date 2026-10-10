// 올린 파일 확인: latest.yml의 senSignature가 쎈Clean 공개키로 맞는지, 설치 파일 SHA-512·크기가 같은지.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const dir = process.argv[2];
const PUB = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAGgkFQYwKBX6OudORSGWceYx6jDLvPOlHtHIUUAqIKFw=
-----END PUBLIC KEY-----
`;
const text = fs.readFileSync(path.join(dir, 'latest.yml'), 'utf8');
const get = (re) => { const m = text.match(re); if (!m) throw new Error(`latest.yml에 ${re} 없음`); return m[1].trim().replace(/^['"]|['"]$/g, ''); };
const version = get(/^version:\s*(.+)$/m);
const url = get(/^\s+- url:\s*(.+)$/m);
const sha512 = get(/^\s+sha512:\s*(.+)$/m);
const size = get(/^\s+size:\s*(\d+)$/m);
const sig = get(/^senSignature:\s*(.+)$/m);
if (url !== `SenClean-Setup-${version}.exe`) throw new Error(`파일 이름이 다름: ${url}`);
const msg = Buffer.from(['sen-clean-update-v1', version, url, sha512, size].join('\n'), 'utf8');
if (!crypto.verify(null, msg, crypto.createPublicKey(PUB), Buffer.from(sig, 'base64'))) throw new Error('서명이 맞지 않아요');
const exe = fs.readFileSync(path.join(dir, url));
if (String(exe.length) !== size) throw new Error('크기가 다름');
if (crypto.createHash('sha512').update(exe).digest('base64') !== sha512) throw new Error('SHA-512가 다름');
for (const f of [`${url}.blockmap`, 'release-notes.md']) if (!fs.existsSync(path.join(dir, f))) throw new Error(`${f} 없음`);
fs.appendFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `version=${version}\n`);
console.log(`확인 완료: 쎈Clean ${version} (${(exe.length / 1048576).toFixed(1)}MB)`);
