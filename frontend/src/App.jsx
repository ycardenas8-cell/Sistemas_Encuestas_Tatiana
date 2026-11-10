import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function App() {
  const [encuestas, setEncuestas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/encuesta`)
      .then((res) => res.json())
      .then((data) => {
        setEncuestas(data);
        setCargando(false);
      })
      .catch((err) => console.error('Error cargando encuestas:', err));
  }, []);

  const SeleccionarOpcion = (preguntaId, opcionId) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));
  };

  const EnviarVotos = async () => {
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
  };

  if (cargando) {
    return (
      <div className="container center">
        <div className="spinner"></div>
        <p>Cargando sistema de encuestas...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Header profesional */}
      <header className="header">
        <div className="header-content">
          <span className="badge">Plataforma Interactiva</span>
          <h1>Sistema de Encuestas Full Stack</h1>
          <p>
            Encuesta académica sobre tecnologías web y herramientas de desarrollo.
          </p>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="main-content">
        {!enviado ? (
          <div className="survey-card">
            <h2>Cuestionario Técnico</h2>
            <p className="subtitle">
              Responde a las siguientes preguntas y consulta los resultados globales.
            </p>

            {encuestas.map((enc, idx) => (
              <div key={enc.id} className="question-block">
                <p className="question-title">
                  <span className="q-number">{idx + 1}.</span> {enc.pregunta}
                </p>
                <div className="options-grid">
                  {enc.opciones.map((opt) => {
                    constisSelected = respuestas[enc.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`option-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => SeleccionarOpcion(enc.id, opt.id)}
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
              onClick={EnviarVotos}
            >
              {Object.keys(respuestas).length < encuestas.length
                ? `Responde todas las preguntas (${Object.keys(respuestas).length}/${encuestas.length})`
                : 'Enviar Respuestas'}
            </button>
          </div>
        ) : (
          <div className="survey-card">
            <div className="success-badge">✓ Voto registrado</div>
            <h2>Resultados en Tiempo Real</h2>
            <p className="subtitle">
              Estadísticas globales acumuladas en el servidor.
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
              Volver a Votar / Ver Cuestionario
            </button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Sistema de Encuestas Tatiana • Desplegado en Render</p>
      </footer>
    </div>
  );
}