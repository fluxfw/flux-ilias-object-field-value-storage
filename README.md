# flux-ilias-object-field-value-storage

Ilias object field value storage

## Set up

*You need to fill placeholders (Wrapped in `%`), create secret files and adjust to your needs (Applies everywhere)*

### flux-field-value-storage

You need a `flux-field-value-storage` server

[Set up](https://github.com/fluxfw/flux-field-value-storage/blob/main/README.md#set-up)

### Docker

#### Compose

```yaml
services:
    flux-ilias-object-field-value-storage:
        depends_on:
            - flux-field-value-storage
        environment:
            - FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_AUTHENTICATION_PASSWORD_FILE=/run/secrets/flux_ilias_object_field_value_storage_password
            - FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_PASSWORD_FILE=/run/secrets/flux_field_value_storage_password
            - FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_HOST=%ilias-host%
            - FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_PASSWORD_FILE=/run/secrets/ilias_rest_password
        image: fluxfw/flux-ilias-object-field-value-storage:%version%
        secrets:
            - flux_field_value_storage_password
            - flux_ilias_object_field_value_storage_password
            - ilias_rest_password
secrets:
    flux_ilias_object_field_value_storage_password:
        file: ./data/secrets/flux_ilias_object_field_value_storage_password
    ilias_rest_password:
        file: ./data/secrets/ilias_rest_password
```

If you use `flux-ilias` on the same compose file (Or same network)

```yaml
services:
    flux-ilias-object-field-value-storage:
        environment:
            - FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_HOST=nginx
            - FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_PROTOCOL=http
```

### Config

| Config | Default value | Environment variable | Cli parameter | Config JSON file |
| ------ | ------------- | -------------------- | ------------- | ---------------- |
| Config JSON file<br>(Root entry need to be an object) | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_CONFIG_FILE` | `--config-file ...` | *-* |
| **Authentication password** | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_AUTHENTICATION_PASSWORD`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_AUTHENTICATION_PASSWORD_FILE` | `--authentication-password ...`<br>`--authentication-password-file ...` | `"authentication-password": "..."`<br>`"authentication-password-file": "..."` |
| Authentication user | `flux-ilias-object-field-value-storage` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_AUTHENTICATION_USER`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_AUTHENTICATION_USER_FILE` | `--authentication-user ...`<br>`--authentication-user-file ...` | `"authentication-user": "..."`<br>`"authentication-user-file": "..."` |
| flux-field-value-storage host | `flux-field-value-storage` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_HOST`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_HOST_FILE` | `--flux-field-value-storage-host ...`<br>`--flux-field-value-storage-host-file ...` | `"flux-field-value-storage-host": "..."`<br>`"flux-field-value-storage-host-file": "..."` |
| flux-field-value-storage HTTPS certificate<br>(For trust self signed) | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_HTTPS_CERTIFICATE`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_HTTPS_CERTIFICATE_FILE` | `--flux-field-value-storage-https-certificate ...`<br>`--flux-field-value-storage-https-certificate-file ...` | `"flux-field-value-storage-https-certificate": "..."`<br>`"flux-field-value-storage-https-certificate-file": "..."` |
| **flux-field-value-storage password** | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_PASSWORD`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_PASSWORD_FILE` | `--flux-field-value-storage-password ...`<br>`--flux-field-value-storage-password-file ...` | `"flux-field-value-storage-password": "..."`<br>`"flux-field-value-storage-password-file": "..."` |
| flux-field-value-storage port | (`443` or `80`) | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_PORT`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_PORT_FILE` | `--flux-field-value-storage-port ...`<br>`--flux-field-value-storage-port-file ...` | `"flux-field-value-storage-port": ...`<br>`"flux-field-value-storage-port-file": ...` |
| flux-field-value-storage protocol | `http` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_PROTOCOL`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_PROTOCOL_FILE` | `--flux-field-value-storage-protocol ...`<br>`--flux-field-value-storage-protocol-file ...` | `"flux-field-value-storage-protocol": "..."`<br>`"flux-field-value-storage-protocol-file": "..."` |
| flux-field-value-storage user | `flux-field-value-storage` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_USER`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_FLUX_FIELD_VALUE_STORAGE_USER_FILE` | `--flux-field-value-storage-user ...`<br>`--flux-field-value-storage-user-file ...` | `"flux-field-value-storage-user": "..."`<br>`"flux-field-value-storage-user-file": "..."` |
| ILIAS client | `default` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_CLIENT`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_CLIENT_FILE` | `--ilias-client ...`<br>`--ilias-client-file ...` | `"ilias-client": "..."`<br>`"ilias-client-file": "..."` |
| **ILIAS host** | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_HOST`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_HOST_FILE` | `--ilias-host ...`<br>`--ilias-host-file ...` | `"ilias-host": "..."`<br>`"ilias-host-file": "..."` |
| ILIAS HTTPS certificate<br>(For trust self signed) | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_HTTPS_CERTIFICATE`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_HTTPS_CERTIFICATE_FILE` | `--ilias-https-certificate ...`<br>`--ilias-https-certificate-file ...` | `"ilias-https-certificate": "..."`<br>`"ilias-https-certificate-file": "..."` |
| **ILIAS password** | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_PASSWORD`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_PASSWORD_FILE` | `--ilias-password ...`<br>`--ilias-password-file ...` | `"ilias-password": "..."`<br>`"ilias-password-file": "..."` |
| ILIAS port | (`443` or `80`) | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_PORT`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_PORT_FILE` | `--ilias-port ...`<br>`--ilias-port-file ...` | `"ilias-port": ...`<br>`"ilias-port-file": ...` |
| ILIAS protocol | `https` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_PROTOCOL`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_PROTOCOL_FILE` | `--ilias-protocol ...`<br>`--ilias-protocol-file ...` | `"ilias-protocol": "..."`<br>`"ilias-protocol-file": "..."` |
| ILIAS user | `rest` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_USER`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_ILIAS_USER_FILE` | `--ilias-user ...`<br>`--ilias-user-file ...` | `"ilias-user": "..."`<br>`"ilias-user-file": "..."` |
| Server disable http if https is used | `true` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_DISABLE_HTTP_IF_HTTPS`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_DISABLE_HTTP_IF_HTTPS_FILE` | `--server-disable-http-if-https ...`<br>`--server-disable-http-if-https-file ...` | `"server-disable-http-if-https": ...`<br>`"server-disable-http-if-https-file": "..."` |
| Server HTTPS certificate<br>(HTTPS is only used if this config is set) | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_HTTPS_CERTIFICATE`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_HTTPS_CERTIFICATE_FILE` | `--server-https-certificate ...`<br>`--server-https-certificate-file ...` | `"server-https-certificate": "..."`<br>`"server-https-certificate-file": "..."` |
| Server HTTPS dh param | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_HTTPS_DHPARAM`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_HTTPS_DHPARAM_FILE` | `--server-https-dhparam ...`<br>`--server-https-dhparam-file ...` | `"server-https-dhparam": "..."`<br>`"server-https-dhparam-file": "..."` |
| Server HTTPS private key<br>(HTTPS is only used if this config is set) | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_HTTPS_KEY`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_HTTPS_KEY_FILE` | `--server-https-key ...`<br>`--server-https-key-file ...` | `"server-https-key": "..."`<br>`"server-https-key-file": "..."` |
| Server listen HTTP port<br>(Set to `0` for explicit disable HTTP) | `80` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_LISTEN_HTTP_PORT`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_LISTEN_HTTP_PORT_FILE` | `--server-listen-http-port ...`<br>`--server-listen-http-port-file ...` | `"server-listen-http-port": ...`<br>`"server-listen-http-port-file": "..."` |
| Server listen HTTPS port<br>(Set to `0` for explicit disable HTTPS) | `443` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_LISTEN_HTTPS_PORT`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_LISTEN_HTTPS_PORT_FILE` | `--server-listen-https-port ...`<br>`--server-listen-https-port-file ...` | `"server-listen-https-port": ...`<br>`"server-listen-https-port-file": "..."` |
| Server listen interface | *-* | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_LISTEN_INTERFACE`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_LISTEN_INTERFACE_FILE` | `--server-listen-interface ...`<br>`--server-listen-interface-file ...` | `"server-listen-interface": "..."`<br>`"server-listen-interface-file": "..."` |
| Enable server redirects HTTP to HTTPS | `false` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_FILE` | `--server-redirect-http-to-https ...`<br>`--server-redirect-http-to-https-file ...` | `"server-redirect-http-to-https": ...`<br>`"server-redirect-http-to-https-file": "..."` |
| Server redirect HTTP to HTTPS port | `443` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_PORT`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_PORT_FILE` | `--server-redirect-http-to-https-port ...`<br>`--server-redirect-http-to-https-port-file ...` | `"server-redirect-http-to-https-port": ...`<br>`"server-redirect-http-to-https-port-file": "..."` |
| HTTP status code server redirects HTTP to HTTPS | `302` | `FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE`<br>`FLUX_ILIAS_OBJECT_FIELD_VALUE_STORAGE_SERVER_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE_FILE` | `--server-redirect-http-to-https-status-code ...`<br>`--server-redirect-http-to-https-status-code-file ...` | `"server-redirect-http-to-https-status-code": ...`<br>`"server-redirect-http-to-https-status-code-file": "..."` |

Required config are **bold**

### flux-ilias-rest-api

You need `flux-ilias-rest-api` on your ILIAS server

[Set up](https://github.com/fluxfw/flux-ilias-rest-api/blob/main/README.md#installation)

#### In [flux-ilias-nginx-base](https://github.com/fluxfw/flux-ilias-nginx-base)

```dockerfile
RUN echo -e 'location /flux-ilias-object-field-value-storage/ui/ {\n    proxy_pass http://flux-ilias-object-field-value-storage/ui/;\n    proxy_pass_request_headers off;\n}\nrewrite ^/flux-ilias-object-field-value-storage/api/(.*)$ /flux-ilias-rest-api-proxy/flux-ilias-object-field-value-storage/$1;' > /flux-ilias-nginx-base/src/custom/flux-ilias-object-field-value-storage.conf
```

#### Web Proxy

Target key: `flux-ilias-object-field-value-storage`

iframe url: `https://%ilias-host%/flux-ilias-object-field-value-storage/ui/`

Page title: `flux-ilias-object-field-value-storage`

Short title: `flux-ilias-object`

View title: `field-value-storage`

Menu item: Yes

Menu title: `flux-ilias-object-field-value-storage`

Custom menu icon url: `https://%ilias-host%/templates/default/images/outlined/icon_dcl.svg`

Visible menu item only for users with administrator role: Yes

#### Api Proxy

Target key: `flux-ilias-object-field-value-storage`

Url: `http://flux-ilias-object-field-value-storage/flux-ilias-rest-api-proxy`

User: `flux-ilias-object-field-value-storage`

Password: %...%
