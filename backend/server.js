const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let encuestas = [
  {
    id: 1,
    pregunta: "¿Cuál es tu entorno principal de ejecución en Backend?",
    opciones: [
      { id: "opt1", texto: "Node.js", url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", resumen: "Entorno de ejecución de JS en servidor.", usos: "APIs, microservicios.", votos: 0 },
      { id: "opt2", texto: "Python (FastAPI / Django)", url: "https://fastapi.tiangolo.com/", resumen: "Lenguaje ideal para desarrollo rápido e IA.", usos: "APIs asíncronas, Ciencia de Datos.", votos: 0 },
      { id: "opt3", texto: "Java (Spring Boot)", url: "https://spring.io/projects/spring-boot", resumen: "Framework empresarial tipado y confiable.", usos: "Sistemas bancarios.", votos: 0 }
    ]
  },
  {
    id: 2,
    pregunta: "¿Qué librería/framework Frontend dominas más?",
    opciones: [
      { id: "opt1", texto: "React", url: "https://react.dev/", resumen: "Librería basada en componentes.", usos: "SPAs, Web Apps.", votos: 0 },
      { id: "opt2", texto: "Vue.js", url: "https://vuejs.org/guide/introduction.html", resumen: "Framework progresivo y amigable.", usos: "Interfaces dinámicas.", votos: 0 },
      { id: "opt3", texto: "Angular", url: "https://angular.dev/", resumen: "Framework empresarial robusto.", usos: "Web Apps complejas.", votos: 0 }
    ]
  }
];

app.get('/api/encuesta', (req, res) => res.json(encuestas));

// Votar permitiendo múltiples opciones por pregunta
app.post('/api/votar', (req, res) => {
  const { preguntaId, opcionesIds } = req.body;
  const encuesta = encuestas.find(e => e.id === preguntaId);
  if (encuesta && Array.isArray(opcionesIds)) {
    opcionesIds.forEach(opId => {
      const opcion = encuesta.opciones.find(o => o.id === opId);
      if (opcion) opcion.votos++;
    });
  }
  res.json(encuestas);
});

// Endpoint para crear preguntas nuevas (Modo Admin)
app.post('/api/crear-pregunta', (req, res) => {
  const { pin, pregunta, opciones } = req.body;
  if (pin !== "1234") return res.status(401).json({ error: "PIN incorrecto" });

  const nuevaPregunta = {
    id: Date.now(),
    pregunta,
    opciones: opciones.map((opt, i) => ({
      id: `opt_${Date.now()}_${i}`,
      texto: opt.texto,
      url: opt.url || "https://google.com",
      resumen: opt.resumen || "Opción personalizada añadida por administrador.",
      usos: opt.usos || "Uso general.",
      votos: 0
    }))
  };

  encuestas.push(nuevaPregunta);
  res.json({ success: true, encuestas });
});

app.post('/api/reset', (req, res) => {
  const { pin } = req.body;
  if (pin === "1234") {
    encuestas.forEach(e => e.opciones.forEach(o => o.votos = 0));
    return res.json({ success: true, encuestas });
  }
  res.status(401).json({ error: "PIN incorrecto" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor activo en puerto ${PORT}`));