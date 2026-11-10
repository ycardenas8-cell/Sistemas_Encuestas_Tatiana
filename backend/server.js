const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const encuestas = [
  {
    id: 1,
    pregunta: "¿Cuál es tu entorno principal de ejecución en Backend?",
    opciones: [
      { id: "opt1", texto: "Node.js", url: "https://nodejs.org/docs", votos: 0 },
      { id: "opt2", texto: "Python (FastAPI / Django)", url: "https://docs.python.org/3/", votos: 0 },
      { id: "opt3", texto: "Java (Spring Boot)", url: "https://spring.io/projects/spring-boot", votos: 0 }
    ]
  },
  {
    id: 2,
    pregunta: "¿Qué librería/framework Frontend dominas más?",
    opciones: [
      { id: "opt1", texto: "React", url: "https://react.dev", votos: 0 },
      { id: "opt2", texto: "Vue.js", url: "https://vuejs.org", votos: 0 },
      { id: "opt3", texto: "Angular", url: "https://angular.dev", votos: 0 }
    ]
  },
  {
    id: 3,
    pregunta: "¿Qué motor de base de datos relacional/NoSQL prefieres?",
    opciones: [
      { id: "opt1", texto: "PostgreSQL", url: "https://www.postgresql.org/docs/", votos: 0 },
      { id: "opt2", texto: "MongoDB", url: "https://www.mongodb.com/docs/", votos: 0 },
      { id: "opt3", texto: "Redis", url: "https://redis.io/docs/", votos: 0 }
    ]
  },
  {
    id: 4,
    pregunta: "¿Qué herramienta utilizas para estilos y maquetación CSS?",
    opciones: [
      { id: "opt1", texto: "Tailwind CSS", url: "https://tailwindcss.com/docs", votos: 0 },
      { id: "opt2", texto: "CSS Modules / Sass", url: "https://sass-lang.com/documentation/", votos: 0 },
      { id: "opt3", texto: "Styled Components", url: "https://styled-components.com/docs", votos: 0 }
    ]
  },
  {
    id: 5,
    pregunta: "¿Qué plataforma de despliegue en la nube prefieres?",
    opciones: [
      { id: "opt1", texto: "Render", url: "https://render.com/docs", votos: 0 },
      { id: "opt2", texto: "Vercel", url: "https://vercel.com/docs", votos: 0 },
      { id: "opt3", texto: "AWS / Google Cloud", url: "https://aws.amazon.com/documentation/", votos: 0 }
    ]
  }
];

app.get('/api/encuesta', (req, res) => res.json(encuestas));

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
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});