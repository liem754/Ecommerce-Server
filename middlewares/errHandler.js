const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found!`);
  res.status(404);
  next(error);
};
const throwError = (code, mes, res, next) => {
  const err = new Error(mes);
  res.status(code);
  throw err;
};
const errHandler = (error, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    sucess: false,
    mes: error?.message,
  });
};
module.exports = {
  notFound,
  errHandler,
  throwError,
};
