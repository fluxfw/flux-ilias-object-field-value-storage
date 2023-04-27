import { CONFIG_ENV_PREFIX } from "./Config/CONFIG.mjs";
import { PROTOCOL_DEFAULT_PORT } from "../../flux-http-api/src/Protocol/PROTOCOL_DEFAULT_PORT.mjs";
import { AUTHENTICATION_CONFIG_DEFAULT_USER, AUTHENTICATION_CONFIG_PASSWORD_KEY, AUTHENTICATION_CONFIG_USER_KEY } from "./Authentication/AUTHENTICATION_CONFIG.mjs";
import { FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_HOST, FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_PROTOCOL, FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_USER, FLUX_FIELD_VALUE_STORAGE_CONFIG_HOST_KEY, FLUX_FIELD_VALUE_STORAGE_CONFIG_HTTPS_CERTIFICATE_KEY, FLUX_FIELD_VALUE_STORAGE_CONFIG_PASSWORD_KEY, FLUX_FIELD_VALUE_STORAGE_CONFIG_PORT_KEY, FLUX_FIELD_VALUE_STORAGE_CONFIG_PROTOCOL_KEY, FLUX_FIELD_VALUE_STORAGE_CONFIG_USER_KEY } from "./FluxFieldValueStorage/FLUX_FIELD_VALUE_STORAGE_CONFIG.mjs";
import { ILIAS_CONFIG_CLIENT_KEY, ILIAS_CONFIG_DEFAULT_CLIENT, ILIAS_CONFIG_DEFAULT_PROTOCOL, ILIAS_CONFIG_DEFAULT_USER, ILIAS_CONFIG_HOST_KEY, ILIAS_CONFIG_HTTPS_CERTIFICATE_KEY, ILIAS_CONFIG_PASSWORD_KEY, ILIAS_CONFIG_PORT_KEY, ILIAS_CONFIG_PROTOCOL_KEY, ILIAS_CONFIG_USER_KEY } from "./Ilias/ILIAS_CONFIG.mjs";
import { SERVER_CONFIG_DISABLE_HTTP_IF_HTTPS_KEY, SERVER_CONFIG_HTTPS_CERTIFICATE_KEY, SERVER_CONFIG_HTTPS_DHPARAM_KEY, SERVER_CONFIG_HTTPS_KEY_KEY, SERVER_CONFIG_LISTEN_HTTP_PORT_KEY, SERVER_CONFIG_LISTEN_HTTPS_PORT_KEY, SERVER_CONFIG_LISTEN_INTERFACE_KEY, SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_KEY, SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_PORT_KEY, SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE_KEY } from "./Server/SERVER_CONFIG.mjs";
import { SERVER_DEFAULT_DISABLE_HTTP_IF_HTTPS, SERVER_DEFAULT_LISTEN_HTTP_PORT, SERVER_DEFAULT_LISTEN_HTTPS_PORT, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT, SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE } from "../../flux-http-api/src/Server/SERVER.mjs";

/** @typedef {import("../../flux-authentication-backend/src/FluxAuthenticationBackend.mjs").FluxAuthenticationBackend} FluxAuthenticationBackend */
/** @typedef {import("../../flux-config-api/src/FluxConfigApi.mjs").FluxConfigApi} FluxConfigApi */
/** @typedef {import("./FluxFieldValueStorage/FluxFieldValueStorageService.mjs").FluxFieldValueStorageService} FluxFieldValueStorageService */
/** @typedef {import("../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../flux-shutdown-handler/src/FluxShutdownHandler.mjs").FluxShutdownHandler} FluxShutdownHandler */
/** @typedef {import("./Ilias/IliasService.mjs").IliasService} IliasService */

export class FluxIliasObjectFieldValueStorage {
    /**
     * @type {FluxAuthenticationBackend | null}
     */
    #flux_authentication_backend = null;
    /**
     * @type {FluxConfigApi | null}
     */
    #flux_config_api = null;
    /**
     * @type {FluxFieldValueStorageService | null}
     */
    #flux_field_value_storage_service = null;
    /**
     * @type {FluxHttpApi | null}
     */
    #flux_http_api = null;
    /**
     * @type {FluxAuthenticationBackend | null}
     */
    #flux_ilias_rest_api_proxy_flux_authentication_backend = null;
    /**
     * @type {FluxShutdownHandler}
     */
    #flux_shutdown_handler;
    /**
     * @type {IliasService | null}
     */
    #ilias_service = null;

    /**
     * @param {FluxShutdownHandler} flux_shutdown_handler
     * @returns {FluxIliasObjectFieldValueStorage}
     */
    static new(flux_shutdown_handler) {
        return new this(
            flux_shutdown_handler
        );
    }

    /**
     * @param {FluxShutdownHandler} flux_shutdown_handler
     * @private
     */
    constructor(flux_shutdown_handler) {
        this.#flux_shutdown_handler = flux_shutdown_handler;
    }

    /**
     * @returns {Promise<void>}
     */
    async runServer() {
        const flux_config_api = await this.#getFluxConfigApi();

        await (await this.#getFluxHttpApi()).runServer(
            async request => (await import("./Request/HandleRequest.mjs")).HandleRequest.new(
                await this.#getFluxAuthenticationBackend(),
                await this.#getFluxFieldValueStorageService(),
                await this.#getFluxHttpApi(),
                await this.#getFluxIliasRestApiProxyFluxAuthenticationBackend()
            )
                .handleRequest(
                    request
                ),
            {
                disable_http_if_https: await flux_config_api.getConfig(
                    SERVER_CONFIG_DISABLE_HTTP_IF_HTTPS_KEY,
                    SERVER_DEFAULT_DISABLE_HTTP_IF_HTTPS
                ),
                https_certificate: await flux_config_api.getConfig(
                    SERVER_CONFIG_HTTPS_CERTIFICATE_KEY,
                    null,
                    false
                ),
                https_dhparam: await flux_config_api.getConfig(
                    SERVER_CONFIG_HTTPS_DHPARAM_KEY,
                    null,
                    false
                ),
                https_key: await flux_config_api.getConfig(
                    SERVER_CONFIG_HTTPS_KEY_KEY,
                    null,
                    false
                ),
                listen_http_port: await flux_config_api.getConfig(
                    SERVER_CONFIG_LISTEN_HTTP_PORT_KEY,
                    SERVER_DEFAULT_LISTEN_HTTP_PORT
                ),
                listen_https_port: await flux_config_api.getConfig(
                    SERVER_CONFIG_LISTEN_HTTPS_PORT_KEY,
                    SERVER_DEFAULT_LISTEN_HTTPS_PORT
                ),
                listen_interface: await flux_config_api.getConfig(
                    SERVER_CONFIG_LISTEN_INTERFACE_KEY,
                    null,
                    false
                ),
                redirect_http_to_https: await flux_config_api.getConfig(
                    SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_KEY,
                    SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS
                ),
                redirect_http_to_https_port: await flux_config_api.getConfig(
                    SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_PORT_KEY,
                    SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_PORT
                ),
                redirect_http_to_https_status_code: await flux_config_api.getConfig(
                    SERVER_CONFIG_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE_KEY,
                    SERVER_DEFAULT_REDIRECT_HTTP_TO_HTTPS_STATUS_CODE
                )
            }
        );
    }

    /**
     * @returns {Promise<FluxAuthenticationBackend>}
     */
    async #getFluxAuthenticationBackend() {
        if (this.#flux_authentication_backend === null) {
            const flux_config_api = await this.#getFluxConfigApi();

            this.#flux_authentication_backend ??= (await import("../../flux-authentication-backend/src/FluxBasicAuthenticationBackend.mjs")).FluxBasicAuthenticationBackend.new(
                await this.#getFluxHttpApi(),
                {
                    [await flux_config_api.getConfig(
                        AUTHENTICATION_CONFIG_USER_KEY,
                        AUTHENTICATION_CONFIG_DEFAULT_USER
                    )]: await flux_config_api.getConfig(
                        AUTHENTICATION_CONFIG_PASSWORD_KEY
                    )
                }
            );
        }

        return this.#flux_authentication_backend;
    }

    /**
     * @returns {Promise<FluxConfigApi>}
     */
    async #getFluxConfigApi() {
        this.#flux_config_api ??= (await import("../../flux-config-api/src/FluxConfigApi.mjs")).FluxConfigApi.new(
            await (await import("../../flux-config-api/src/getValueProviderImplementations.mjs")).getValueProviderImplementations(
                CONFIG_ENV_PREFIX
            )
        );

        return this.#flux_config_api;
    }

    /**
     * @returns {Promise<FluxFieldValueStorageService>}
     */
    async #getFluxFieldValueStorageService() {
        if (this.#flux_field_value_storage_service === null) {
            const flux_config_api = await this.#getFluxConfigApi();

            const protocol = await flux_config_api.getConfig(
                FLUX_FIELD_VALUE_STORAGE_CONFIG_PROTOCOL_KEY,
                FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_PROTOCOL
            );

            this.#flux_field_value_storage_service ??= (await import("./FluxFieldValueStorage/FluxFieldValueStorageService.mjs")).FluxFieldValueStorageService.new(
                await this.#getFluxHttpApi(),
                await this.#getIliasService(),
                await flux_config_api.getConfig(
                    FLUX_FIELD_VALUE_STORAGE_CONFIG_PASSWORD_KEY
                ),
                await flux_config_api.getConfig(
                    FLUX_FIELD_VALUE_STORAGE_CONFIG_HOST_KEY,
                    FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_HOST
                ),
                await flux_config_api.getConfig(
                    FLUX_FIELD_VALUE_STORAGE_CONFIG_USER_KEY,
                    FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_USER
                ),
                protocol,
                await flux_config_api.getConfig(
                    FLUX_FIELD_VALUE_STORAGE_CONFIG_PORT_KEY,
                    PROTOCOL_DEFAULT_PORT[protocol] ?? null
                ),
                await flux_config_api.getConfig(
                    FLUX_FIELD_VALUE_STORAGE_CONFIG_HTTPS_CERTIFICATE_KEY,
                    null,
                    false
                )
            );
        }

        return this.#flux_field_value_storage_service;
    }

    /**
     * @returns {Promise<FluxHttpApi>}
     */
    async #getFluxHttpApi() {
        this.#flux_http_api ??= (await import("../../flux-http-api/src/FluxHttpApi.mjs")).FluxHttpApi.new(
            this.#flux_shutdown_handler
        );

        return this.#flux_http_api;
    }

    /**
     * @returns {Promise<FluxAuthenticationBackend>}
     */
    async #getFluxIliasRestApiProxyFluxAuthenticationBackend() {
        this.#flux_ilias_rest_api_proxy_flux_authentication_backend ??= (await import("./Authentication/FluxIliasRestApiProxyAuthenticationBackend.mjs")).FluxIliasRestApiProxyAuthenticationBackend.new(
            await this.#getIliasService()
        );

        return this.#flux_ilias_rest_api_proxy_flux_authentication_backend;
    }

    /**
     * @returns {Promise<IliasService>}
     */
    async #getIliasService() {
        if (this.#ilias_service === null) {
            const flux_config_api = await this.#getFluxConfigApi();

            const protocol = await flux_config_api.getConfig(
                ILIAS_CONFIG_PROTOCOL_KEY,
                ILIAS_CONFIG_DEFAULT_PROTOCOL
            );

            this.#ilias_service ??= (await import("./Ilias/IliasService.mjs")).IliasService.new(
                await this.#getFluxHttpApi(),
                await flux_config_api.getConfig(
                    ILIAS_CONFIG_HOST_KEY
                ),
                await flux_config_api.getConfig(
                    ILIAS_CONFIG_PASSWORD_KEY
                ),
                await flux_config_api.getConfig(
                    ILIAS_CONFIG_USER_KEY,
                    ILIAS_CONFIG_DEFAULT_USER
                ),
                await flux_config_api.getConfig(
                    ILIAS_CONFIG_CLIENT_KEY,
                    ILIAS_CONFIG_DEFAULT_CLIENT
                ),
                protocol,
                await flux_config_api.getConfig(
                    ILIAS_CONFIG_PORT_KEY,
                    PROTOCOL_DEFAULT_PORT[protocol] ?? null
                ),
                await flux_config_api.getConfig(
                    ILIAS_CONFIG_HTTPS_CERTIFICATE_KEY,
                    null,
                    false
                )
            );
        }

        return this.#ilias_service;
    }
}
