import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [encuesta, setEncuesta] = useState(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [votoRegistrado, setVotoRegistrado] = useState(false);

  const cargarEncuesta = async () => {
    try {
      const res = await axios.get(`${API_URL}/encuesta`);
      setEncuesta(res.data);
    } catch (error) {
      console.error('Error al obtener la encuesta:', error);
    }
  };

  useEffect(() => {
    cargarEncuesta();
  }, []);

  const handleVotar = async (e) => {
    e.preventDefault();
    if (!opcionSeleccionada) return alert('Por favor selecciona una opción');

    try {
      const res = await axios.post(`${API_URL}/votar`, { opcionId: opcionSeleccionada });
      setEncuesta(res.data.encuesta);
      setVotoRegistrado(true);
    } catch (error) {
      console.error('Error al enviar el voto:', error);
    }
  };

  if (!encuesta) return <div style={{ padding: '20px' }}>Cargando encuesta...</div>;

  const totalVotos = encuesta.opciones.reduce((acc, curr) => acc + curr.votos, 0);

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Arial, sans-serif', border: '1px solid #ddd', borderRadius: '8px', color: '#333', background: '#fff' }}>
      <h2>{encuesta.pregunta}</h2>

      {!votoRegistrado ? (
        <form onSubmit={handleVotar} style={{ marginTop: '20px' }}>
          {encuesta.opciones.map((opcion) => (
            <div key={opcion.id} style={{ marginBottom: '10px', textAlign: 'left' }}>
              <label style={{ fontSize: '16px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="encuesta"
                  value={opcion.id}
                  onChange={() => setOpcionSeleccionada(opcion.id)}
                  style={{ marginRight: '10px' }}
                />
                {opcion.texto}
              </label>
            </div>
          ))}
          <button
            type="submit"
            style={{ marginTop: '15px', padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Votar
          </button>
        </form>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <h3>Resultados en tiempo real:</h3>
          {encuesta.opciones.map((opcion) => {
            const porcentaje = totalVotos > 0 ? Math.round((opcion.votos / totalVotos) * 100) : 0;
            return (
              <div key={opcion.id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>{opcion.texto}</span>
                  <span>{opcion.votos} voto(s) ({porcentaje}%)</span>
                </div>
                <div style={{ width: '100%', background: '#eee', height: '20px', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${porcentaje}%`, background: '#28a745', height: '100%' }}></div>
                </div>
              </div>
            );
          })}
          <button
            onClick={() => setVotoRegistrado(false)}
            style={{ marginTop: '15px', padding: '8px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Volver a votar
          </button>
        </div>
      )}
    </div>
  );
}

export default App;