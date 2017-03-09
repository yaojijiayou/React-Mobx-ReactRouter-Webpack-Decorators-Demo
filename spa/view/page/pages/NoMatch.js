import React from 'react';

var NoMatch = React.createClass({
    componentWillMount:function(){
    },
    render() {
        return (
            <div className="ui-no-found">
                <h1>Page Not Found! Just want to show u how to jump to other page using react router</h1>
            </div>
        )
    }
})

export default NoMatch;