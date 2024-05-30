import { Request, Response, NextFunction } from "express";

const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { page, pageSize } = req.query;

  if (!page) {
    req.query.page = "0";
  }

  if (!pageSize) {
    req.query.pageSize = "10";
  }

  const _page: number = parseInt(req.query.page as string);
  const _pageSize: number = parseInt(req.query.pageSize as string);

  if (isNaN(_page) || isNaN(_pageSize)) {
    return res.status(400).send("page and pageSize must be numbers");
  }

  next(); // Llama a next() para pasar al siguiente middleware o controlador de ruta
};

export default validatePagination;
