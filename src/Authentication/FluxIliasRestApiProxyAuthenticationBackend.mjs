import { HttpServerResponse } from "../../../flux-http-api/src/Server/HttpServerResponse.mjs";
import { ILIAS_OBJECT_ID_PATTERN } from "../Ilias/ILIAS_OBJECT_ID.mjs";
import { STATUS_CODE_401, STATUS_CODE_403 } from "../../../flux-http-api/src/Status/STATUS_CODE.mjs";

/** @typedef {import("../../../flux-authentication-backend/src/FluxAuthenticationBackend.mjs").FluxAuthenticationBackend} FluxAuthenticationBackend */
/** @typedef {import("../../../flux-http-api/src/Server/HttpServerRequest.mjs").HttpServerRequest} HttpServerRequest */
/** @typedef {import("../Ilias/IliasService.mjs").IliasService} IliasService */
/** @typedef {import("../../../flux-authentication-backend/src/UserInfo.mjs").UserInfo} UserInfo */

/**
 * @implements {FluxAuthenticationBackend}
 */
export class FluxIliasRestApiProxyAuthenticationBackend {
    /**
     * @type {IliasService}
     */
    #ilias_service;

    /**
     * @param {IliasService} ilias_service
     * @returns {FluxIliasRestApiProxyAuthenticationBackend}
     */
    static new(ilias_service) {
        return new this(
            ilias_service
        );
    }

    /**
     * @param {IliasService} ilias_service
     * @private
     */
    constructor(ilias_service) {
        this.#ilias_service = ilias_service;
    }

    /**
     * @param {HttpServerRequest} request
     * @returns {Promise<HttpServerResponse | UserInfo>}
     */
    async handleAuthentication(request) {
        const user_id = request.header(
            "X-Flux-Ilias-Rest-Api-User-Id"
        );

        if (user_id === null) {
            return HttpServerResponse.text(
                "Authorization needed",
                STATUS_CODE_401
            );
        }

        if (!(await this.#ilias_service.hasUserAdministratorRole(
            ILIAS_OBJECT_ID_PATTERN.test(user_id) ? parseFloat(user_id) : user_id
        )).length === 0) {
            return HttpServerResponse.text(
                "No access",
                STATUS_CODE_403
            );
        }

        return {
            "user-id": user_id
        };
    }
}
