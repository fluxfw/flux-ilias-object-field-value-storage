import { AUTHORIZATION_SCHEMA_BASIC } from "../../../flux-http-api/src/Authorization/AUTHORIZATION_SCHEMA.mjs";
import { HEADER_AUTHORIZATION } from "../../../flux-http-api/src/Header/HEADER.mjs";
import { HttpClientRequest } from "../../../flux-http-api/src/Client/HttpClientRequest.mjs";
import { PROTOCOL_DEFAULT_PORT } from "../../../flux-http-api/src/Protocol/PROTOCOL_DEFAULT_PORT.mjs";
import { STATUS_CODE_404 } from "../../../flux-http-api/src/Status/STATUS_CODE.mjs";
import { ILIAS_CONFIG_DEFAULT_CLIENT, ILIAS_CONFIG_DEFAULT_PROTOCOL, ILIAS_CONFIG_DEFAULT_USER } from "./ILIAS_CONFIG.mjs";

/** @typedef {import("../../../flux-http-api/src/FluxHttpApi.mjs").FluxHttpApi} FluxHttpApi */

export class IliasService {
    /**
     * @type {string}
     */
    #client;
    /**
     * @type {{[key: string]: *} | null}
     */
    #constants = null;
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
     * @param {string} host
     * @param {string} password
     * @param {string | null} user
     * @param {string | null} client
     * @param {string | null} protocol
     * @param {number | null} port
     * @param {string | null} https_certificate
     * @returns {IliasService}
     */
    static new(flux_http_api, host, password, user = null, client = null, protocol = null, port = null, https_certificate = null) {
        const _protocol = protocol ?? ILIAS_CONFIG_DEFAULT_PROTOCOL;

        return new this(
            flux_http_api,
            host,
            password,
            user ?? ILIAS_CONFIG_DEFAULT_USER,
            client ?? ILIAS_CONFIG_DEFAULT_CLIENT,
            _protocol,
            port !== (PROTOCOL_DEFAULT_PORT[_protocol] ?? null) ? port : null,
            https_certificate
        );
    }

    /**
     * @param {FluxHttpApi} flux_http_api
     * @param {string} host
     * @param {string} password
     * @param {string} user
     * @param {string} client
     * @param {string} protocol
     * @param {number | null} port
     * @param {string | null} https_certificate
     * @private
     */
    constructor(flux_http_api, host, password, user, client, protocol, port, https_certificate) {
        this.#flux_http_api = flux_http_api;
        this.#host = host;
        this.#password = password;
        this.#user = user;
        this.#client = client;
        this.#protocol = protocol;
        this.#port = port;
        this.#https_certificate = https_certificate;
    }

    /**
     * @param {number} user_id
     * @returns {Promise<boolean>}
     */
    async hasUserAdministratorRole(user_id) {
        if (!Number.isInteger(user_id)) {
            return false;
        }

        return (await this.#request(
            "user-roles",
            {
                user_id,
                role_id: (await this.#getConstants()).administrator_role_id
            }
        )).length > 0;
    }

    /**
     * @param {number} id
     * @returns {Promise<{[key: string]: *} | null>}
     */
    async getObject(id) {
        return this.#request(
            `object/by-id/${id}`
        );
    }

    /**
     * @returns {Promise<{[key: string]: *}[]>}
     */
    async getObjects() {
        return this.#request(
            "objects",
            {
                types: [
                    "category",
                    "course",
                    "group",
                    "scorm-learning-module",
                    "test"
                ].join(",")
            }
        );
    }

    /**
     * @returns {Promise<{[key: string]: *}>}
     */
    async #getConstants() {
        this.#constants ??= await this.#request(
            "constants"
        );

        return this.#constants;
    }

    /**
     * @param {string} route
     * @param {{[key: string]: *} | null} query_params
     * @returns {Promise<*>}
     */
    async #request(route, query_params = null) {
        const url = new URL(`/flux-ilias-rest-api/${route}`, `${this.#protocol}://${this.#host}${this.#port !== null ? `:${this.#port}` : ""}`);

        if (query_params !== null) {
            for (const [
                key,
                value
            ] of Object.entries(query_params)) {
                url.searchParams.append(key, value);
            }
        }

        const response = await this.#flux_http_api.request(
            HttpClientRequest.new(
                url,
                null,
                null,
                {
                    [HEADER_AUTHORIZATION]: `${AUTHORIZATION_SCHEMA_BASIC} ${btoa(`${this.#client}/${this.#user}:${this.#password}`)}`
                },
                true,
                null,
                null,
                this.#https_certificate
            )
        );

        if (response.status_code === STATUS_CODE_404) {
            return null;
        }

        if (!response.status_code_is_ok) {
            return Promise.reject(response);
        }

        return response.body.json();
    }
}
