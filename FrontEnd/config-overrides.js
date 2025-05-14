module.exports = function override(config) {
    config.resolve.fallback = {
      http: false,
      https: false,
      util: false,
      zlib: false,
      url: false,
      buffer: false,
    };
    return config;
  };