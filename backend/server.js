const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Datos de la encuesta en memoria
let encuesta = {
  pregunta: '¿Cuál es tu lenguaje o entorno favorito para aprender web?',
  opciones: [
    { id: 1, texto: 'JavaScript / Node.js', votos: 0 },
    { id: 2, texto: 'Python', votos: 0 },
    { id: 3, texto: 'Java / C#', votos: 0 }
  ]
};

// Ruta 1: Obtener la encuesta y sus resultados
app.get('/api/encuesta', (req, res) => {
  res.json(encuesta);
});

// Ruta 2: Registrar un voto
app.post('/api/votar', (req, res) => {
  const { opcionId } = req.body;
  const opcion = encuesta.opciones.find(o => o.id === parseInt(opcionId));

  if (!opcion) {
    return res.status(404).json({ error: 'Opción no encontrada' });
  }

  opcion.votos += 1;
  res.json({ mensaje: 'Voto registrado con éxito', encuesta });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor de encuestas corriendo en el puerto ${PORT}`);
});