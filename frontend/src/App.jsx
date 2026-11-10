import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://sistemas-encuestas-tatiana.onrender.com/api';

export default function App() {
  const [encuestas, setEncuestas] = useState([]);
  const [respuestas, setRespuestas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [modoAdmin, setModoAdmin] = useState(false);
  const [modalData, setModalData] = useState(null);

  const cargarDatos = () => {
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
  };

  useEffect(() => {
    cargarDatos();
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

  const reiniciarVotos = async () => {
    const pin = prompt('Introduce el PIN de Administrador (Default: 1234):');
    if (!pin) return;

    try {
      const res = await fetch(`${API_URL}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (res.ok) {
        setEncuestas(data.encuestas);
        alert('Se han reiniciado todos los contadores de votos.');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Error al intentar reiniciar contadores.');
    }
  };

  if (cargando) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.loadingText}>Cargando sistema de encuestas...</div>
      </div>
    );
  }

  const totalParticipantes = encuestas.length > 0 
    ? encuestas[0].opciones.reduce((a, b) => a + b.votos, 0)
    : 0;

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        
        {/* Switch de Modo */}
        <div style={styles.topBar}>
          <button 
            onClick={() => setModoAdmin(!modoAdmin)} 
            style={modoAdmin ? styles.adminActiveBtn : styles.adminBtn}
          >
            {modoAdmin ? '👤 Cambiar a Vista Usuario' : '⚙️ Modo Administrador'}
          </button>
        </div>

        {/* Encabezado */}
        <header style={styles.header}>
          <span style={styles.badge}>
            {modoAdmin ? 'Panel de Control - Administrador' : 'Plataforma Interactiva Full Stack'}
          </span>
          <h1 style={styles.title}>
            {modoAdmin ? 'Métricas & Métricas de Votación' : 'Evaluación & Tendencias Web'}
          </h1>
          <p style={styles.subtitle}>
            {modoAdmin 
              ? 'Dashboard en tiempo real con analíticas de respuestas acumuladas.' 
              : 'Selecciona tus preferencias técnicas. Haz clic en 📖 para ver detalles de cada opción.'}
          </p>
        </header>

        {/* VISTA ADMINISTRADOR */}
        {modoAdmin ? (
          <div style={styles.card}>
            <div style={styles.adminStatsBar}>
              <div>
                <span style={styles.statLabel}>Total Participantes:</span>
                <span style={styles.statValue}>{totalParticipantes} usuario(s)</span>
              </div>
              <button onClick={reiniciarVotos} style={styles.resetBtn}>
                🗑️ Reiniciar Contadores
              </button>
            </div>

            <h2 style={styles.cardTitle}>Resultados Consolidados</h2>

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
                      <div key={opt.id} style={{ marginBottom: '14px' }}>
                        <div style={styles.resultHeader}>
                          <span style={{ fontWeight: '500' }}>{opt.texto}</span>
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
          </div>
        ) : (
          /* VISTA USUARIO */
          <div>
            {!enviado ? (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>Cuestionario Técnico (5 Preguntas)</h2>
                <p style={styles.cardSub}>Elige una opción para cada pregunta para enviar tu respuesta.</p>

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
                            <button
                              type="button"
                              onClick={() => setModalData(opt)}
                              style={styles.infoBtn}
                              title="Ver información técnica"
                            >
                              📖 Info
                            </button>
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
                    : '✓ Enviar Mis Respuestas'}
                </button>
              </div>
            ) : (
              <div style={styles.card}>
                <div style={styles.successTag}>✓ ¡Voto Registrado con Éxito!</div>
                <h2 style={styles.cardTitle}>¡Gracias por participar!</h2>
                <p style={styles.cardSub}>Tu opinión ha sido almacenada en el servidor en tiempo real.</p>

                <button onClick={() => { setEnviado(false); setRespuestas({}); }} style={styles.secondaryBtn}>
                  🔄 Responder nuevamente
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODAL INFORMATIVO */}
        {modalData && (
          <div style={styles.modalOverlay} onClick={() => setModalData(null)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>{modalData.texto}</h3>
                <button style={styles.closeBtn} onClick={() => setModalData(null)}>✕</button>
              </div>
              <p style={styles.modalResumen}>{modalData.resumen}</p>
              <div style={styles.modalUsoBox}>
                <strong>Casos de Uso Principales:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#cbd5e1' }}>{modalData.usos}</p>
              </div>
              <a
                href={modalData.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.docOfficialLink}
              >
                🌐 Ir a la Documentación Oficial ↗
              </a>
            </div>
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
    padding: '30px 20px',
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
  topBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '15px',
  },
  adminBtn: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    border: '1px solid #334155',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  adminActiveBtn: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  header: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  badge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    border: '1px solid #10b981',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.825rem',
    fontWeight: '600',
  },
  title: {
    fontSize: '2rem',
    margin: '10px 0 6px 0',
    color: '#ffffff',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '0.95rem',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    border: '1px solid #334155',
  },
  cardTitle: {
    fontSize: '1.3rem',
    margin: '0 0 4px 0',
    color: '#f8fafc',
  },
  cardSub: {
    color: '#94a3b8',
    fontSize: '0.875rem',
    marginBottom: '20px',
  },
  questionCard: {
    backgroundColor: '#0f172a',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid #334155',
  },
  questionText: {
    fontSize: '1rem',
    color: '#e2e8f0',
    marginTop: 0,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  numberBadge: {
    backgroundColor: '#10b981',
    color: '#0f172a',
    borderRadius: '50%',
    width: '22px',
    height: '22px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
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
    fontSize: '0.925rem',
    fontWeight: '500',
    cursor: 'pointer',
    textAlign: 'left',
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
  infoBtn: {
    color: '#34d399',
    backgroundColor: '#064e3b',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #059669',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#10b981',
    color: '#0f172a',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1rem',
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
    fontSize: '0.875rem',
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
  adminStatsBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    padding: '14px 18px',
    borderRadius: '10px',
    border: '1px solid #334155',
    marginBottom: '20px',
  },
  statLabel: {
    color: '#94a3b8',
    marginRight: '8px',
    fontSize: '0.9rem',
  },
  statValue: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  resetBtn: {
    backgroundColor: '#7f1d1d',
    color: '#fca5a5',
    border: '1px solid #991b1b',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.825rem',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.3rem',
    color: '#10b981',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '1.2rem',
    cursor: 'pointer',
  },
  modalResumen: {
    color: '#e2e8f0',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  modalUsoBox: {
    backgroundColor: '#0f172a',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    fontSize: '0.875rem',
    marginBottom: '20px',
  },
  docOfficialLink: {
    display: 'block',
    textAlign: 'center',
    backgroundColor: '#10b981',
    color: '#0f172a',
    padding: '12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
};