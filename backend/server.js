// Endpoint para modificar votos de una opción específica (Modo Admin)
app.post('/api/ajustar-voto', (req, res) => {
  const { pin, preguntaId, opcionId, cambio } = req.body;
  if (pin !== "1234") {
    return res.status(401).json({ error: "PIN incorrecto" });
  }

  const encuesta = encuestas.find(e => e.id === preguntaId);
  if (encuesta) {
    const opcion = encuesta.opciones.find(o => o.id === opcionId);
    if (opcion) {
      opcion.votos = Math.max(0, opcion.votos + cambio); // Evita votos negativos
    }
  }
  res.json({ success: true, encuestas });
});