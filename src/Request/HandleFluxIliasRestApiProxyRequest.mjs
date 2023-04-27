import { HttpServerRequest } from "../../../flux-http-api/src/Server/HttpServerRequest.mjs";
import { HttpServerResponse } from "../../../flux-http-api/src/Server/HttpServerResponse.mjs";

/** @typedef {import("../../../flux-authentication-backend/src/FluxAuthenticationBackend.mjs").FluxAuthenticationBackend} FluxAuthenticationBackend */
/** @typedef {import("../FluxFieldValueStorage/FluxFieldValueStorageService.mjs").FluxFieldValueStorageService} FluxFieldValueStorageService */
/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */

export class HandleFluxIliasRestApiProxyRequest {
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
     * @param {FluxAuthenticationBackend} flux_authentication_backend
     * @param {FluxFieldValueStorageService} flux_field_value_storage_service
     * @param {FluxHttpApi} flux_http_api
     * @returns {HandleFluxIliasRestApiProxyRequest}
     */
    static new(flux_authentication_backend, flux_field_value_storage_service, flux_http_api) {
        return new this(
            flux_authentication_backend,
            flux_field_value_storage_service,
            flux_http_api
        );
    }

    /**
     * @param {FluxAuthenticationBackend} flux_authentication_backend
     * @param {FluxFieldValueStorageService} flux_field_value_storage_service
     * @param {FluxHttpApi} flux_http_api
     * @private
     */
    constructor(flux_authentication_backend, flux_field_value_storage_service, flux_http_api) {
        this.#flux_authentication_backend = flux_authentication_backend;
        this.#flux_field_value_storage_service = flux_field_value_storage_service;
        this.#flux_http_api = flux_http_api;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse | null>}
     */
    async handleFluxIliasRestApiProxyRequest(request) {
        const user_infos = await this.#flux_authentication_backend.handleAuthentication(
            request
        );

        if (user_infos instanceof HttpServerResponse) {
            return user_infos;
        }

        if (!request.url.pathname.startsWith("/flux-ilias-rest-api-proxy/")) {
            return null;
        }

        return (await import("./HandleApiRequest.mjs")).HandleApiRequest.new(
            this.#flux_field_value_storage_service,
            this.#flux_http_api
        )
            .handleApiRequest(
                HttpServerRequest.new(
                    new URL(`/api/${request.url.pathname.substring(27)}${request.url.search}`, request.url.origin),
                    request.body,
                    request.method,
                    request.headers,
                    request.cookies,
                    null,
                    request._res
                )
            );
    }
}
