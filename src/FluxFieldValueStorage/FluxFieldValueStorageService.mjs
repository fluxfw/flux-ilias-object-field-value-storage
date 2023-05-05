import { AUTHORIZATION_SCHEMA_BASIC } from "../../../flux-http-api/src/Authorization/AUTHORIZATION_SCHEMA.mjs";
import { HttpClientRequest } from "../../../flux-http-api/src/Client/HttpClientRequest.mjs";
import { ILIAS_OBJECT_ID_PATTERN } from "../Ilias/ILIAS_OBJECT_ID.mjs";
import { ILIAS_OBJECT_TITLE_PATTERN } from "../Ilias/ILIAS_OBJECT_TITLE.mjs";
import { ILIAS_OBJECT_TYPES } from "../Ilias/ILIAS_OBJECT_TYPES.mjs";
import { PROTOCOL_DEFAULT_PORT } from "../../../flux-http-api/src/Protocol/PROTOCOL_DEFAULT_PORT.mjs";
import { STATUS_CODE_404 } from "../../../flux-http-api/src/Status/STATUS_CODE.mjs";
import { FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_HOST, FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_PROTOCOL, FLUX_FIELD_VALUE_STORAGE_CONFIG_DEFAULT_USER } from "./FLUX_FIELD_VALUE_STORAGE_CONFIG.mjs";
import { HEADER_AUTHORIZATION, HEADER_CONTENT_TYPE } from "../../../flux-http-api/src/Header/HEADER.mjs";
import { INPUT_TYPE_NUMBER, INPUT_TYPE_SELECT, INPUT_TYPE_TEXT } from "../../../flux-form/src/INPUT_TYPE.mjs";
import { METHOD_DELETE, METHOD_PATCH, METHOD_PUT } from "../../../flux-http-api/src/Method/METHOD.mjs";

/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerResponse.mjs").HttpServerResponse} HttpServerResponse */
/** @typedef {import("../Ilias/IliasService.mjs").IliasService} IliasService */
/** @typedef {import("../../../flux-form/src/Input.mjs").Input} Input */
/** @typedef {import("../../../flux-field-value-storage/src/Value/Value.mjs").Value} Value */
/** @typedef {import("../../../flux-field-value-storage/src/Value/ValueAsText.mjs").ValueAsText} ValueAsText */
/** @typedef {import("../../../flux-field-value-storage/src/Value/ValueTable.mjs").ValueTable} ValueTable */

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
        if (!Number.isInteger(object_id) || object_id < 0) {
            return;
        }

        await this.#request(
            `value/delete/${object_id}`,
            null,
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

        return [
            {
                label: "Object id",
                name: "name",
                pattern: ILIAS_OBJECT_ID_PATTERN.source,
                required: true,
                subtitle: "Only digits. Can not be changed anymore",
                type: INPUT_TYPE_TEXT
            },
            ...inputs.filter(input => input.name !== "name")
        ];
    }

    /**
     * @param {number} object_id
     * @returns {Promise<Value | null>}
     */
    async getValue(object_id) {
        if (!Number.isInteger(object_id) || object_id < 0) {
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
            "object-id": object.id,
            "object-ref-id": object.ref_id,
            "object-type": object.type,
            "object-title": object.title
        };
    }

    /**
     * @param {number} object_id
     * @returns {Promise<ValueAsText[] | null>}
     */
    async getValueAsText(object_id) {
        if (!Number.isInteger(object_id) || object_id < 0) {
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
            if (!Number.isInteger(object_id) || object_id < 0) {
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
     * @param {{[key: string]: *} | null} filter
     * @returns {Promise<Value[] | null>}
     */
    async getValues(filter = null) {
        const _filter = filter ?? {};
        if (typeof _filter !== "object") {
            return null;
        }

        const filter_object_id = (_filter["object-id"] ?? null) !== null ? typeof _filter["object-id"] === "string" && ILIAS_OBJECT_ID_PATTERN.test(_filter["object-id"]) ? parseInt(_filter["object-id"]) : _filter["object-id"] : null;

        const filter_has_value = (_filter["has-value"] ?? null) !== null ? _filter["has-value"] === "true" ? true : _filter["has-value"] === "false" ? false : _filter["has-value"] : null;
        if (filter_has_value !== null && typeof filter_has_value !== "boolean") {
            return null;
        }

        const values = await this.#request(
            "value/get",
            {
                ...filter_object_id !== null ? {
                    name: filter_object_id
                } : null
            }
        );

        if (values === null) {
            return null;
        }

        const objects = await this.#ilias_service.getObjects(
            filter_object_id,
            (_filter["object-ref-id"] ?? null) !== null ? typeof _filter["object-ref-id"] === "string" && ILIAS_OBJECT_ID_PATTERN.test(_filter["object-ref-id"]) ? parseInt(_filter["object-ref-id"]) : _filter["object-ref-id"] : null,
            (_filter["object-type"] ?? null) !== null ? typeof _filter["object-type"] === "string" ? _filter["object-type"].split(",") : _filter["object-type"] : null,
            _filter["object-title"] ?? null
        );

        if (objects === null) {
            return null;
        }

        return objects.map(object => {
            const name = `${object.id}`;

            const value = values.find(_value => _value.name === name) ?? null;

            if (filter_has_value !== null && filter_has_value ? value !== null : value === null) {
                return null;
            }

            return {
                ...value !== null ? value : {
                    name,
                    values: []
                },
                "object-id": object.id,
                "object-ref-id": object.ref_id,
                "object-type": object.type,
                "object-title": object.title
            };
        }).filter(value => value !== null);
    }

    /**
     * @param {{[key: string]: *} | null} filter
     * @returns {Promise<ValueTable | null>}
     */
    async getValueTable(filter = null) {
        const _filter = filter ?? {};
        if (typeof _filter !== "object") {
            return null;
        }

        const filter_object_id = (_filter["object-id"] ?? null) !== null ? typeof _filter["object-id"] === "string" && ILIAS_OBJECT_ID_PATTERN.test(_filter["object-id"]) ? parseInt(_filter["object-id"]) : _filter["object-id"] : null;

        const filter_has_value = (_filter["has-value"] ?? null) !== null ? _filter["has-value"] === "true" ? true : _filter["has-value"] === "false" ? false : _filter["has-value"] : null;
        if (filter_has_value !== null && typeof filter_has_value !== "boolean") {
            return null;
        }

        const table = await this.#request(
            "value/get-table",
            {
                ...filter_object_id !== null ? {
                    name: filter_object_id
                } : null
            }
        );

        if (table === null) {
            return null;
        }

        const objects = await this.#ilias_service.getObjects(
            filter_object_id,
            (_filter["object-ref-id"] ?? null) !== null ? typeof _filter["object-ref-id"] === "string" && ILIAS_OBJECT_ID_PATTERN.test(_filter["object-ref-id"]) ? parseInt(_filter["object-ref-id"]) : _filter["object-ref-id"] : null,
            (_filter["object-type"] ?? null) !== null ? typeof _filter["object-type"] === "string" ? _filter["object-type"].split(",") : _filter["object-type"] : null,
            _filter["object-title"] ?? null
        );

        if (objects === null) {
            return null;
        }

        const columns = table.columns.filter(column => column.key !== "name");

        return {
            "show-add-new": false,
            columns: [
                {
                    key: "object-id",
                    label: "Object id"
                },
                {
                    key: "object-ref-id",
                    label: "Object ref id"
                },
                {
                    key: "object-type",
                    label: "Object type"
                },
                {
                    key: "object-title",
                    label: "Object title"
                },
                ...columns
            ],
            rows: objects.map(object => {
                const name = `${object.id}`;

                const row = table.rows.find(_row => _row.name === name) ?? null;

                if (filter_has_value !== null && (filter_has_value ? row === null : row !== null)) {
                    return null;
                }

                return {
                    ...row !== null ? row : {
                        name,
                        "has-value": false,
                        ...Object.fromEntries(columns.map(column => [
                            column.key,
                            "-"
                        ]))
                    },
                    "object-id": name,
                    "object-ref-id": `${object.ref_id ?? "-"}`,
                    "object-type": ILIAS_OBJECT_TYPES[object.type] ?? object.type,
                    "object-title": object.title
                };
            }).filter(row => row !== null)
        };
    }

    /**
     * @returns {Promise<Input[]>}
     */
    async getValueTableFilterInputs() {
        const inputs = await this.#request(
            "value/get-table-filter-inputs"
        );

        return [
            {
                label: "Object id",
                min: "0",
                name: "object-id",
                step: "1",
                type: INPUT_TYPE_NUMBER
            },
            {
                label: "Object ref id",
                min: "0",
                name: "object-ref-id",
                step: "1",
                type: INPUT_TYPE_NUMBER
            },
            {
                label: "Object type",
                multiple: true,
                name: "object-type",
                options: Object.entries(ILIAS_OBJECT_TYPES).map(([
                    value,
                    label
                ]) => ({
                    label,
                    value
                })),
                type: INPUT_TYPE_SELECT
            },
            {
                label: "Object title",
                name: "object-title",
                pattern: ILIAS_OBJECT_TITLE_PATTERN.source,
                subtitle: "Only letters, digits, dashes, underscores or spaces",
                type: INPUT_TYPE_TEXT
            },
            {
                label: "Has value",
                name: "has-value",
                options: [
                    {
                        label: "No",
                        value: "false"
                    },
                    {
                        label: "Yes",
                        value: "true"
                    }
                ],
                type: INPUT_TYPE_SELECT
            },
            ...inputs.filter(input => input.name !== "name")
        ];
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

        if (!Number.isInteger(value["object-id"]) || value["object-id"] < 0) {
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
            null,
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
     * @param {{[key: string]: *} | null} query_params
     * @param {*} body
     * @param {string | null} method
     * @param {boolean | null} response_body
     * @returns {Promise<*>}
     */
    async #request(route, query_params = null, body = null, method = null, response_body = null) {
        const url = new URL(`/api/${route}`, this.#url);

        if (query_params !== null) {
            for (const [
                key,
                value
            ] of Object.entries(query_params)) {
                url.searchParams.append(key, value);
            }
        }

        const _response_body = response_body ?? true;

        const response = await this.#flux_http_api.request(
            HttpClientRequest[body !== null ? "json" : "new"](
                url,
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
