async function loadShip() {
  const res = await fetch("http://localhost:8000/api/ship/");
  const data = await res.json();

  document.getElementById("ship-info").innerHTML = `
    <p>Nave nivel: ${data.level}</p>
    <p>Carga: ${data.cargo}</p>
    <p>Motor: ${data.engine}</p>
  `;
}
