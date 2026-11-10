const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const encuestas = [
  {
    id: 1,
    pregunta: "¿Cuál es tu entorno favorito para aprender desarrollo web?",
    opciones: [
      { id: "opt1", texto: "JavaScript / Node.js", votos: 0 },
      { id: "opt2", texto: "Python", votos: 0 },
      { id: "opt3", texto: "Java / C#", votos: 0 }
    ]
  },
  {
    id: 2,
    pregunta: "¿Qué framework frontend prefieres?",
    opciones: [
      { id: "opt1", texto: "React", votos: 0 },
      { id: "opt2", texto: "Vue.js", votos: 0 },
      { id: "opt3", texto: "Angular", votos: 0 }
    ]
  },
  {
    id: 3,
    pregunta: "¿Qué base de datos utilizas con mayor frecuencia?",
    opciones: [
      { id: "opt1", texto: "PostgreSQL / MySQL", votos: 0 },
      { id: "opt2", texto: "MongoDB", votos: 0 },
      { id: "opt3", texto: "SQLite / Redis", votos: 0 }
    ]
  }
];

// Endpoint GET todas las preguntas
app.get('/api/encuesta', (req, res) => res.json(encuestas));

// Endpoint POST voto por pregunta y opción
app.post('/api/votar', (req, res) => {
  const { preguntaId, opcionId } = req.body;
  const encuesta = encuestas.find(e => e.id === preguntaId);
  if (encuesta) {
    const opcion = encuesta.opciones.find(o => o.id === opcionId);
    if (opcion) opcion.votos++;
  }
  res.json(encuestas);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});