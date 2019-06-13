module.exports = {
  runtimeCompiler: true,
  lintOnSave: false,
  
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader');
  },

  // Github pages setup
  publicPath: '/'

  // process.env.NODE_ENV === 'production'
	 //    ? '/secret-islands/'
	 //    : '/'
	
}