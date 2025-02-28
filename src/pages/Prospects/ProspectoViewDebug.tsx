import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button,
  CircularProgress,
} from '@mui/material';

// Componentes compartidos
import Navbar from '../../components/Navigation/Navbar/Navbar';
import Header from '../../components/Header/Header';

// Servicios y tipos
import { prospectoService } from '../../services/prospectoService';
import { Prospecto } from '../../types/Prospecto';

// Estilos - usamos estilos inline para evitar problemas con CSS
// import styles from './ProspectoView.module.css';

const ProspectoViewDebug: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [prospecto, setProspecto] = useState<Prospecto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Para debug
  const [loadingState, setLoadingState] = useState<string>("Iniciando...");

  // Cargar datos del prospecto
  useEffect(() => {
    const fetchProspecto = async () => {
      try {
        setLoadingState("Verificando ID...");
        
        if (!id) {
          setError('ID de prospecto no válido');
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setError(null);
        
        setLoadingState("Realizando petición a la API...");
        console.log("Obteniendo prospecto con ID:", id);
        
        const data = await prospectoService.getProspectoById(id);
        
        setLoadingState("Datos recibidos...");
        console.log("Datos recibidos:", data);
        
        if (data) {
          setProspecto(data);
          setLoadingState("Prospecto cargado correctamente");
        } else {
          setError('No se encontró el prospecto');
          setLoadingState("No se encontró el prospecto");
        }
      } catch (err) {
        console.error('Error al cargar el prospecto:', err);
        setError('Error al cargar los datos');
        setLoadingState("Error: " + JSON.stringify(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProspecto();
  }, [id]);

  const containerStyle = {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderRadius: '8px',
    marginTop: '20px'
  };

  const headerStyle = {
    marginBottom: '20px',
    padding: '10px 0',
    borderBottom: '1px solid #eee'
  };

  const fieldStyle = {
    marginBottom: '10px',
    display: 'flex'
  };

  const labelStyle = {
    fontWeight: 'bold',
    width: '150px',
    marginRight: '10px'
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ padding: '20px' }}>
        <Header />

        <div style={containerStyle}>
          <h2 style={{ color: '#333' }}>Estado de depuración</h2>
          <div style={fieldStyle}>
            <div style={labelStyle}>ID en la URL:</div>
            <div>{id || 'No disponible'}</div>
          </div>
          <div style={fieldStyle}>
            <div style={labelStyle}>Estado de carga:</div>
            <div>{isLoading ? 'Cargando...' : 'Completado'}</div>
          </div>
          <div style={fieldStyle}>
            <div style={labelStyle}>Mensaje de carga:</div>
            <div>{loadingState}</div>
          </div>
          <div style={fieldStyle}>
            <div style={labelStyle}>Error:</div>
            <div style={{ color: 'red' }}>{error || 'Ninguno'}</div>
          </div>
          <div style={fieldStyle}>
            <div style={labelStyle}>Datos obtenidos:</div>
            <div>{prospecto ? 'Sí' : 'No'}</div>
          </div>

          {isLoading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <CircularProgress />
              <p>Cargando datos del prospecto...</p>
            </div>
          )}

          {!isLoading && error && (
            <div style={{ color: 'red', padding: '20px', textAlign: 'center' }}>
              <p>{error}</p>
              <Button 
                variant="contained" 
                onClick={() => navigate('/prospectos')}
                style={{ marginTop: '10px' }}
              >
                Volver a la lista
              </Button>
            </div>
          )}

          {!isLoading && !error && prospecto && (
            <div>
              <h2 style={headerStyle}>Información del Prospecto</h2>
              
              <div style={fieldStyle}>
                <div style={labelStyle}>Nombre:</div>
                <div>{prospecto.nombreCliente || 'No disponible'}</div>
              </div>
              
              <div style={fieldStyle}>
                <div style={labelStyle}>Contacto:</div>
                <div>{prospecto.contacto || 'No disponible'}</div>
              </div>
              
              <div style={fieldStyle}>
                <div style={labelStyle}>Oficial:</div>
                <div>{prospecto.oficial || 'No disponible'}</div>
              </div>
              
              <div style={fieldStyle}>
                <div style={labelStyle}>Referente:</div>
                <div>{prospecto.referente || 'No disponible'}</div>
              </div>
              
              <div style={fieldStyle}>
                <div style={labelStyle}>Tipo Cliente:</div>
                <div>{prospecto.tipoCliente || 'No disponible'}</div>
              </div>
              
              <div style={fieldStyle}>
                <div style={labelStyle}>Estado:</div>
                <div>{prospecto.activo || 'No disponible'}</div>
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="outlined" onClick={() => navigate('/prospectos')}>
                  Volver a la lista
                </Button>
                <Button variant="contained" color="primary">
                  Editar Prospecto
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProspectoViewDebug;