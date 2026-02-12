import { useEffect, useRef, useState } from "react";

export default function App() {
  const [state,setState]=useState<any>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);

  useEffect(()=>{
    const ws=new WebSocket("ws://localhost:3000");
    ws.onmessage=e=>setState(JSON.parse(e.data));
  },[]);

  useEffect(()=>{
    if(!state)return;
    const canvas=canvasRef.current;
    const ctx=canvas?.getContext("2d");
    if(!ctx)return;

    const centerX=canvas.width/2;
    const centerY=canvas.height/2;

    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    state.stars.forEach((s:any)=>{
      const x=centerX+(s.x-state.player.x)*s.layer*2;
      const y=centerY+(s.y-state.player.y)*s.layer*2;
      ctx.fillStyle="white";
      ctx.fillRect(x,y,1,1);
    });

    ctx.fillStyle="lime";
    ctx.beginPath();
    ctx.arc(centerX,centerY,6,0,Math.PI*2);
    ctx.fill();

    if(state.player.radarActive && state.radar){
      const {object,distance}=state.radar;
      const dx=object.x-state.player.x;
      const dy=object.y-state.player.y;
      const mag=Math.hypot(dx,dy);
      const nx=dx/mag;
      const ny=dy/mag;

      const intensity=1-(distance/state.player.radarRange);
      ctx.strokeStyle=`rgba(0,150,255,${Math.max(0,intensity)})`;
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(centerX,centerY);
      ctx.lineTo(centerX+nx*70,centerY+ny*70);
      ctx.stroke();
      // Dynamic uncertainty cloud
if (distance < state.player.radarRange * 0.6) {

  const proximityFactor = 1 - (distance / state.player.radarRange);
  const uncertaintyRadius = 60 * (1 - proximityFactor);

  ctx.fillStyle = "rgba(255,255,0,0.08)";

  for (let i = 0; i < 250; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * uncertaintyRadius;

    const worldOffsetX = (object.x - state.player.x) * 2;
    const worldOffsetY = (object.y - state.player.y) * 2;

    const x = centerX + worldOffsetX + Math.cos(angle) * radius;
    const y = centerY + worldOffsetY + Math.sin(angle) * radius;

    ctx.fillRect(x, y, 2, 2);
  }
}
    }

  },[state]);

  if(!state)return <div style={{color:"white"}}>Loading...</div>;

  const {player,canInteract}=state;

  async function move(dx:number,dy:number){
    await fetch("/api/move",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dx,dy})});
  }

  async function radar(){
    await fetch("/api/radar",{method:"POST"});
  }

  async function interact(){
    await fetch("/api/interact",{method:"POST"});
  }

  const buttonStyle={
    fontSize:"18px",
    padding:"10px 16px",
    margin:"4px"
  };

  return (
    <div style={{background:"#000",color:"white",minHeight:"100vh",padding:15}}>
      <h2 style={{fontSize:"28px"}}>🚀 Phase 1.7 Radar System</h2>

      <div style={{fontSize:"18px"}}>
        Position: ({player.x.toFixed(1)},{player.y.toFixed(1)})
      </div>

      <div style={{width:"100%",height:16,background:"#333",marginTop:10}}>
        <div style={{width:(player.energy/player.maxEnergy)*100+"%",height:"100%",background:"lime"}}/>
      </div>

      <div style={{marginTop:12}}>
        <button style={buttonStyle} onClick={()=>move(0,-2)}>↑</button>
        <button style={buttonStyle} onClick={()=>move(-2,0)}>←</button>
        <button style={buttonStyle} onClick={()=>move(2,0)}>→</button>
        <button style={buttonStyle} onClick={()=>move(0,2)}>↓</button>

        <button 
          style={{
            ...buttonStyle,
            background:player.radarActive?"#0077ff":"#444",
            color:"white"
          }}
          onClick={radar}>
          Radar
        </button>

        <button 
          style={{
            ...buttonStyle,
            background:canInteract?"#00aa00":"#444",
            color:"white"
          }}
          onClick={interact}>
          Interact
        </button>
      </div>

      <canvas 
        ref={canvasRef} 
        width={900} 
        height={500} 
        style={{border:"1px solid #0f0",marginTop:15,width:"100%",maxHeight:"70vh"}}
      />

    </div>
  );
}