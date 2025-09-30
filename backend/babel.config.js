module.exports = {
  presets: [
    [require.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
    require.resolve('@babel/preset-typescript'),
  ],
  plugins: [
    require.resolve('babel-plugin-transform-typescript-metadata'),
    [require.resolve('@babel/plugin-proposal-decorators'), { legacy: true }],
    [require.resolve('@babel/plugin-proposal-class-properties'), { loose: true }],
  ],
};
