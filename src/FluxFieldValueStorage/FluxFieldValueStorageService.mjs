import { AUTHORIZATION_SCHEMA_BASIC } from "../../../flux-http-api/src/Authorization/AUTHORIZATION_SCHEMA.mjs";
import { HttpClientRequest } from "../../../flux-http-api/src/Client/HttpClientRequest.mjs";
import { PROTOCOL_DEFAULT_PORT } from "../../../flux-http-api/src/Protocol/PROTOCOL_DEFAULT_PORT.mjs";
import { STATUS_CODE_404 } from "../../../flux-http-api/src/Status/STATUS_CODE.mjs";
import { FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_HOST, FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_PROTOCOL, FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_USER } from "./FLUX_FIELD_VALUE_STORAGE_CONFIG.mjs";
import { HEADER_AUTHORIZATION, HEADER_CONTENT_TYPE } from "../../../flux-http-api/src/Header/HEADER.mjs";
import { METHOD_DELETE, METHOD_PATCH, METHOD_PUT } from "../../../flux-http-api/src/Method/METHOD.mjs";

/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("../Ilias/IliasService.mjs").IliasService} IliasService */
/** @typedef {import("../../../flux-overlay/src/Input.mjs").Input} Input */
/** @typedef {import("../../../flux-field-value-storage/src/Value/Value.mjs").Value} Value */
/** @typedef {import("../../../flux-field-value-storage/src/Value/ValueAsText.mjs").ValueAsText} ValueAsText */

export class FluxFieldValueStorageService {
    /**
     * @type {FluxHttpApi}
     */
    #flux_http_api;
    /**
     * @type {string}
     */
    #host;
    /**
     * @type {string | null}
     */
    #https_certificate;
    /**
     * @type {IliasService}
     */
    #ilias_service;
    /**
     * @type {string}
     */
    #password;
    /**
     * @type {number | null}
     */
    #port;
    /**
     * @type {string}
     */
    #protocol;
    /**
     * @type {string}
     */
    #user;

    /**
     * @param {FluxHttpApi} flux_http_api
     * @param {IliasService} ilias_service
     * @param {string} password
     * @param {string | null} host
     * @param {string | null} user
     * @param {string | null} protocol
     * @param {number | null} port
     * @param {string | null} https_certificate
     * @returns {FluxFieldValueStorageService}
     */
    static new(flux_http_api, ilias_service, password, host = null, user = null, protocol = null, port = null, https_certificate = null) {
        const _protocol = protocol ?? FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_PROTOCOL;

        return new this(
            flux_http_api,
            ilias_service,
            password,
            host ?? FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_HOST,
            user ?? FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_USER,
            _protocol,
            port !== (PROTOCOL_DEFAULT_PORT[_protocol] ?? null) ? port : null,
            https_certificate
        );
    }

    /**
     * @param {FluxHttpApi} flux_http_api
     * @param {IliasService} ilias_service
     * @param {string} password
     * @param {string} host
     * @param {string} user
     * @param {string} protocol
     * @param {number | null} port
     * @param {string | null} https_certificate
     * @private
     */
    constructor(flux_http_api, ilias_service, password, host, user, protocol, port, https_certificate) {
        this.#flux_http_api = flux_http_api;
        this.#ilias_service = ilias_service;
        this.#password = password;
        this.#host = host;
        this.#user = user;
        this.#protocol = protocol;
        this.#port = port;
        this.#https_certificate = https_certificate;
    }

    /**
     * @param {number} object_id
     * @returns {Promise<void>}
     */
    async deleteValue(object_id) {
        if (!Number.isInteger(object_id)) {
            return;
        }

        await this.#request(
            `value/delete/${object_id}`,
            null,
            METHOD_DELETE,
            false
        );
    }

    /**
     * @returns {Promise<Input[]>}
     */
    async getNewValueInputs() {
        const inputs = await this.#request(
            "value/get-new-inputs"
        );

        const name_input = inputs.find(input => input.name === "name");
        name_input.label = "ID";
        name_input.pattern = /^\d+$/.source;
        name_input.subtitle = "Only digits. Can not be changed anymore";

        return inputs;
    }

    /**
     * @param {number} object_id
     * @returns {Promise<Value | null>}
     */
    async getValue(object_id) {
        if (!Number.isInteger(object_id)) {
            return null;
        }

        const object = await this.#ilias_service.getObject(
            object_id
        );

        if (object === null) {
            return null;
        }

        const value = await this.#request(
            `value/get/${object.id}`
        );

        if (value === null) {
            return null;
        }

        return {
            ...value,
            "object-id": object.id
        };
    }

    /**
     * @param {number} object_id
     * @returns {Promise<ValueAsText[] | null>}
     */
    async getValueAsText(object_id) {
        if (!Number.isInteger(object_id)) {
            return null;
        }

        const object = await this.#ilias_service.getObject(
            object_id
        );

        if (object === null) {
            return null;
        }

        return this.#request(
            `value/get/${object.id}/as-text`
        );
    }

    /**
     * @param {number | null} object_id
     * @returns {Promise<Input[] | null>}
     */
    async getValueInputs(object_id = null) {
        if (object_id !== null) {
            if (!Number.isInteger(object_id)) {
                return null;
            }

            const object = await this.#ilias_service.getObject(
                object_id
            );

            if (object === null) {
                return null;
            }
        }

        return this.#request(
            `value/get-inputs${object_id !== null ? `/${object_id}` : ""}`
        );
    }

    /**
     * @returns {Promise<Value[]>}
     */
    async getValues() {
        const values = await this.#request(
            "value/get"
        );

        return (await this.#ilias_service.getObjects()).map(object => {
            const name = `${object.id}`;

            const value = values.find(_value => _value.name === name) ?? null;

            if (value === null) {
                return null;
            }

            return {
                ...value,
                "object-id": object.id
            };
        }).filter(value => value !== null);
    }

    /**
     * @returns {Promise<{columns: {[key: string]: string}[], rows: {[key: string]: string}[]}>}
     */
    async getValueTable() {
        const table = await this.#request(
            "value/get-table"
        );

        const type_labels = {
            category: "Category",
            course: "Course",
            group: "Group",
            "scorm-learning-module": "Scorm learning module",
            test: "Test"
        };

        const columns = table.columns.filter(column => column.key !== "name");

        return {
            "show-add-new": false,
            columns: [
                {
                    key: "name",
                    label: "ID"
                },
                {
                    key: "ref-id",
                    label: "Ref ID"
                },
                {
                    key: "type",
                    label: "Type"
                },
                {
                    key: "title",
                    label: "Title"
                },
                ...columns
            ],
            rows: (await this.#ilias_service.getObjects()).map(object => {
                const name = `${object.id}`;

                const row = table.rows.find(_row => _row.name === name) ?? null;

                return {
                    ...row !== null ? row : {
                        name,
                        "has-value": false,
                        ...Object.fromEntries(columns.map(column => [
                            column.key,
                            "-"
                        ]))
                    },
                    "ref-id": `${object.ref_id ?? "-"}`,
                    type: type_labels[object.type] ?? object.type,
                    title: object.title
                };
            })
        };
    }

    /**
     * @param {string} route
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse>}
     */
    async proxyRequest(route, request) {
        return this.#flux_http_api.proxyRequest(
            {
                url: `${this.#url}/${route}`,
                request,
                request_method: true,
                request_headers: [
                    HEADER_CONTENT_TYPE
                ],
                request_body: true,
                response_headers: [
                    HEADER_CONTENT_TYPE
                ],
                authorization: this.#authorization,
                server_certificate: this.#https_certificate
            }
        );
    }

    /**
     * @param {Value} value
     * @param {boolean | null} keep_other_field_values
     * @returns {Promise<boolean>}
     */
    async storeValue(value, keep_other_field_values = null) {
        if (value === null || typeof value !== "object") {
            return false;
        }

        if (!Number.isInteger(value["object-id"])) {
            return false;
        }

        const object = await this.#ilias_service.getObject(
            value["object-id"]
        );

        if (object === null) {
            return false;
        }

        await this.#request(
            `value/store/${value["object-id"]}`,
            value,
            keep_other_field_values ?? false ? METHOD_PATCH : METHOD_PUT,
            false
        );

        return true;
    }

    /**
     * @returns {string}
     */
    get #authorization() {
        return `${AUTHORIZATION_SCHEMA_BASIC} ${btoa(`${this.#user}:${this.#password}`)}`;
    }

    /**
     * @param {string} route
     * @param {*} body
     * @param {string | null} method
     * @param {boolean | null} response_body
     * @returns {Promise<*>}
     */
    async #request(route, body = null, method = null, response_body = null) {
        const _response_body = response_body ?? true;

        const response = await this.#flux_http_api.request(
            HttpClientRequest[body !== null ? "json" : "new"](
                new URL(`/api/${route}`, this.#url),
                body,
                method,
                {
                    [HEADER_AUTHORIZATION]: this.#authorization
                },
                false,
                _response_body,
                null,
                this.#https_certificate
            )
        );

        if (_response_body && response.status_code === STATUS_CODE_404) {
            return null;
        }

        if (!response.status_code_is_ok) {
            return Promise.reject(response);
        }

        if (!_response_body) {
            return null;
        }

        return response.body.json();
    }

    /**
     * @returns {string}
     */
    get #url() {
        return `${this.#protocol}://${this.#host}${this.#port !== null ? `:${this.#port}` : ""}`;
    }
}
