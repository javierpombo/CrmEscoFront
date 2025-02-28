import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card,
  Divider,
  Tab,
  Tabs,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Paper,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import Navbar from '../../components/Navigation/Navbar/Navbar';
import Header from '../../components/Header/Header';

import { prospectoService } from '../../services/prospectoService';
import { Prospecto } from '../../types/Prospecto';

import styles from './ProspectoView.module.css';

const fixedHeightStyles: Record<string, React.CSSProperties> = {
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden'
  },
  headerContainer: {
    flex: '0 0 auto'
  },
  contentWrapper: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  mainContent: {
    flex: '1 1 auto',
    overflowY: 'auto',
    padding: '16px'
  },
  tabsPanel: {
    height: 'calc(100% - 20px)',
    overflowY: 'auto'
  },
  formCard: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100% - 180px)'
  },
  tabContent: {
    height: 'calc(100% - 48px)',
    overflowY: 'auto',
    padding: '16px'
  },
  summaryCard: {
    marginBottom: '16px'
  }
};

interface EventoType {
  id: number;
  event_date: string;
  description: string;
  next_contact: string;
  createdAt?: string;
}

interface AccionType {
  id: number;
  action_date: string;
  description: string;
  next_contact: string;
  createdAt?: string;
}

const ProspectoView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [prospecto, setProspecto] = useState<Prospecto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  
  const [newEvent, setNewEvent] = useState<{ 
    event_date: string; 
    description: string; 
    next_contact: string; 
  }>({ 
    event_date: "", 
    description: "", 
    next_contact: "" 
  });
  
  const [newAction, setNewAction] = useState<{ 
    action_date: string; 
    description: string; 
    next_contact: string; 
  }>({ 
    action_date: "", 
    description: "", 
    next_contact: "" 
  });

  useEffect(() => {
    const fetchProspecto = async () => {
      if (!id) {
        setError('ID de prospecto no válido');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await prospectoService.getProspectoById(id);
        if (data) {
          setProspecto(data);
        } else {
          setError('No se encontró el prospecto');
        }
      } catch (err) {
        console.error('Error al cargar el prospecto:', err);
        setError('Error al cargar los datos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProspecto();
  }, [id]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGoBack = () => {
    navigate('/crm/prospectos');
  };
  

  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const addEvent = async () => {
    if (!prospecto || !newEvent.event_date || !newEvent.description) return;
    
    const eventToAdd: EventoType = {
      ...newEvent,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const currentEvents = prospecto.events || [];
    const updatedEvents = [...currentEvents, eventToAdd];
    
    try {
      setProspecto({ ...prospecto, events: updatedEvents });
      setNewEvent({ event_date: "", description: "", next_contact: "" });
    } catch (err) {
      console.error('Error al añadir evento:', err);
    }
  };

//  

  const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAction(prev => ({ ...prev, [name]: value }));
  };

  const addAction = async () => {
    if (!prospecto || !newAction.action_date || !newAction.description) return;
    
    const actionToAdd: AccionType = {
      ...newAction,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    
    const currentActions = prospecto.actions || [];
    const updatedActions = [...currentActions, actionToAdd];
    
    try {
      setProspecto({ ...prospecto, actions: updatedActions });
      setNewAction({ action_date: "", description: "", next_contact: "" });
    } catch (err) {
      console.error('Error al añadir acción:', err);
    }
  };

  const handleSaveChanges = async () => {
    if (!prospecto || !id) return;
    try {
      const success = await prospectoService.updateProspectoFull(id, prospecto);
      if (success) {
        console.log("Cambios guardados con éxito");
      } else {
        console.error("Error al guardar los cambios");
      }
    } catch (err) {
      console.error('Error al guardar los cambios:', err);
    }
  };

  return (
    <div style={fixedHeightStyles.pageContainer}>
      <div style={fixedHeightStyles.headerContainer}>
        {/* <Navbar /> */}
        <Header />
      </div>
      <div style={fixedHeightStyles.contentWrapper}>
        <div style={fixedHeightStyles.mainContent}>
          <div className={styles.breadcrumb}>
          <span onClick={() => navigate('/crm/clientes')}>Inicio</span>

            <span> {'>'} </span>
            <span onClick={() => navigate('/crm/prospectos')}>Prospectos</span>
            <span> {'>'} </span>
            <span>{prospecto?.nombreCliente || 'Detalle'}</span>
          </div>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} size="small">
              Volver
            </Button>
            <div className={styles.countContainer}>
              <Typography variant="body2">Eventos: {(prospecto?.events || []).length}</Typography>
              <Typography variant="body2">Acciones: {(prospecto?.actions || []).length}</Typography>
            </div>
          </Box>
          <Typography variant="h5" gutterBottom>
            {prospecto?.nombreCliente || 'Detalle de Prospecto'}
          </Typography>
          <Paper elevation={0} style={fixedHeightStyles.summaryCard} className={styles.summaryCard}>
            <Box display="flex" flexWrap="wrap" gap={2} p={1}>
              <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Referente</Typography>
                <Typography variant="body2">{prospecto?.referente || "—"}</Typography>
              </Box>
              <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Oficial</Typography>
                <Typography variant="body2">{prospecto?.oficial || "—"}</Typography>
              </Box>
              <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Último contacto</Typography>
                <Typography variant="body2">{prospecto?.ultimoContacto || "—"}</Typography>
              </Box>
              <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Tipo Cliente</Typography>
                <Typography variant="body2">{prospecto?.tipoCliente || "—"}</Typography>
              </Box>
              <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Estado</Typography>
                <Typography variant="body2">{prospecto?.activo || "—"}</Typography>
              </Box>
            </Box>
          </Paper>
          {prospecto && (
            <Card style={fixedHeightStyles.formCard}>
              <Tabs value={activeTab} onChange={handleTabChange} className={styles.tabs} variant="fullWidth">
                <Tab label="Datos personales" />
                <Tab label="Eventos" />
                <Tab label="Acciones" />
              </Tabs>
              <div style={fixedHeightStyles.tabContent}>
                {activeTab === 0 && (
                  <div style={fixedHeightStyles.tabsPanel}>
                    <div className={styles.formContent}>
                      <div className={styles.formColumn}>
                        <TextField
                          label="Nombre"
                          value={prospecto.nombreCliente || ''}
                          fullWidth
                          margin="normal"
                          size="small"
                          onChange={(e) =>
                            setProspecto({ ...prospecto, nombreCliente: e.target.value })
                          }
                        />
                        <TextField
                          label="Email / Contacto"
                          value={prospecto.contacto || ''}
                          fullWidth
                          margin="normal"
                          size="small"
                          onChange={(e) =>
                            setProspecto({ ...prospecto, contacto: e.target.value })
                          }
                        />
                        <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Estado</InputLabel>
                          <Select
                            value={prospecto.activo || 'activo'}
                            label="Estado"
                            onChange={(e: SelectChangeEvent) =>
                              setProspecto({ ...prospecto, activo: e.target.value })
                            }
                          >
                            <MenuItem value="activo">Activo</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                          </Select>
                        </FormControl>
                      </div>
                      <div className={styles.formColumn}>
                        <TextField
                          label="Referente"
                          value={prospecto.referente || ''}
                          fullWidth
                          margin="normal"
                          size="small"
                          onChange={(e) =>
                            setProspecto({ ...prospecto, referente: e.target.value })
                          }
                        />
                        <TextField
                          label="Oficial"
                          value={prospecto.oficial || ''}
                          fullWidth
                          margin="normal"
                          size="small"
                          onChange={(e) =>
                            setProspecto({ ...prospecto, oficial: e.target.value })
                          }
                        />
                        <TextField
                          label="Último contacto"
                          type="date"
                          value={prospecto.ultimoContacto || ''}
                          fullWidth
                          margin="normal"
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          onChange={(e) =>
                            setProspecto({ ...prospecto, ultimoContacto: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <Divider sx={{ my: 2 }} />
                    <div className={styles.formActions}>
                      <Button variant="outlined" onClick={handleGoBack} size="small">
                        Cancelar
                      </Button>
                      <Button variant="contained" color="primary" onClick={handleSaveChanges} size="small">
                        Guardar
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div style={fixedHeightStyles.tabsPanel}>
                    <Typography variant="subtitle1" gutterBottom>
                      Eventos ({(prospecto.events || []).length})
                    </Typography>
                    {/* Resto del código para eventos */}
                  </div>
                )}
                {activeTab === 2 && (
                  <div style={fixedHeightStyles.tabsPanel}>
                    <Typography variant="subtitle1" gutterBottom>
                      Acciones ({(prospecto.actions || []).length})
                    </Typography>
                    {/* Resto del código para acciones */}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProspectoView;
