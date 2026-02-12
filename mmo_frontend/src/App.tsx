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

    ctx.fillStyle="black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    const centerX=canvas.width/2;
    const centerY=canvas.height/2;

    ctx.fillStyle="white";
    state.stars.forEach((s:any)=>{
      const x=centerX+(s.x-state.player.x)*2;
      const y=centerY+(s.y-state.player.y)*2;
      ctx.fillRect(x,y,1,1);
    });

    ctx.fillStyle="lime";
    ctx.beginPath();
    ctx.arc(centerX,centerY,6,0,Math.PI*2);
    ctx.fill();

    state.objects.forEach((o:any)=>{
      const x=centerX+(o.x-state.player.x)*2;
      const y=centerY+(o.y-state.player.y)*2;
      ctx.fillStyle=o.discovered?"red":"yellow";
      ctx.beginPath();
      ctx.arc(x,y,5,0,Math.PI*2);
      ctx.fill();
    });

  },[state]);

  if(!state)return <div style={{color:"white"}}>Loading...</div>;

  const {player,objects}=state;

  async function move(dx:number,dy:number){
    await fetch("/api/move",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dx,dy})});
  }

  async function radar(){
    await fetch("/api/radar",{method:"POST"});
  }

  async function interact(id:string){
    await fetch("/api/interact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({objectId:id})});
  }

  return (
    <div style={{background:"#000",color:"white",minHeight:"100vh",padding:20}}>
      <h1>🚀 Phase 1.5 Solar System</h1>

      <div>Position: ({player.x},{player.y})</div>

      <div style={{width:200,height:15,background:"#333",marginTop:10}}>
        <div style={{width:(player.energy/player.maxEnergy)*100+"%",height:"100%",background:"lime",transition:"width 0.5s"}}/>
      </div>

      <div style={{marginTop:10}}>
        <button onClick={()=>move(0,-2)}>Up</button>
        <button onClick={()=>move(-2,0)}>Left</button>
        <button onClick={()=>move(2,0)}>Right</button>
        <button onClick={()=>move(0,2)}>Down</button>
        <button onClick={radar}>Radar</button>
      </div>

      <canvas ref={canvasRef} width={800} height={800} style={{border:"1px solid lime",marginTop:20}}/>

      <div style={{marginTop:20}}>
        {objects.map((o:any)=>{
          const d=Math.hypot(o.x-player.x,o.y-player.y);
          if(d<=state.constants.interactRadius){
            return <div key={o.id}>{o.type} <button onClick={()=>interact(o.id)}>Interact</button></div>
          }
          return null;
        })}
      </div>

    </div>
  );
}