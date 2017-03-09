/**
 * Created with IntelliJ IDEA.
 * Date: 2016/7/7
 */

export default{
    childRoutes: [
        {
            //404 页面
            path: '*',
            getComponent: (nextState, cb) => {
                require.ensure([], (require) => {
                    cb(null, require('./pages/NoMatch').default)
                },"pages")
            }
        }
    ]
}