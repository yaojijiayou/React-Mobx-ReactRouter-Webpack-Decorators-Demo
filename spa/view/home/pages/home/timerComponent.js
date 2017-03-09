/*
author:姚吉
desc:观察者
*/
import React from 'react';

import {observer} from 'mobx-react';


@observer
class TimerComponent extends React.Component {

  render() {

    var {start,elapsedTime} = this.props.timerIns;

    return (

      <div className="time-component">

        <h2>this is TimeComponent</h2>
        
        <h2>start:{ start }</h2>
        <h2>elapsedTime:{elapsedTime}</h2>

        <h2 className="btn" onClick={()=>this.props.timerIns.tick()}>
        	click me to trigger tick action
        </h2>

        <h2 className="btn" onClick={()=>this.props.timerIns.fakeAjax()}>
          fake ajax action
        </h2>
      </div>

    );
  }

}


export default TimerComponent;