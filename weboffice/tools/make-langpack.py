#!/usr/bin/env python3
# Builds assets/lang/<lang>.data from an official LibreOffice Linux langpack.
# Needs: pip install brotli fonttools  (fonttools only for the CJK languages)
#
# Pack format (brotli-compressed as a whole):
#   uint32 LE header length | JSON header [{path, start, end}, ...] | concatenated file bytes
# Paths are absolute in the Emscripten FS (/instdir/...).
#
# ZetaOffice 24.2 (buildid efaf0670…) reports LIBO_VERSION 24.2.8.0, i.e. the
# libreoffice-24-2 branch after the final 24.2.7 release, so 24.2.7.2 langpacks match.

import argparse, glob, io, json, os, struct, subprocess, sys, tarfile, tempfile, urllib.request
import brotli

DEFAULT_VERSION = '24.2.7.2'
URL = 'https://downloadarchive.documentfoundation.org/libreoffice/old/{v}/deb/x86_64/LibreOffice_{v}_Linux_x86-64_deb_langpack_{l}.tar.gz'
NOTO_CJK_URL = 'https://github.com/notofonts/noto-cjk/raw/main/Sans/SubsetOTF/{r}/NotoSans{r}-Regular.otf'

# Base, Basic IDE, forms, report builder and wizards aren't linked into the WASM build.
UNUSED_DOMAINS = {'basctl', 'cnr', 'dba', 'for', 'frm', 'pcr', 'rpt', 'sb', 'wiz'}

# The base image has no CJK fonts. Ship Noto Sans Regular (LO synthesises bold) subset to the
# national standard repertoire, so documents render too, plus every character the UI uses.
CJK_FONTS = {
    'zh-CN': {'region': 'SC', 'codec': 'gb2312', 'hanja': True},
    'ko':    {'region': 'KR', 'codec': 'euc_kr', 'hanja': False},
}


QT_MENU_FONT = '/qt/menu-font.otf'


def download(url, dest):
    if not os.path.exists(dest):
        print('downloading', url, file=sys.stderr)
        urllib.request.urlretrieve(url, dest + '.part')
        os.rename(dest + '.part', dest)
    return dest


def fetch_langpack(version, lang, cache_dir):
    tgz = download(URL.format(v=version, l=lang), os.path.join(cache_dir, f'langpack_{version}_{lang}.tar.gz'))
    root = os.path.join(cache_dir, f'langpack_{version}_{lang}')
    if not os.path.isdir(root):
        os.makedirs(root + '.part', exist_ok=True)
        with tarfile.open(tgz) as t:
            debs = [m for m in t.getmembers() if m.name.endswith('.deb') and '-dict-' not in m.name]
            for m in debs:
                with tempfile.NamedTemporaryFile(suffix='.deb') as f:
                    f.write(t.extractfile(m).read())
                    f.flush()
                    subprocess.check_call(['dpkg-deb', '-x', f.name, root + '.part'])
        os.rename(root + '.part', root)
    opt = os.path.join(root, 'opt')
    return os.path.join(opt, os.listdir(opt)[0])


def collect(install):
    entries = []
    # gettext dir names use underscores, e.g. zh_CN
    for mo in sorted(glob.glob(os.path.join(install, 'program/resource/*/LC_MESSAGES/*.mo'))):
        if os.path.basename(mo)[:-3] not in UNUSED_DOMAINS:
            entries.append(('/instdir/' + os.path.relpath(mo, install), mo))
    for xcd in sorted(glob.glob(os.path.join(install, 'share/registry/**/*.xcd'), recursive=True)):
        entries.append(('/instdir/' + os.path.relpath(xcd, install), xcd))
    return entries


def ui_chars(entries):
    chars = set()
    for _, src in entries:
        data = open(src, 'rb').read()
        if src.endswith('.mo'):
            # translations only; msgids are English
            n, to = struct.unpack('<2I', data[8:12] + data[16:20])
            for i in range(n):
                l, o = struct.unpack('<2I', data[to + 8 * i:to + 8 * i + 8])
                chars |= set(data[o:o + l].decode('utf-8'))
        else:
            chars |= set(data.decode('utf-8'))
    return chars


def repertoire(codec, hanja):
    chars = set()
    for a in range(0xA1, 0xFF):
        for b in range(0xA1, 0xFF):
            try:
                c = bytes([a, b]).decode(codec)
            except UnicodeDecodeError:
                continue
            if hanja or not 0x4E00 <= ord(c) <= 0x9FFF:
                chars.add(c)
    return chars


def make_cjk_font(lang, entries, cache_dir, ui_only=False):
    from fontTools import subset
    from fontTools.ttLib import TTFont
    cfg = CJK_FONTS[lang]
    os.makedirs(os.path.join(cache_dir, 'fonts'), exist_ok=True)
    src = download(NOTO_CJK_URL.format(r=cfg['region']),
                   os.path.join(cache_dir, 'fonts', f"NotoSans{cfg['region']}-Regular.otf"))
    chars = ui_chars(entries) | {chr(i) for i in range(0x20, 0x7F)}
    if not ui_only:
        chars |= repertoire(cfg['codec'], cfg['hanja'])
    font = TTFont(src)
    opts = subset.Options()
    opts.layout_features = ['*']
    opts.name_IDs = ['*']
    opts.hinting = False
    # Qt picks fallback fonts by the OS/2 code page bits, which pruning clears for the UI-only subset
    opts.prune_codepage_ranges = False
    s = subset.Subsetter(opts)
    s.populate(unicodes=[ord(c) for c in chars if not 0xD800 <= ord(c) <= 0xDFFF])
    s.subset(font)
    out = os.path.join(cache_dir, 'fonts', f"NotoSans{cfg['region']}-Regular-{'ui' if ui_only else 'subset'}.otf")
    font.save(out)
    return out


def pack(entries):
    header, body, pos = [], io.BytesIO(), 0
    for path, src in entries:
        data = open(src, 'rb').read()
        header.append({'path': path, 'start': pos, 'end': pos + len(data)})
        body.write(data)
        pos += len(data)
    h = json.dumps(header, separators=(',', ':')).encode()
    raw = struct.pack('<I', len(h)) + h + body.getvalue()
    return raw, brotli.compress(raw, quality=11, lgwin=24)


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument('lang', nargs='+', help='LibreOffice language tag, e.g. de, zh-CN')
    ap.add_argument('--version', default=DEFAULT_VERSION)
    ap.add_argument('--out', default=os.path.join(here, '..', 'assets', 'lang'))
    ap.add_argument('--cache', default=os.path.join(here, '.langpack-cache'))
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    os.makedirs(args.cache, exist_ok=True)
    for lang in args.lang:
        entries = collect(fetch_langpack(args.version, lang, args.cache))
        if lang in CJK_FONTS:
            font = make_cjk_font(lang, entries, args.cache)
            # Qt's native menus only see fonts compiled into the WASM; index.html swaps this in.
            menu_font = make_cjk_font(lang, entries, args.cache, ui_only=True)
            entries.append(('/instdir/share/fonts/truetype/' + os.path.basename(font), font))
            entries.append((QT_MENU_FONT, menu_font))
        raw, compressed = pack(entries)
        out = os.path.join(args.out, lang + '.data')
        open(out, 'wb').write(compressed)
        print(f'{out}: {len(entries)} files, {len(raw)} bytes raw, {len(compressed)} compressed')


if __name__ == '__main__':
    main()
