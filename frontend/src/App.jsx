import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://sistemas-encuestas-tatiana.onrender.com/api';

export default function App() {
  const [encuestas, setEncuestas] = useState([]);
  const [respuestas, setRespuestas] = useState({}); // { preguntaId: [opcionId1, opcionId2] }
  const [cargando, setCargando] = useState(true);
  const [enviado, setEnviado] = useState(false);
  const [modoAdmin, setModoAdmin] = useState(false);
  const [modalData, setModalData] = useState(null);

  // Formulario de nueva pregunta
  const [nuevaPreguntaTexto, setNuevaPreguntaTexto] = useState('');
  const [opcion1, setOpcion1] = useState('');
  const [opcion2, setOpcion2] = useState('');

  const cargarDatos = () => {
    fetch(`${API_URL}/encuesta`)
      .then((res) => res.json())
      .then((data) => {
        setEncuestas(data);
        setCargando(false);
      });
  };

  useEffect(() => { cargarDatos(); }, []);

  const toggleOpcion = (preguntaId, opcionId) => {
    setRespuestas((prev) => {
      const seleccionadas = prev[preguntaId] || [];
      const existe = seleccionadas.includes(opcionId);
      const nuevas = existe 
        ? seleccionadas.filter((id) => id !== opcionId)
        : [...seleccionadas, opcionId];
      return { ...prev, [preguntaId]: nuevas };
    });
  };

  const enviarVotos = async () => {
    try {
      let ultimosDatos = encuestas;
      for (const [preguntaId, opcionesIds] of Object.entries(respuestas)) {
        if (opcionesIds.length > 0) {
          const res = await fetch(`${API_URL}/votar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ preguntaId: Number(preguntaId), opcionesIds }),
          });
          ultimosDatos = await res.json();
        }
      }
      setEncuestas(ultimosDatos);
      setEnviado(true);
    } catch (err) {
      alert('Error enviando respuestas.');
    }
  };

  const agregarPreguntaAdmin = async (e) => {
    e.preventDefault();
    if (!nuevaPreguntaTexto || !opcion1 || !opcion2) return alert('Completa los campos obligatorios');

    try {
      const res = await fetch(`${API_URL}/crear-pregunta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: '1234',
          pregunta: nuevaPreguntaTexto,
          opciones: [{ texto: opcion1 }, { texto: opcion2 }]
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEncuestas(data.encuestas);
        setNuevaPreguntaTexto('');
        setOpcion1('');
        setOpcion2('');
        alert('¡Pregunta creada exitosamente!');
      }
    } catch (err) {
      alert('Error creando pregunta.');
    }
  };

  if (cargando) return <div style={{ color: '#10b981', textAlign: 'center', marginTop: '100px' }}>Cargando...</div>;

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <button onClick={() => setModoAdmin(!modoAdmin)} style={styles.adminBtn}>
            {modoAdmin ? '👤 Vista Usuario' : '⚙️ Modo Administrador'}
          </button>
        </div>

        <header style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: '#fff' }}>{modoAdmin ? 'Panel de Control Admin' : 'Evaluación & Tendencias Web'}</h1>
        </header>

        {modoAdmin ? (
          <div style={styles.card}>
            {/* Formulario de Creación */}
            <form onSubmit={agregarPreguntaAdmin} style={styles.formBox}>
              <h3 style={{ color: '#10b981', marginTop: 0 }}>➕ Crear Nueva Pregunta</h3>
              <input
                type="text"
                placeholder="Escribe el título de la pregunta..."
                value={nuevaPreguntaTexto}
                onChange={(e) => setNuevaPreguntaTexto(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Opción 1"
                value={opcion1}
                onChange={(e) => setOpcion1(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Opción 2"
                value={opcion2}
                onChange={(e) => setOpcion2(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.addBtn}>Guardar Pregunta</button>
            </form>

            <h2 style={{ color: '#fff', marginTop: '30px' }}>Resultados Actuales</h2>
            {encuestas.map((enc, idx) => (
              <div key={enc.id} style={styles.questionCard}>
                <h4 style={{ color: '#e2e8f0' }}>{idx + 1}. {enc.pregunta}</h4>
                {enc.opciones.map(opt => (
                  <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', marginBottom: '6px' }}>
                    <span>{opt.texto}</span>
                    <strong style={{ color: '#10b981' }}>{opt.votos} votos</strong>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          /* Vista Usuario con Selección Múltiple */
          <div style={styles.card}>
            {!enviado ? (
              <>
                <p style={{ color: '#94a3b8' }}>Puedes seleccionar varias opciones por pregunta (Casillas de verificación):</p>
                {encuestas.map((enc, idx) => (
                  <div key={enc.id} style={styles.questionCard}>
                    <h3 style={{ color: '#e2e8f0', margin: '0 0 12px 0' }}>{idx + 1}. {enc.pregunta}</h3>
                    {enc.opciones.map((opt) => {
                      const seleccionada = (respuestas[enc.id] || []).includes(opt.id);
                      return (
                        <div key={opt.id} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                          <button
                            type="button"
                            onClick={() => toggleOpcion(enc.id, opt.id)}
                            style={{
                              ...styles.checkboxBtn,
                              ...(seleccionada ? styles.checkboxActive : {})
                            }}
                          >
                            {seleccionada ? '☑ ' : '☐ '} {opt.texto}
                          </button>
                          <button type="button" onClick={() => setModalData(opt)} style={styles.infoBtn}>📖 Info</button>
                        </div>
                      );
                    })}
                  </div>
                ))}
                <button onClick={enviarVotos} style={styles.submitBtn}>✓ Enviar Respuestas</button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#10b981' }}>¡Respuestas Guardadas!</h2>
                <button onClick={() => { setEnviado(false); setRespuestas({}); }} style={styles.secondaryBtn}>Volver a responder</button>
              </div>
            )}
          </div>
        )}

        {/* Modal Informativo */}
        {modalData && (
          <div style={styles.modalOverlay} onClick={() => setModalData(null)}>
            <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <h3 style={{ color: '#10b981', marginTop: 0 }}>{modalData.texto}</h3>
              <p style={{ color: '#e2e8f0' }}>{modalData.resumen}</p>
              <button style={styles.addBtn} onClick={() => setModalData(null)}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageBackground: { backgroundColor: '#0f172a', minHeight: '100vh', padding: '30px 20px', fontFamily: 'sans-serif' },
  container: { maxWidth: '720px', margin: '0 auto' },
  topBar: { display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' },
  adminBtn: { backgroundColor: '#1e293b', color: '#10b981', border: '1px solid #10b981', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  card: { backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' },
  questionCard: { backgroundColor: '#0f172a', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid #334155' },
  checkboxBtn: { flex: 1, padding: '10px 14px', backgroundColor: '#1e293b', border: '2px solid #059669', borderRadius: '8px', color: '#fff', cursor: 'pointer', textAlign: 'left' },
  checkboxActive: { backgroundColor: '#059669', fontWeight: 'bold' },
  infoBtn: { backgroundColor: '#064e3b', color: '#34d399', border: '1px solid #059669', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { width: '100%', padding: '14px', backgroundColor: '#10b981', color: '#0f172a', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' },
  secondaryBtn: { padding: '12px 20px', backgroundColor: 'transparent', color: '#10b981', border: '1px solid #10b981', borderRadius: '8px', cursor: 'pointer', marginTop: '15px' },
  formBox: { backgroundColor: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff' },
  addBtn: { padding: '10px', backgroundColor: '#10b981', color: '#0f172a', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalCard: { backgroundColor: '#1e293b', padding: '24px', borderRadius: '12px', maxWidth: '400px', width: '100%' }
};