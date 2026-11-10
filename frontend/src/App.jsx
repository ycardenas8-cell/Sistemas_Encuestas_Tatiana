import { useState, useEffect } from 'react';
import './App.css';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://sistemas-encuestas-tatiana.onrender.com/api';

export default function App() {
  const [encuestas, setEncuestas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/encuesta`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con la API');
        return res.json();
      })
      .then((data) => {
        setEncuestas(data);
        setCargando(false);
      })
      .catch((err) => {
        console.error('Error cargando encuestas:', err);
        setError('No se pudo conectar con el servidor backend.');
        setCargando(false);
      });
  }, []);

  const seleccionarOpcion = (preguntaId, opcionId) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));
  };

  const enviarVotos = async () => {
    try {
      let ultimosDatos = encuestas;
      for (const [preguntaId, opcionId] of Object.entries(respuestas)) {
        const res = await fetch(`${API_URL}/votar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ preguntaId: Number(preguntaId), opcionId }),
        });
        ultimosDatos = await res.json();
      }
      setEncuestas(ultimosDatos);
      setEnviado(true);
    } catch (err) {
      console.error('Error al enviar votos:', err);
      alert('Hubo un error al guardar tus respuestas.');
    }
  };

  if (cargando) {
    return (
      <div className="center">
        <div className="spinner"></div>
        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>Cargando sistema de encuestas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="center">
        <div className="survey-card" style={{ textAlign: 'center' }}>
          <h2>⚠️ Algo salió mal</h2>
          <p className="subtitle">{error}</p>
          <button className="submit-btn" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Encabezado Principal */}
      <header className="header">
        <div className="header-content">
          <span className="badge">Plataforma Interactiva Full Stack</span>
          <h1>Encuesta de Tecnologías Web</h1>
          <p>Plataforma para medir preferencias en herramientas de desarrollo.</p>
        </div>
      </header>

      {/* Contenido / Tarjeta de Preguntas */}
      <main className="main-content">
        {!enviado ? (
          <div className="survey-card">
            <h2>Cuestionario Técnico</h2>
            <p className="subtitle">
              Selecciona una opción para cada pregunta para enviar tus respuestas.
            </p>

            {encuestas.map((enc, idx) => (
              <div key={enc.id} className="question-block">
                <p className="question-title">
                  <span className="q-number">{idx + 1}.</span> {enc.pregunta}
                </p>
                <div className="options-grid">
                  {enc.opciones.map((opt) => {
                    const isSelected = respuestas[enc.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => seleccionarOpcion(enc.id, opt.id)}
                      >
                        <span className="radio-circle"></span>
                        {opt.texto}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              className="submit-btn"
              disabled={Object.keys(respuestas).length < encuestas.length}
              onClick={enviarVotos}
            >
              {Object.keys(respuestas).length < encuestas.length
                ? `Responde todas las preguntas (${Object.keys(respuestas).length}/${encuestas.length})`
                : 'Enviar Respuestas'}
            </button>
          </div>
        ) : (
          <div className="survey-card">
            <div className="success-badge">✓ ¡Gracias por tu participación!</div>
            <h2>Resultados en Tiempo Real</h2>
            <p className="subtitle">
              Porcentaje global de respuestas registradas en el servidor.
            </p>

            {encuestas.map((enc, idx) => {
              const totalVotos = enc.opciones.reduce((a, b) => a + b.votos, 0);
              return (
                <div key={enc.id} className="result-block">
                  <p className="question-title">
                    <span className="q-number">{idx + 1}.</span> {enc.pregunta}
                  </p>
                  <div className="results-list">
                    {enc.opciones.map((opt) => {
                      const porcentaje =
                        totalVotos > 0
                          ? Math.round((opt.votos / totalVotos) * 100)
                          : 0;
                      return (
                        <div key={opt.id} className="result-item">
                          <div className="result-header">
                            <span>{opt.texto}</span>
                            <span className="vote-count">
                              {opt.votos} voto(s) ({porcentaje}%)
                            </span>
                          </div>
                          <div className="progress-bar-bg">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${porcentaje}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button className="secondary-btn" onClick={() => setEnviado(false)}>
              Volver a responder
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Sistema de Encuestas • Desplegado en Render</p>
      </footer>
    </div>
  );
}