FROM node:20-alpine AS build

COPY bin/install-libraries.sh /build/flux-ilias-object-field-value-storage/libs/flux-ilias-object-field-value-storage/bin/install-libraries.sh
RUN /build/flux-ilias-object-field-value-storage/libs/flux-ilias-object-field-value-storage/bin/install-libraries.sh

RUN ln -s libs/flux-ilias-object-field-value-storage/bin /build/flux-ilias-object-field-value-storage/bin

COPY . /build/flux-ilias-object-field-value-storage/libs/flux-ilias-object-field-value-storage

FROM node:20-alpine

USER node:node

ENTRYPOINT ["/flux-ilias-object-field-value-storage/bin/server.mjs"]

COPY --from=build /build /
