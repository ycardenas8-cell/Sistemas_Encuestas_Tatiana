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
      { 
        id: "opt1", 
        texto: "Node.js", 
        url: "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs", 
        resumen: "Entorno de ejecución de JavaScript del lado del servidor basado en el motor V8 de Chrome.",
        usos: "APIs RESTful, microservicios, aplicaciones en tiempo real.",
        votos: 0 
      },
      { 
        id: "opt2", 
        texto: "Python (FastAPI / Django)", 
        url: "https://fastapi.tiangolo.com/", 
        resumen: "Lenguaje de alto nivel ideal para desarrollo rápido, análisis de datos e Inteligencia Artificial.",
        usos: "Web APIs asíncronas, Ciencia de Datos, Backend robusto.",
        votos: 0 
      },
      { 
        id: "opt3", 
        texto: "Java (Spring Boot)", 
        url: "https://spring.io/projects/spring-boot", 
        resumen: "Framework empresarial altamente tipado, confiable y utilizado en sistemas bancarios y a gran escala.",
        usos: "Sistemas transaccionales, arquitecturas empresariales.",
        votos: 0 
      }
    ]
  },
  {
    id: 2,
    pregunta: "¿Qué librería/framework Frontend dominas más?",
    opciones: [
      { 
        id: "opt1", 
        texto: "React", 
        url: "https://react.dev/", 
        resumen: "Librería de UI basada en componentes mantenida por Meta con el ecosistema más grande del mercado.",
        usos: "SPAs, aplicaciones móviles (React Native), Web Apps complejas.",
        votos: 0 
      },
      { 
        id: "opt2", 
        texto: "Vue.js", 
        url: "https://vuejs.org/guide/introduction.html", 
        resumen: "Framework progresivo, amigable y muy fácil de integrar con rendimiento excepcional.",
        usos: "Interfaces dinámicas, proyectos medianos y grandes.",
        votos: 0 
      },
      { 
        id: "opt3", 
        texto: "Angular", 
        url: "https://angular.dev/", 
        resumen: "Framework completo respaldado por Google que incluye enrutamiento, formularios y cliente HTTP de fábrica.",
        usos: "Aplicaciones empresariales complejas de gran tamaño.",
        votos: 0 
      }
    ]
  },
  {
    id: 3,
    pregunta: "¿Qué motor de base de datos prefieres?",
    opciones: [
      { 
        id: "opt1", 
        texto: "PostgreSQL", 
        url: "https://www.postgresql.org/about/", 
        resumen: "La base de datos relacional de código abierto más avanzada y confiable del mundo.",
        usos: "Datos estructurados, transacciones complejas, JSON nativo.",
        votos: 0 
      },
      { 
        id: "opt2", 
        texto: "MongoDB", 
        url: "https://www.mongodb.com/docs/manual/introduction/", 
        resumen: "Base de datos NoSQL orientada a documentos flexibles tipo JSON.",
        usos: "Aplicaciones con esquemas cambiantes, prototipado rápido.",
        votos: 0 
      },
      { 
        id: "opt3", 
        texto: "Redis", 
        url: "https://redis.io/docs/latest/", 
        resumen: "Almacén de datos en memoria ultra rápido utilizado como caché y corredor de mensajes.",
        usos: "Gestión de sesiones, caché de alto rendimiento, colas.",
        votos: 0 
      }
    ]
  },
  {
    id: 4,
    pregunta: "¿Qué herramienta utilizas para estilos y CSS?",
    opciones: [
      { 
        id: "opt1", 
        texto: "Tailwind CSS", 
        url: "https://tailwindcss.com/docs/utility-first", 
        resumen: "Framework CSS Utility-First para construir diseños rápidos directamente en el HTML/JSX.",
        usos: "Diseño UI rápido, personalizado y optimizado.",
        votos: 0 
      },
      { 
        id: "opt2", 
        texto: "CSS Modules / Sass", 
        url: "https://sass-lang.com/guide/", 
        resumen: "Preprocesadores y módulos CSS con alcance local para evitar colisiones de estilos.",
        usos: "Estilos modulares y escalables.",
        votos: 0 
      },
      { 
        id: "opt3", 
        texto: "Styled Components", 
        url: "https://styled-components.com/docs/basics", 
        resumen: "Librería CSS-in-JS que permite escribir código CSS dentro de componentes React.",
        usos: "Sistemas de diseño basados en temas dinámicos.",
        votos: 0 
      }
    ]
  },
  {
    id: 5,
    pregunta: "¿Qué plataforma de despliegue en la nube utilizas?",
    opciones: [
      { 
        id: "opt1", 
        texto: "Render", 
        url: "https://docs.render.com/", 
        resumen: "Nube moderna e intuitiva para alojar servicios web, bases de datos y sitios estáticos.",
        usos: "Despliegues Full Stack con integración directa de GitHub.",
        votos: 0 
      },
      { 
        id: "opt2", 
        texto: "Vercel", 
        url: "https://vercel.com/docs", 
        resumen: "Plataforma optimizada para frameworks frontend y funciones serverless.",
        usos: "Next.js, React, sitios estáticos ultra rápidos.",
        votos: 0 
      },
      { 
        id: "opt3", 
        texto: "AWS / Google Cloud", 
        url: "https://aws.amazon.com/what-is-cloud-computing/", 
        resumen: "Infraestructuras masivas en la nube con cientos de servicios configurables.",
        usos: "Arquitecturas empresariales de escala global.",
        votos: 0 
      }
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

// Endpoint para reiniciar estadísticas (Modo Admin)
app.post('/api/reset', (req, res) => {
  const { pin } = req.body;
  if (pin === "1234") {
    encuestas.forEach(e => e.opciones.forEach(o => o.votos = 0));
    return res.json({ success: true, encuestas });
  }
  res.status(401).json({ error: "PIN de administrador incorrecto" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});