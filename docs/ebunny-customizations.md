# Existing eBunny cabinet design

This branch preserves the existing eBunny customer and admin interface before
development of separate BS/WL traffic accounting. It does not introduce a BS
traffic API, a new billing workflow, or production deployment changes.

## Import source and scope

- Uploaded archive: `ebunny-cabinet-source-20261025-191137.tar.gz`.
- Fork base: `a693d30ca6084b9a54b45a72294b99237841ef13`, version 1.80.1.
- The source archive has 14 changed files and 19 additional files relative to
  this base. All other 1,032 archived files match the base.
- `package.json` and `package-lock.json` match the fork and are unchanged.

Preserved presentation includes the eBunny wordmark and rabbit banner, customer
and admin CSS, bundled fonts with their licenses, login layout, home banner,
subscription cards, headers, and theme controls. The theme editor retains its
temporary palette preview; leaving it restores the eBunny palette. The archive's
theme provider regression tests are included.

The server-oriented `Dockerfile.prebuilt`, its ignore file, `install-ebunny.sh`,
and `README-EBUNNY.txt` are retained as supplied. The installer targets the
existing DE-13 deployment and is not a local setup or validation command.

## Local validation

Node >=24.15.0 is required. From this repository:

```sh
npm ci --ignore-scripts
VITE_APP_NAME=eBunny npm run build
npm test -- --maxWorkers=2
git diff --check -- . ':!public/ebunny/fonts/*-OFL.txt'
```

Run the build and full test suite separately on machines with a four-core CPU
quota. A previous concurrent build and four-worker test run hit a loading-test
timeout; the affected file and a subsequent full two-worker run passed without
changing assertions or increasing timeouts.

Font license notices are preserved byte for byte from the archive, including
their original CRLF line endings and trailing spaces. They are the only files
excluded from the application-source whitespace check above.

For internal static-delivery checks after building:

```sh
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
```

Check `/`, `/login`, their referenced build assets, and the image/font files
under `/ebunny/`. Static delivery and mocked component tests do not validate
production login, payments, or VPN access.

## Build and deployment boundaries

The supplied source archive did not contain `dist`; build output is generated
locally and is not committed. The archived server README also describes a
different distribution containing prebuilt files. `Dockerfile.prebuilt` requires
a populated `dist` directory before it can build an image.

`VITE_APP_NAME=eBunny` is a local branding setting used in validation. Obtain the
actual production `VITE_*` settings and reverse-proxy configuration before
preparing a deployment build; do not infer the production API address from
these checks. The server installer has not been executed as part of this import.

The separate branded subscription page shown in project screenshots is outside
this cabinet repository and is not included in the uploaded source archive.
