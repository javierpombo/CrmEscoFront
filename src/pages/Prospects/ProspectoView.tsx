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
  },
  listContainer: {
    height: 'calc(100% - 140px)',
    overflowY: 'auto',
    marginBottom: '8px'
  },
  addForm: {
    padding: '10px',
    backgroundColor: '#f9f9f9',
    marginTop: '10px',
    borderRadius: '4px'
  }
};

interface EventoType {
  id?: number | string;
  event_date: string;
  description: string;
  next_contact: string;
  createdAt?: string;
}

interface AccionType {
  id?: number | string;
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

  const deleteEvent = (eventId: number | string | undefined) => {
    if (!prospecto || eventId === undefined) return;
    
    const currentEvents = prospecto.events || [];
    const updatedEvents = currentEvents.filter(event => event.id !== eventId);
    
    setProspecto({ ...prospecto, events: updatedEvents });
  };

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

  const deleteAction = (actionId: number | string | undefined) => {
    if (!prospecto || actionId === undefined) return;
    
    const currentActions = prospecto.actions || [];
    const updatedActions = currentActions.filter(action => action.id !== actionId);
    
    setProspecto({ ...prospecto, actions: updatedActions });
  };

  const handleSaveChanges = async () => {
    if (!prospecto || !id) return;
    try {
      const prospectoToSave = {
        ...prospecto,
        events: prospecto.events || [],
        actions: prospecto.actions || [],
      };
      const success = await prospectoService.updateProspectoFull(id, prospectoToSave);
      // ...
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
                    
                    <div style={fixedHeightStyles.listContainer}>
                      {(prospecto.events || []).length > 0 ? (
                        (prospecto.events || []).map((event) => (
                          <Card key={typeof event.id === 'undefined' ? Math.random() : event.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <div>
                                <Typography variant="subtitle2">
                                  Fecha: {event.event_date}
                                </Typography>
                                <Typography variant="body2" mt={0.5}>
                                  {event.description}
                                </Typography>
                                {event.next_contact && (
                                  <Typography variant="caption" color="primary" display="block">
                                    Próximo contacto: {event.next_contact}
                                  </Typography>
                                )}
                              </div>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => event.id !== undefined && deleteEvent(event.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Card>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 2 }}>
                          No hay eventos registrados
                        </Typography>
                      )}
                    </div>
                    
                    <div style={fixedHeightStyles.addForm}>
                      <Typography variant="subtitle2" gutterBottom>
                        <AddIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Agregar nuevo evento
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <TextField
                          label="Fecha"
                          name="event_date"
                          type="date"
                          value={newEvent.event_date}
                          onChange={handleEventChange}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 'calc(50% - 4px)' }}
                        />
                        
                        <TextField
                          label="Próximo contacto"
                          name="next_contact"
                          type="date"
                          value={newEvent.next_contact}
                          onChange={handleEventChange}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 'calc(50% - 4px)' }}
                        />
                        
                        <TextField
                          label="Descripción"
                          name="description"
                          value={newEvent.description}
                          onChange={handleEventChange}
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={addEvent}
                          disabled={!newEvent.event_date || !newEvent.description}
                        >
                          Agregar
                        </Button>
                      </Box>
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div style={fixedHeightStyles.tabsPanel}>
                    <Typography variant="subtitle1" gutterBottom>
                      Acciones ({(prospecto.actions || []).length})
                    </Typography>
                    
                    <div style={fixedHeightStyles.listContainer}>
                      {(prospecto.actions || []).length > 0 ? (
                        (prospecto.actions || []).map((action) => (
                          <Card key={typeof action.id === 'undefined' ? Math.random() : action.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <div>
                                <Typography variant="subtitle2">
                                  Fecha: {action.action_date}
                                </Typography>
                                <Typography variant="body2" mt={0.5}>
                                  {action.description}
                                </Typography>
                                {action.next_contact && (
                                  <Typography variant="caption" color="primary" display="block">
                                    Próximo contacto: {action.next_contact}
                                  </Typography>
                                )}
                              </div>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => action.id !== undefined && deleteAction(action.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Card>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', my: 2 }}>
                          No hay acciones registradas
                        </Typography>
                      )}
                    </div>
                    
                    <div style={fixedHeightStyles.addForm}>
                      <Typography variant="subtitle2" gutterBottom>
                        <AddIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Agregar nueva acción
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <TextField
                          label="Fecha"
                          name="action_date"
                          type="date"
                          value={newAction.action_date}
                          onChange={handleActionChange}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 'calc(50% - 4px)' }}
                        />
                        
                        <TextField
                          label="Próximo contacto"
                          name="next_contact"
                          type="date"
                          value={newAction.next_contact}
                          onChange={handleActionChange}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 'calc(50% - 4px)' }}
                        />
                        
                        <TextField
                          label="Descripción"
                          name="description"
                          value={newAction.description}
                          onChange={handleActionChange}
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      
                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={addAction}
                          disabled={!newAction.action_date || !newAction.description}
                        >
                          Agregar
                        </Button>
                      </Box>
                    </div>
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