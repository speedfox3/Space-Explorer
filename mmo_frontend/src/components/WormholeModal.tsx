export default function WormholeModal({ object, onClose }: any) {

  async function travel() {
    await fetch("/api/travel", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        targetSystemId: object.wormhole.targetSystemId
      })
    });

    onClose();
  }

  return (
    <div style={{
      position:"fixed",
      top:0,left:0,
      width:"100vw",
      height:"100vh",
      background:"rgba(0,0,0,0.85)",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      zIndex:999
    }}>
      <div style={{
        background:"#111",
        padding:40,
        border:"2px solid cyan",
        width:500
      }}>
        <h2>🌀 Wormhole Detected</h2>
        <p>Destination: {object.wormhole.targetSystemId.toUpperCase()}</p>

        <button onClick={travel}>Travel</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
