const path = require('path');
require('dotenv').config({
  path: path.resolve(
    process.cwd(),
    `.${process.env.NODE_ENV || 'development'}.env`
  )
});
const config = require('config');
const fs = require('fs');

const keyify = (obj, prefix = '') =>
  Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res;
    }
    if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...keyify(obj[el], `${prefix + el}.`)];
    }
    return [...res, prefix + el];
  }, []);

module.exports = () => {
  fs.readFile(
    path.resolve(process.cwd(), 'config/custom-environment-variables.json'),
    (err, data) => {
      if (err) throw err;
      const envVariables = JSON.parse(data);
      keyify(envVariables).forEach(varEnv => {
        if (!config.has(varEnv))
          throw new Error(`FATAL ERROR: ${varEnv} not defined`);
      });
    }
  );
};
