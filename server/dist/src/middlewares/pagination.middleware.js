"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validatePagination = (req, res, next) => {
    let { page, pageSize } = req.query;
    if (!page) {
        req.query.page = "0";
    }
    if (!pageSize) {
        req.query.pageSize = "10";
    }
    const _page = parseInt(req.query.page);
    const _pageSize = parseInt(req.query.pageSize);
    if (isNaN(_page) || isNaN(_pageSize)) {
        return res.status(400).send("page and pageSize must be numbers");
    }
    next(); // Llama a next() para pasar al siguiente middleware o controlador de ruta
};
exports.default = validatePagination;
