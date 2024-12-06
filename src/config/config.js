class Config {
  static Instance;

  static Get(env) {
    return new Config(env);
  }

  constructor(env) {
    if (Config.Instance) {
      return Config.Instance;
    }

    this.nodeEnv = env.NODE_ENV;

    Config.Instance = this;
  }
}

module.exports = { Config };
