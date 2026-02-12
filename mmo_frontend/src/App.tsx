import { useEffect, useRef, useState } from "react";

export default function App() {
  const [state, setState] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function connect() {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onmessage = (event) => {
      setState(JSON.parse(event.data));
    };

    ws.onclose = () => {
      setTimeout(connect, 1000);
    };
  }

  useEffect(() => {
    connect();
  }, []);

  useEffect(() => {
    if (!state) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 5, 0, Math.PI*2);
    ctx.fill();

    state.signals.forEach((s:any) => {
      if (s.discovered) {
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(canvas.width/2 + s.realX, canvas.height/2 + s.realY, 6, 0, Math.PI*2);
        ctx.fill();
      } else {
        ctx.fillStyle = "rgba(255,255,0,0.1)";
        for (let i=0;i<200;i++) {
          const angle = Math.random()*Math.PI*2;
          const radius = Math.random()*s.uncertainty;
          const x = canvas.width/2 + s.realX + Math.cos(angle)*radius;
          const y = canvas.height/2 + s.realY + Math.sin(angle)*radius;
          ctx.fillRect(x,y,2,2);
        }
      }
    });

  }, [state]);

  if (!state) return <div style={{color:"white"}}>Connecting...</div>;

  const { player, signals } = state;

  async function move(dx:number,dy:number){
    await fetch("/api/move",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({playerId:"player1",dx,dy})
    });
  }

  async function toggleRadar(){
    await fetch("/api/radar/toggle",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({playerId:"player1"})
    });
  }

  async function analyzeSignal(id:string){
    await fetch("/api/analyze",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({playerId:"player1",targetId:id})
    });
  }

  return (
    <div style={{background:"#111",color:"white",minHeight:"100vh",padding:20}}>
      <h1>🚀 Space Explorer Phase 1</h1>

      <div>Position: ({player.x},{player.y})</div>

      <div style={{width:200,height:15,background:"#333",marginTop:10}}>
        <div style={{
          width:(player.energy/player.maxEnergy)*100+"%",
          height:"100%",
          background:"lime",
          transition:"width 0.5s"
        }}/>
      </div>

      <div style={{marginTop:10}}>
        <button onClick={()=>move(0,-1)}>Up</button>
        <button onClick={()=>move(-1,0)}>Left</button>
        <button onClick={()=>move(1,0)}>Right</button>
        <button onClick={()=>move(0,1)}>Down</button>
        <button onClick={toggleRadar}>Radar</button>
      </div>

      <canvas ref={canvasRef} width={600} height={600} style={{border:"1px solid lime",marginTop:20}}/>

      <div style={{marginTop:20}}>
        {signals.map((s:any)=>(
          !s.discovered &&
          <div key={s.id}>
            {s.id}
            <button onClick={()=>analyzeSignal(s.id)}>Analyze</button>
          </div>
        ))}
      </div>

    </div>
  );
}