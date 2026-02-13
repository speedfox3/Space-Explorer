import { useEffect, useRef, useState } from "react";
import MinigameModal from "./components/MinigameModal";
import WormholeModal from "./components/WormholeModal";

export default function App() {
  const [state,setState]=useState<any>(null);
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const [showMinigame, setShowMinigame] = useState(false);
  const [currentObject, setCurrentObject] = useState<any>(null);
  const [canAnalyze, setCanAnalyze] = useState(false);
  const [claimedObjects, setClaimedObjects] = useState<any[]>([]);
  const [showWormhole, setShowWormhole] = useState(false);


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

    ctx.fillStyle = state.systemBackground || "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    state.stars.forEach((s:any)=>{
      const x=centerX+(s.x-state.player.x)*s.layer*2;
      const y=centerY+(s.y-state.player.y)*s.layer*2;
      ctx.fillStyle = state.starColor || "white";
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

function interact(){
  console.log("Interact clicked");
  console.log("Radar object:", state.radar?.object);
  console.log("CanInteract:", canInteract);
  if (!canInteract) return;

  const radarObject = state.radar?.object;

  if (radarObject?.type === "wormhole") {
    setCurrentObject(radarObject);
    setShowWormhole(true);
    return;
  }

  if (radarObject?.status === "undiscovered") {
    setCurrentObject(radarObject);
    setShowMinigame(true);
  }
}


  const buttonStyle={
    fontSize:"18px",
    padding:"10px 16px",
    margin:"4px"
  };

  return (
  <div style={{
    background:"#000",
    color:"white",
    minHeight:"100vh",
    display:"flex"
  }}>

    {/* COLUMNA IZQUIERDA - JUEGO */}
    <div style={{flex:3, padding:15}}>

      <h2 style={{fontSize:"28px"}}>🚀 Phase 2.1</h2>

      <div style={{fontSize:"18px"}}>
        Position: ({player.x.toFixed(1)},{player.y.toFixed(1)})
      </div>

      <div style={{width:"100%",height:16,background:"#333",marginTop:10}}>
        <div style={{
          width:(player.energy/player.maxEnergy)*100+"%",
          height:"100%",
          background:"lime"
        }}/>
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

        {canAnalyze && (
          <button
            style={{...buttonStyle, background:"#ffaa00"}}
            onClick={async ()=>{
              await fetch("/api/claim",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({
                  objectId:currentObject.id,
                  playerId:"player1"
                })
              });

              setCanAnalyze(false);

              const res = await fetch("/api/claimed/player1");
              const data = await res.json();
              setClaimedObjects(data);
            }}>
            Analyze
          </button>
        )}
      </div>

      <canvas 
        ref={canvasRef} 
        width={900} 
        height={500} 
        style={{
          border:"1px solid #0f0",
          marginTop:15,
          width:"100%",
          maxHeight:"70vh"
        }}
      />

      {showMinigame && currentObject && (
        <MinigameModal
          object={currentObject}
          onClose={() => setShowMinigame(false)}
          onResolved={async ({ score, maxScore }: any) => {
            await fetch("/api/resolve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
               objectId: currentObject.id,
               score,
               maxScore
              })
            });

            setShowMinigame(false);
            setCanAnalyze(true);
          }}
        />
      )}

      {showWormhole && currentObject && (
  <WormholeModal
    object={currentObject}
    onClose={() => setShowWormhole(false)}
  />
)}


    </div>

    {/* COLUMNA DERECHA - PANEL */}
    <div style={{
      flex:1,
      borderLeft:"1px solid #0f0",
      padding:15,
      minWidth:250
    }}>
      <h3>🚀 Ship Panel</h3>

      <div style={{marginTop:10}}>
        <strong>Energy:</strong> {player.energy.toFixed(0)} / {player.maxEnergy}
      </div>

      <div style={{marginTop:10}}>
        <strong>Radar Range:</strong> {player.radarRange}
      </div>

      <div style={{marginTop:20}}>
        <h4>📦 Claimed Objects</h4>
        {claimedObjects.length === 0 && (
          <div style={{opacity:0.5}}>None yet</div>
        )}
        {claimedObjects.map(obj=>(
          <div key={obj.id} style={{marginBottom:6}}>
            {obj.type} | Lvl {obj.level}
            <br/>
            x{obj.multiplier?.toFixed(2)} | {obj.finalValue?.toFixed(0)}
          </div>
        ))}
      </div>
    </div>

  </div>
);
}