#!/usr/bin/env sh

set -e

bin="`dirname "$0"`"
root="$bin/.."
libs="$root/.."

checkAlreadyInstalled() {
    if [ `ls "$libs" | wc -l` != "1" ]; then
        echo "Already installed" >&2
        exit 1
    fi
}

installLibrary() {
    (mkdir -p "$libs/$1" && cd "$libs/$1" && wget -O - "$2" | tar -xz --strip-components=1)
}

checkAlreadyInstalled

installLibrary flux-authentication-backend https://github.com/fluxfw/flux-authentication-backend/archive/refs/tags/v2023-04-20-2.tar.gz

installLibrary flux-config-api https://github.com/fluxfw/flux-config-api/archive/refs/tags/v2023-04-12-1.tar.gz

installLibrary flux-form https://github.com/fluxfw/flux-form/archive/refs/tags/v2023-05-10-1.tar.gz

installLibrary flux-http-api https://github.com/fluxfw/flux-http-api/archive/refs/tags/v2023-04-20-1.tar.gz

installLibrary flux-shutdown-handler https://github.com/fluxfw/flux-shutdown-handler/archive/refs/tags/v2023-03-16-1.tar.gz
