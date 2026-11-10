import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://sistemas-encuestas-tatiana.onrender.com/api';

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
      .catch((err) => {
        console.error('Error al obtener encuestas:', err);
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
      console.error('Error enviando respuestas:', err);
      alert('Error de conexión al votar.');
    }
  };

  if (cargando) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.loadingText}>Cargando preguntas y recursos...</div>
      </div>
    );
  }

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        {/* Encabezado */}
        <header style={styles.header}>
          <span style={styles.badge}>Plataforma Full Stack 2026</span>
          <h1 style={styles.title}>Evaluación & Tendencias Web</h1>
          <p style={styles.subtitle}>
            Selecciona tu tecnología preferida. Puedes consultar la documentación oficial haciendo clic en 📖.
          </p>
        </header>

        {/* Cuestionario */}
        {!enviado ? (
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Cuestionario (5 Preguntas)</h2>
            <p style={styles.cardSub}>Responde todas las preguntas para enviar tu voto.</p>

            {encuestas.map((enc, idx) => (
              <div key={enc.id} style={styles.questionCard}>
                <h3 style={styles.questionText}>
                  <span style={styles.numberBadge}>{idx + 1}</span> {enc.pregunta}
                </h3>

                <div style={styles.optionsContainer}>
                  {enc.opciones.map((opt) => {
                    const estaSeleccionada = respuestas[enc.id] === opt.id;
                    return (
                      <div key={opt.id} style={styles.optionRow}>
                        <button
                          type="button"
                          onClick={() => seleccionarOpcion(enc.id, opt.id)}
                          style={{
                            ...styles.greenBtn,
                            ...(estaSeleccionada ? styles.greenBtnActive : {})
                          }}
                        >
                          <span style={styles.radioDot(estaSeleccionada)}></span>
                          {opt.texto}
                        </button>
                        {opt.url && (
                          <a
                            href={opt.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={styles.docLink}
                            title={`Ver docs de ${opt.texto}`}
                          >
                            📖 Info
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={enviarVotos}
              disabled={Object.keys(respuestas).length < encuestas.length}
              style={{
                ...styles.submitBtn,
                ...(Object.keys(respuestas).length < encuestas.length ? styles.submitBtnDisabled : {})
              }}
            >
              {Object.keys(respuestas).length < encuestas.length
                ? `Completa todas las preguntas (${Object.keys(respuestas).length}/${encuestas.length})`
                : '✓ Enviar Respuestas'}
            </button>
          </div>
        ) : (
          /* Resultados */
          <div style={styles.card}>
            <div style={styles.successTag}>✓ Respuestas Registradas</div>
            <h2 style={styles.cardTitle}>Resultados en Tiempo Real</h2>

            {encuestas.map((enc, idx) => {
              const totalVotos = enc.opciones.reduce((a, b) => a + b.votos, 0);
              return (
                <div key={enc.id} style={styles.questionCard}>
                  <h3 style={styles.questionText}>
                    <span style={styles.numberBadge}>{idx + 1}</span> {enc.pregunta}
                  </h3>
                  {enc.opciones.map((opt) => {
                    const porcentaje = totalVotos > 0 ? Math.round((opt.votos / totalVotos) * 100) : 0;
                    return (
                      <div key={opt.id} style={{ marginBottom: '12px' }}>
                        <div style={styles.resultHeader}>
                          <span>{opt.texto}</span>
                          <span style={{ fontWeight: 'bold', color: '#10b981' }}>
                            {opt.votos} voto(s) ({porcentaje}%)
                          </span>
                        </div>
                        <div style={styles.progressBg}>
                          <div style={{ ...styles.progressFill, width: `${porcentaje}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <button onClick={() => setEnviado(false)} style={styles.secondaryBtn}>
              🔄 Volver a responder
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageBackground: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    color: '#f8fafc',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '720px',
  },
  centerContainer: {
    backgroundColor: '#0f172a',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#10b981',
  },
  loadingText: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: '#10b981',
    border: '1px solid #10b981',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  title: {
    fontSize: '2.2rem',
    margin: '12px 0 6px 0',
    color: '#ffffff',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1rem',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155',
  },
  cardTitle: {
    fontSize: '1.4rem',
    margin: '0 0 6px 0',
    color: '#f8fafc',
  },
  cardSub: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  questionCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '20px',
    border: '1px solid #334155',
  },
  questionText: {
    fontSize: '1.05rem',
    color: '#e2e8f0',
    marginTop: 0,
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
  },
  numberBadge: {
    backgroundColor: '#10b981',
    color: '#0f172a',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginRight: '10px',
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  greenBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#1e293b',
    border: '2px solid #059669',
    borderRadius: '10px',
    color: '#ecfdf5',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
  },
  greenBtnActive: {
    backgroundColor: '#059669',
    color: '#ffffff',
    fontWeight: 'bold',
    boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)',
  },
  radioDot: (active) => ({
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: active ? '2px solid #ffffff' : '2px solid #10b981',
    backgroundColor: active ? '#ffffff' : 'transparent',
    marginRight: '12px',
    display: 'inline-block',
  }),
  docLink: {
    color: '#34d399',
    textDecoration: 'none',
    fontSize: '0.85rem',
    backgroundColor: '#064e3b',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #059669',
    whiteSpace: 'nowrap',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#10b981',
    color: '#0f172a',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.05rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
    color: '#64748b',
    cursor: 'not-allowed',
  },
  successTag: {
    display: 'inline-block',
    backgroundColor: '#064e3b',
    color: '#34d399',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    marginBottom: '4px',
  },
  progressBg: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    height: '10px',
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#10b981',
    height: '100%',
    borderRadius: '8px',
    transition: 'width 0.5s ease',
  },
  secondaryBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#10b981',
    border: '1px solid #10b981',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
  },
};