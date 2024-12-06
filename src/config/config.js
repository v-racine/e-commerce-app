class Config {
  static Instance = undefined;

  static Get(env) {
    return new Config(env);
  }

  constructor(env) {
    if (Config.Instance) {
      return Config.Instance;
    }

    this.nodeEnv = 'dev';

    if (env.NODE_ENV !== undefined) {
      this.nodeEnv = env.NODE_ENV;
    }

    Object.freeze(this);

    Config.Instance = this;
  }
}

module.exports = { Config };
