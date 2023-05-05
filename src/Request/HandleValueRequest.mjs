import { HttpServerResponse } from "../../../flux-http-api/src/Server/HttpServerResponse.mjs";
import { ILIAS_OBJECT_ID_PATTERN } from "../Ilias/ILIAS_OBJECT_ID.mjs";
import { METHOD_DELETE, METHOD_GET, METHOD_HEAD, METHOD_PATCH, METHOD_PUT } from "../../../flux-http-api/src/Method/METHOD.mjs";
import { STATUS_CODE_400, STATUS_CODE_404 } from "../../../flux-http-api/src/Status/STATUS_CODE.mjs";

/** @typedef {import("../FluxFieldValueStorage/FluxFieldValueStorageService.mjs").FluxFieldValueStorageService} FluxFieldValueStorageService */
/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */

export class HandleValueRequest {
    /**
     * @type {FluxFieldValueStorageService}
     */
    #flux_field_value_storage_service;
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;

    /**
     * @param {FluxFieldValueStorageService} flux_field_value_storage_service
     * @param {FluxHttpApi} flux_http_api
     * @returns {HandleValueRequest}
     */
    static new(flux_field_value_storage_service, flux_http_api) {
        return new this(
            flux_field_value_storage_service,
            flux_http_api
        );
    }

    /**
     * @param {FluxFieldValueStorageService} flux_field_value_storage_service
     * @param {FluxHttpApi} flux_http_api
     * @private
     */
    constructor(flux_field_value_storage_service, flux_http_api) {
        this.#flux_field_value_storage_service = flux_field_value_storage_service;
        this.#flux_http_api = flux_http_api;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse | null>}
     */
    async handleValueRequest(request) {
        if (!request.url.pathname.startsWith("/api/value/")) {
            return null;
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "delete") {
            return this.#deleteValue(
                request
            );
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "get") {
            return this.#getValue(
                request
            );
        }

        if (request.url_path_parts.length === 3 && request.url_path_parts[2] === "get-new-inputs") {
            return this.#getNewValueInputs(
                request
            );
        }

        if (request.url_path_parts.length === 5 && request.url_path_parts[2] === "get" && request.url_path_parts[4] === "as-text") {
            return this.#getValueAsText(
                request
            );
        }

        if ((request.url_path_parts.length === 3 || request.url_path_parts.length === 4) && request.url_path_parts[2] === "get-inputs") {
            return this.#getValueInputs(
                request
            );
        }

        if (request.url_path_parts.length === 3 && request.url_path_parts[2] === "get") {
            return this.#getValues(
                request
            );
        }

        if (request.url_path_parts.length === 3 && request.url_path_parts[2] === "get-table") {
            return this.#getValueTable(
                request
            );
        }

        if (request.url_path_parts.length === 3 && request.url_path_parts[2] === "get-table-filter-inputs") {
            return this.#getValueTableFilterInputs(
                request
            );
        }

        if (request.url_path_parts.length === 4 && request.url_path_parts[2] === "store") {
            return this.#storeValue(
                request
            );
        }

        return null;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #deleteValue(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_DELETE
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            object_id
        ] = request.url_path_parts;

        await this.#flux_field_value_storage_service.deleteValue(
            ILIAS_OBJECT_ID_PATTERN.test(object_id) ? parseInt(object_id) : object_id
        );

        return HttpServerResponse.new();
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getNewValueInputs(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        return HttpServerResponse.json(
            await this.#flux_field_value_storage_service.getNewValueInputs()
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getValue(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            object_id
        ] = request.url_path_parts;

        const value = await this.#flux_field_value_storage_service.getValue(
            ILIAS_OBJECT_ID_PATTERN.test(object_id) ? parseInt(object_id) : object_id
        );

        if (value === null) {
            return HttpServerResponse.text(
                "Value not found",
                STATUS_CODE_404
            );
        }

        return HttpServerResponse.json(
            value
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getValueAsText(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            object_id
        ] = request.url_path_parts;

        const value = await this.#flux_field_value_storage_service.getValueAsText(
            ILIAS_OBJECT_ID_PATTERN.test(object_id) ? parseInt(object_id) : object_id
        );

        if (value === null) {
            return HttpServerResponse.text(
                "Value not found",
                STATUS_CODE_404
            );
        }

        return HttpServerResponse.json(
            value
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getValueInputs(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            object_id
        ] = request.url_path_parts;

        const inputs = await this.#flux_field_value_storage_service.getValueInputs(
            (object_id ?? null) !== null && ILIAS_OBJECT_ID_PATTERN.test(object_id) ? parseInt(object_id) : object_id
        );

        if (inputs === null) {
            return HttpServerResponse.text(
                "Value not found",
                STATUS_CODE_404
            );
        }

        return HttpServerResponse.json(
            inputs
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getValues(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        const values = await this.#flux_field_value_storage_service.getValues(
            Object.fromEntries(request.url.searchParams)
        );

        if (values === null) {
            return HttpServerResponse.text(
                "Invalid filter",
                STATUS_CODE_400
            );
        }

        return HttpServerResponse.json(
            values
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getValueTable(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        const table = await this.#flux_field_value_storage_service.getValueTable(
            Object.fromEntries(request.url.searchParams)
        );

        if (table === null) {
            return HttpServerResponse.text(
                "Invalid filter",
                STATUS_CODE_400
            );
        }

        return HttpServerResponse.json(
            table
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #getValueTableFilterInputs(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_GET,
                METHOD_HEAD
            ]
        );

        if (response !== null) {
            return response;
        }

        return HttpServerResponse.json(
            await this.#flux_field_value_storage_service.getValueTableFilterInputs()
        );
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async #storeValue(request) {
        const response = await this.#flux_http_api.validateMethods(
            request,
            [
                METHOD_PATCH,
                METHOD_PUT
            ]
        );

        if (response !== null) {
            return response;
        }

        const [
            ,
            ,
            ,
            object_id
        ] = request.url_path_parts;

        let value;
        try {
            value = await request.body.json();
        } catch (error) {
            console.error(error);

            return HttpServerResponse.text(
                "Invalid body",
                STATUS_CODE_400
            );
        }

        const ok = await this.#flux_field_value_storage_service.storeValue(
            {
                ...value,
                "object-id": ILIAS_OBJECT_ID_PATTERN.test(object_id) ? parseInt(object_id) : object_id
            },
            request.method === METHOD_PATCH
        );

        if (!ok) {
            return HttpServerResponse.text(
                "Invalid value",
                STATUS_CODE_400
            );
        }

        return HttpServerResponse.new();
    }
}
