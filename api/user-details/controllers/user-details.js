'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            data.user = ctx.state.user.id;
            entity = await strapi.services['user-details'].create(data, { files });
        } else {
            ctx.request.body.user = ctx.state.user.id;
            entity = await strapi.services['user-details'].create(ctx.request.body);
        }
        return sanitizeEntity(entity, { model: strapi.models['user-details'] });
    },

    async update(ctx) {
        const { id } = ctx.params;

        let entity;

        const userdetails = await strapi.services['user-details'].findOne({
            id: ctx.params.id,
            'user.id': ctx.state.user.id,
        });

        if (!userdetails) {
            return ctx.unauthorized(`You can't update this entry.`);
        }

        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.services['user-details'].update({ id }, data, {
                files,
            });
        } else {
            entity = await strapi.services['user-details'].update({ id }, ctx.request.body);
        }

        return sanitizeEntity(entity, { model: strapi.models['user-details'] });
    },
};
