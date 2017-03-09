/*
被观察的数据
*/

import {observable, computed, action,useStrict} from 'mobx';

useStrict(true);

export default class Timer {

    @observable start = Date.now();
    @observable current = Date.now();


    @computed get elapsedTime() {
        return (this.current - this.start) + "seconds"
    }

    @action tick() {
        this.start = Date.now();
    }

    fakeAjax(){
    	setTimeout(()=>this.tick(),1000);
    }


}