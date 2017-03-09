export default {
    path: pathPrefix,
    indexRoute: {
        getComponent: (nextState, cb) => {
            //默认主页路由
            require.ensure([], (require) => {
                cb(null, require('./home/index').default);
            }, "home")
        }
    },
    childRoutes: [
        require('./home/index').default,                 //微首页
        require('./page/index').default                  //通用静态页面**--新模块放到上面，在下面的都访问不到--**
    ]
}



