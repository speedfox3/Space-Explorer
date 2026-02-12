import { useEffect, useRef, useState } from "react";

export default function App() {
  const [state, setState] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");
    ws.onmessage = (event) => {
      setState(JSON.parse(event.data));
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!state) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle = "lime";
    ctx.beginPath();
    ctx.arc(200,200,5,0,Math.PI*2);
    ctx.fill();

    state.contacts.forEach((c:any) => {
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(200 + c.approxX*5, 200 + c.approxY*5, 4, 0, Math.PI*2);
      ctx.fill();
    });

  }, [state]);

  if (!state) return <div style={{color:"white"}}>Connecting...</div>;

  const { player, contacts, analyze } = state;

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
      <h1>🚀 Space Explorer Realtime</h1>

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

      <canvas ref={canvasRef} width={400} height={400} style={{border:"1px solid lime",marginTop:20}}/>

      <div style={{marginTop:20}}>
        {contacts.map((c:any)=>(
          <div key={c.id}>
            {c.id} 
            <button onClick={()=>analyzeSignal(c.id)}>Analyze</button>
          </div>
        ))}
      </div>

      {analyze && (
        <div style={{marginTop:20}}>
          Analyzing...
          <div style={{width:200,height:10,background:"#333"}}>
            <div style={{
              width:(analyze.progress/5)*100+"%",
              height:"100%",
              background:"orange",
              transition:"width 0.5s"
            }}/>
          </div>
        </div>
      )}

    </div>
  );
}