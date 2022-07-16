/* importo i moduli */
const express=require('express');
const ip =require('ip')
const mobile=require('is-mobile')
const Room= require('./classeEmitter')
const GetCon= require('./classeEmitter2')
/* istanzio la classe Room */
const roomEmitter = new Room();
/* istanxio la classe GetCon */
const connectionEmitter=new GetCon();

/* creo ed imposto il server */
const app=express();
const http=require('http');
const server=http.createServer(app)
const io=require('socket.io') (server);

/* imposto: la cartella da cui prelevare css,
img e il template engine   */
app.use(express.static('public'));
app.set('view engine','ejs')

/* definisco il routing */
app.get('/', (request,response)=>{
    const stanza=request.query.stanza
        roomEmitter.get(stanza);
        response.render('home')
})

app.get('/app',(request,response)=>{
    const isMobile=mobile({ua:request});
    if(isMobile){connectionEmitter.get()};
    console.log(isMobile)
    const stanza=request.query.stanza
    roomEmitter.get(stanza);
    response.render('app');
})

app.all('*',(request,response)=>{
    response.render('pagina_errore')
});

let connessione='';
let sideGame;
/* ascolto l'evento emesso con l'istanza della classe "Room" 
per associarmi alla stanza corretta */
roomEmitter.on('getRoom',(room)=>{
    console.log(`stanza da query ${room}`)
    return room
 });

 /* controllo la connessione da mobile */
 connectionEmitter.on('getconn',(data)=>{
    connessione=data;
    sideGame='mobile';
})
 
/* istanzio le variabili globali "Map" per salvare la lista utenti collegati */
let stanze=new Map()

/* utilizzo i Socket per comunicare con i Client nella pagina app*/
io.on('connection',function(socket){
    /* recupero l id stanza */
    let stanza=Room.room;
    const idT=Date.now().toString()+(Math.round(Math.random()*10)).toString();
    
    if(stanza===undefined){
        socket.join(idT)
    }else{
        socket.join(stanza)
    }

    /* definisco una funzione per il recupero dell'indirizzo ip del PC */
    function getIp(){ 
        return `${ip.address()}:3001`
    };
    //questa funzione è da chiamare in caso volessimo usare l'app da locale
    const ipA=getIp();
    // const url='https://snake.hictech.com'
    /* e lo passo al Client che lo userà per creare il QrCode */
    socket.emit('IpAddress',ipA,idT);
    
    /* inserisco il socket che si è collegato nella stanza */
    socket.join(stanza);

    /* invio l evento connessione da mobile alla home per accedere da desktop all'app */
    if(connessione==='true'){
        socket.to(stanza).emit('connessioneMobile',connessione,stanza);
    }
    /* invio al desktop e al mobile il titolo pagina */
    if(sideGame==='mobile'){
    socket.to(stanza).emit('connessione','CONTROLLER');
    socket.emit('connessione','PAINT')}
    
    /* inserisco gli utenti nella Map di utenti connessi */
    const socketID=socket.id
    if(stanza!=undefined)stanze.set(socketID,stanza);
    /* for (const [key, value] of stanze) {
        console.log(key + ' = ' + value)
    } */

    /*ascolto l'eveto resetta */
    socket.on('resetta',(azione)=>{
        console.log(azione);

        socket.to(stanza).emit('premiResetta',azione);
        
        
    })
    
    /* creo l'empatia con gli utenti connessi nella stessa stanza(colore e spessore pennello) */
    socket.on('tasto',(messaggio,funzione,colore,spessore)=>{
        socket.to(stanza).emit('azione',messaggio,funzione,colore,spessore);
        console.log(`${socketID} che è nella stanza ${stanza} dice che: ${messaggio}`)    
    })
    
     /*ascolto l'evento rigenraQrc*/
    
     socket.on('rigeneraQrc',(dato)=>{
        socket.to(stanza).emit('home',dato);
        console.log(dato);
    })

    /* ascolto l'eveto disconnessione e stampo gli utenti connnessi */
    socket.on("disconnect", (socket) => {
        console.log('lascia: '+socketID)
        stanze.delete(socketID);
       /*  for (const [key, value] of stanze) {
            console.log(key + ' = ' + value)
        }  */ 
     });
})

server.listen(3001,()=>console.log('server in ascolto sulla port 3000...'));
 



