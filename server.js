const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (_req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

const rooms = new Map();
function code(){return Math.random().toString(36).slice(2,7).toUpperCase();}
app.get('/api/servers', (_req,res)=>{
  const servers=[...rooms.entries()].filter(([,r])=>r.isPublic && r.players.size>0).map(([code,r])=>({code,name:r.name||'MINECARFT World',players:r.players.size}));
  res.json({servers});
});
io.on("connection", socket=>{
  let roomCode=null;
  socket.on("joinRoom", data=>{
    if(roomCode)return;
    let requested=String(data.room||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);
    if(!requested){requested=code();while(rooms.has(requested))requested=code();}
    if(!rooms.has(requested))rooms.set(requested,{players:new Map(),blocks:[],isPublic:data.isPublic!==false,name:'MINECARFT World'});
    const room=rooms.get(requested);
    if(room.players.size>=20){socket.emit('roomFull');return;}
    roomCode=requested;socket.join(roomCode);
    const player={id:socket.id,name:String(data.name||"Player").slice(0,14),x:0,z:5,yaw:0};
    room.players.set(socket.id,player);
    socket.emit("joined",{room:roomCode,players:[...room.players.values()],blocks:room.blocks});
    socket.to(roomCode).emit("playerJoined",player);
  });
  socket.on("move",data=>{
    if(!roomCode)return;const room=rooms.get(roomCode),p=room?.players.get(socket.id);if(!p)return;
    const x=Number(data.x),z=Number(data.z),yaw=Number(data.yaw);
    if(!Number.isFinite(x)||!Number.isFinite(z))return;
    p.x=Math.max(-500,Math.min(500,x));p.z=Math.max(-500,Math.min(500,z));p.yaw=Number.isFinite(yaw)?yaw:0;
    socket.to(roomCode).emit("playerMoved",p);
  });
  socket.on("blockAdd",b=>{
    if(!roomCode)return;const room=rooms.get(roomCode);if(!room)return;
    const x=Math.round(Number(b.x)),y=Math.round(Number(b.y)),z=Math.round(Number(b.z)),type=Math.max(0,Math.min(5,Math.round(Number(b.type)||0)));
    if(![x,y,z].every(Number.isFinite)||Math.abs(x)>100||Math.abs(y)>50||Math.abs(z)>100)return;
    if(room.blocks.some(v=>v.x===x&&v.y===y&&v.z===z))return;
    const block={x,y,z,type};room.blocks.push(block);io.to(roomCode).emit("blockAdded",block);
  });
  socket.on("blockRemove",b=>{
    if(!roomCode)return;const room=rooms.get(roomCode);if(!room)return;
    const x=Math.round(Number(b.x)),y=Math.round(Number(b.y)),z=Math.round(Number(b.z));
    room.blocks=room.blocks.filter(v=>!(v.x===x&&v.y===y&&v.z===z));
    io.to(roomCode).emit("blockRemoved",{x,y,z});
  });
  socket.on("disconnect",()=>{
    if(!roomCode)return;const room=rooms.get(roomCode);if(!room)return;
    room.players.delete(socket.id);socket.to(roomCode).emit("playerLeft",socket.id);
    if(room.players.size===0)rooms.delete(roomCode);
  });
});
server.listen(process.env.PORT||3000,()=>console.log("MINECARFT online server started"));
