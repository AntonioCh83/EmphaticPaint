const {EventEmitter}=require('events');

class GetCon extends EventEmitter{

    get(){ 
         this.emit('getconn','true');
               
    }
  }
module.exports=GetCon; 