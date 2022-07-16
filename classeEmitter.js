const {EventEmitter}=require('events');

class Room extends EventEmitter{

    get(room){
         this.emit('getRoom',room);
         Room.getInstance(room);    
    }
   static getInstance(room){
     Room.room=room   
    }
}
module.exports=Room;