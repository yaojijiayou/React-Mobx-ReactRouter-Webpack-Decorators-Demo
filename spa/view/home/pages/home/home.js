/*
author:姚吉
desc:home page
*/
import React from 'react';

import {browserHistory} from 'react-router';

import {observer} from 'mobx-react';

import {autorun,reaction} from 'mobx';

import TimeComponent from './timerComponent.js';

import Timer from './timerModel.js';

const TimerIns = new Timer();

autorun(() => {
    console.log('log start:', TimerIns.start)
})

reaction(
    () => TimerIns.current - TimerIns.start,
    gap => { if( gap<-5000 ) console.log("gap:", gap)}
);

var Home = React.createClass({

	
	handleClick: function(event) {
        browserHistory.push(pathPrefix+'/other');
    },

    render:function(){
        return(
             <div>
                 <h1>This is Home Page!</h1>
                 
                 <TimeComponent timerIns={TimerIns}></TimeComponent>

                 <span className="jumpBtn" onClick={this.handleClick}>Go to other page</span>
                 
              </div>
        )
    }
})

export default Home;