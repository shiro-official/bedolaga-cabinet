#!/usr/bin/env bash
# Installs the already-built eBunny UI on the existing DE-13 deployment.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
test -s dist/index.html
compose_dir=/opt/bedolaga-cabinet
test -f "$compose_dir/docker-compose.yml"
docker inspect bedolaga_cabinet >/dev/null
umask 077
stamp=$(date +%Y%m%d-%H%M%S)
backup="/root/ebunny-cabinet-design-backup-$stamp"
mkdir -p "$backup"
cp -a "$compose_dir/docker-compose.yml" "$backup/docker-compose.yml"
old_image=$(docker inspect --format '{{.Image}}' bedolaga_cabinet)
docker image tag "$old_image" "ebunny-cabinet:before-design-$stamp"
printf '%s\n' "$old_image" > "$backup/image-id.txt"
printf '%s\n' "ebunny-cabinet:before-design-$stamp" > "$backup/image-tag.txt"
# Build before changing the running deployment.
docker build -f Dockerfile.prebuilt -t "ebunny-cabinet:design-$stamp" .
python3 - "$compose_dir/docker-compose.yml" "ebunny-cabinet:design-$stamp" <<'PATCH'
import re,sys
from pathlib import Path
p=Path(sys.argv[1]);s=p.read_text()
assert 'container_name: bedolaga_cabinet' in s, 'Unexpected container name'
assert len(re.findall(r'^\s+image:',s,re.M))==1, 'Expected exactly one service image'
s,n=re.subn(r'^(\s+image:)\s*[^\n]+',lambda m:m.group(1)+' '+sys.argv[2],s,count=1,flags=re.M)
assert n==1
p.write_text(s)
PATCH
cd "$compose_dir"
docker compose config --quiet
docker compose up -d --no-deps cabinet
docker compose ps
printf '\nГотово. Резервная копия: %s\n' "$backup"
printf 'Проверьте my.ebunny.site: вход, админку, пользователей, тарифы и обе темы.\n'
