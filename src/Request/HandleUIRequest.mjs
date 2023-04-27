/** @typedef {import("../FluxFieldValueStorage/FluxFieldValueStorageService.mjs").FluxFieldValueStorageService} FluxFieldValueStorageService */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */

export class HandleUIRequest {
    /**
     * @type {FluxFieldValueStorageService}
     */
    #flux_field_value_storage_service;

    /**
     * @param {FluxFieldValueStorageService} flux_field_value_storage_service
     * @returns {HandleUIRequest}
     */
    static new(flux_field_value_storage_service) {
        return new this(
            flux_field_value_storage_service
        );
    }

    /**
     * @param {FluxFieldValueStorageService} flux_field_value_storage_service
     * @private
     */
    constructor(flux_field_value_storage_service) {
        this.#flux_field_value_storage_service = flux_field_value_storage_service;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse | null>}
     */
    async handleUIRequest(request) {
        if (!request.url.pathname.startsWith("/ui/")) {
            return null;
        }

        return this.#flux_field_value_storage_service.proxyRequest(
            `ui/${request.url.pathname.substring(4)}`,
            request
        );
    }
}
