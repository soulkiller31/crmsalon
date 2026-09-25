import config from '../config/index.js';

export const authenticate = (req, _res, next) => {
  req.admin = {
    id: 'default-admin',
    email: config.admin.email,
    name: config.admin.name,
  };

  return next();
};
