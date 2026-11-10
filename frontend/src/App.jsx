const ajustarVoto = async (preguntaId, opcionId, cambio) => {
  try {
    const res = await fetch(`${API_URL}/ajustar-voto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: "1234", preguntaId, opcionId, cambio }),
    });
    const data = await res.json();
    if (res.ok) {
      setEncuestas(data.encuestas);
    }
  } catch (err) {
    console.error("Error ajustando voto:", err);
  }
};

// Dentro del map de opciones en Modo Admin:
<div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
  <button onClick={() => ajustarVoto(enc.id, opt.id, -1)} style={styles.miniBtn}>-</button>
  <button onClick={() => ajustarVoto(enc.id, opt.id, 1)} style={styles.miniBtn}>+</button>
</div>