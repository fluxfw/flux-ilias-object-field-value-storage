import { HttpServerResponse } from "../../../flux-http-api/src/Server/HttpServerResponse.mjs";

/** @typedef {import("../../../flux-authentication-backend/src/FluxAuthenticationBackend.mjs").FluxAuthenticationBackend} FluxAuthenticationBackend */
/** @typedef {import("../FluxFieldValueStorage/FluxFieldValueStorageService.mjs").FluxFieldValueStorageService} FluxFieldValueStorageService */
/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class HandleRequest {
    /**
     * @type {FluxAuthenticationBackend}
     */
    #flux_authentication_backend;
    /**
     * @type {FluxFieldValueStorageService}
     */
    #flux_field_value_storage_service;
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;
    /**
     * @type {FluxAuthenticationBackend}
     */
    #flux_ilias_rest_api_proxy_flux_authentication_backend;

    /**
     * @param {FluxAuthenticationBackend} flux_authentication_backend
     * @param {FluxFieldValueStorageService} flux_field_value_storage_service
     * @param {FluxHttpApi} flux_http_api
     * @param {FluxAuthenticationBackend} flux_ilias_rest_api_proxy_flux_authentication_backend
     * @returns {HandleRequest}
     */
    static new(flux_authentication_backend, flux_field_value_storage_service, flux_http_api, flux_ilias_rest_api_proxy_flux_authentication_backend) {
        return new this(
            flux_authentication_backend,
            flux_field_value_storage_service,
            flux_http_api,
            flux_ilias_rest_api_proxy_flux_authentication_backend
        );
    }

    /**
     * @param {FluxAuthenticationBackend} flux_authentication_backend
     * @param {FluxFieldValueStorageService} flux_field_value_storage_service
     * @param {FluxHttpApi} flux_http_api
     * @param {FluxAuthenticationBackend} flux_ilias_rest_api_proxy_flux_authentication_backend
     * @private
     */
    constructor(flux_authentication_backend, flux_field_value_storage_service, flux_http_api, flux_ilias_rest_api_proxy_flux_authentication_backend) {
        this.#flux_authentication_backend = flux_authentication_backend;
        this.#flux_field_value_storage_service = flux_field_value_storage_service;
        this.#flux_http_api = flux_http_api;
        this.#flux_ilias_rest_api_proxy_flux_authentication_backend = flux_ilias_rest_api_proxy_flux_authentication_backend;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse | null>}
     */
    async handleRequest(request) {
        if (request.url.pathname.startsWith("/ui/") || request.url.pathname === "/ui") {
            return (await import("./HandleUIRequest.mjs")).HandleUIRequest.new(
                this.#flux_field_value_storage_service
            )
                .handleUIRequest(
                    request
                );
        }

        const user_infos = await this.#flux_authentication_backend.handleAuthentication(
            request
        );

        if (user_infos instanceof HttpServerResponse) {
            return user_infos;
        }

        if (request.url.pathname.startsWith("/api/") || request.url.pathname === "/api") {
            return (await import("./HandleApiRequest.mjs")).HandleApiRequest.new(
                this.#flux_field_value_storage_service,
                this.#flux_http_api
            )
                .handleApiRequest(
                    request
                );
        }

        if (request.url.pathname.startsWith("/flux-ilias-rest-api-proxy/") || request.url.pathname === "/flux-ilias-rest-api-proxy") {
            return (await import("./HandleFluxIliasRestApiProxyRequest.mjs")).HandleFluxIliasRestApiProxyRequest.new(
                this.#flux_ilias_rest_api_proxy_flux_authentication_backend,
                this.#flux_field_value_storage_service,
                this.#flux_http_api
            )
                .handleFluxIliasRestApiProxyRequest(
                    request
                );
        }

        return null;
    }
}
