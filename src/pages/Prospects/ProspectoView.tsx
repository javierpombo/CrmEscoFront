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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormControlLabel, Checkbox } from '@mui/material';


import Header from '../../components/Header/Header';
import { prospectoService } from '../../services/prospectoService';
import { Prospecto, EventoType, AccionType } from '../../types/Prospecto';
import AsyncSelect from '../../components/AsyncSelect/AsyncSelect';
import { getUsers } from '../../services/apiService';
import { getUserNameById } from '../../services/userService';

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

const ProspectoView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [prospecto, setProspecto] = useState<Prospecto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [users, setUsers] = useState<{ id: string; label: string }[]>([]);



  // Estados para nuevos eventos y acciones (incluyen user_id)
  const [newEvent, setNewEvent] = useState<{
    event_date: string;
    description: string;
    next_contact: string;
    user_id: string;
  }>({ event_date: "", description: "", next_contact: "", user_id: "" });

  const [newAction, setNewAction] = useState<{
    action_date: string;
    description: string;
    next_contact: string;
    user_id: string;
  }>({ action_date: "", description: "", next_contact: "", user_id: "" });

  // Estados para editar evento mediante modal
  const [editEventDialogOpen, setEditEventDialogOpen] = useState<boolean>(false);
  const [eventToEdit, setEventToEdit] = useState<EventoType | null>(null);

  // Estados para editar acción mediante modal
  const [editActionDialogOpen, setEditActionDialogOpen] = useState<boolean>(false);
  const [actionToEdit, setActionToEdit] = useState<AccionType | null>(null);

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
          const users = await getUsers(); // Obtener lista de usuarios

          setUsers(users.map(user => ({
            id: String(user.id),
            label: user.label
          }))); // Guardamos la lista de usuarios formateada para fácil acceso

          setProspecto({
            ...data,
            referente: data.referente, // Solo guardamos el ID
            oficial: data.oficial,     // Solo guardamos el ID
          });

          // setUsers(users); // Guardamos la lista de usuarios para los select
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

  // Manejo de cambios en el formulario de creación de evento
  const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  // Crear evento: llama al service y actualiza el estado
  const addEvent = async () => {
    if (!prospecto || !prospecto.id || !newEvent.event_date || !newEvent.description) return;
    const prospectoId = prospecto.id as string;
    try {
      const eventoCreado = await prospectoService.createEvent(prospectoId, newEvent);
      if (eventoCreado) {
        setProspecto(prev => ({
          ...prev!,
          events: [...(prev?.events || []), eventoCreado]
        }));
        setNewEvent({ event_date: "", description: "", next_contact: "", user_id: "" });
      }
    } catch (err) {
      console.error('Error al crear evento:', err);
    }
  };

  // Eliminar evento del estado
  const deleteEvent = (eventId: number | string | undefined) => {
    if (!prospecto || eventId === undefined) return;
    const updatedEvents = (prospecto.events || []).filter(event => event.id !== eventId);
    setProspecto({ ...prospecto, events: updatedEvents });
  };

  // Abrir modal de edición de evento
  const handleOpenEditEvent = (event: EventoType) => {
    setEventToEdit(event);
    setEditEventDialogOpen(true);
  };

  const handleCloseEditEvent = () => {
    setEditEventDialogOpen(false);
    setEventToEdit(null);
  };

  const handleEditEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!eventToEdit) return;
    const { name, value } = e.target;
    setEventToEdit(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Guardar cambios en evento editado
  const handleSaveEditedEvent = async () => {
    if (!prospecto || !prospecto.id || !eventToEdit) return;
    const prospectoId = prospecto.id as string;
    try {
      const eventoActualizado = await prospectoService.updateEvent(prospectoId, eventToEdit);
      if (eventoActualizado) {
        setProspecto(prev => ({
          ...prev!,
          events: (prev!.events || []).map(e => e.id === eventoActualizado.id ? eventoActualizado : e)
        }));
      }
    } catch (err) {
      console.error('Error al actualizar evento:', err);
    } finally {
      handleCloseEditEvent();
    }
  };

  // Manejo de cambios en el formulario de creación de acción
  const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAction(prev => ({ ...prev, [name]: value }));
  };

  // Crear acción: llama al service y actualiza el estado
  const addAction = async () => {
    if (!prospecto || !prospecto.id || !newAction.action_date || !newAction.description) return;
    const prospectoId = prospecto.id as string;
    try {
      const accionCreada = await prospectoService.createAction(prospectoId, newAction);
      if (accionCreada) {
        setProspecto(prev => ({
          ...prev!,
          actions: [...(prev?.actions || []), accionCreada]
        }));
        setNewAction({ action_date: "", description: "", next_contact: "", user_id: "" });
      }
    } catch (err) {
      console.error('Error al crear acción:', err);
    }
  };

  const deleteAction = (actionId: number | string | undefined) => {
    if (!prospecto || actionId === undefined) return;
    const updatedActions = (prospecto.actions || []).filter(action => action.id !== actionId);
    setProspecto({ ...prospecto, actions: updatedActions });
  };

  // Abrir modal de edición de acción
  const handleOpenEditAction = (action: AccionType) => {
    setActionToEdit(action);
    setEditActionDialogOpen(true);
  };

  const handleCloseEditAction = () => {
    setEditActionDialogOpen(false);
    setActionToEdit(null);
  };

  const handleEditActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!actionToEdit) return;
    const { name, value } = e.target;
    setActionToEdit(prev => prev ? { ...prev, [name]: value } : null);
  };

  // Guardar cambios en acción editada
  const handleSaveEditedAction = async () => {
    if (!prospecto || !prospecto.id || !actionToEdit) return;
    const prospectoId = prospecto.id as string;
    try {
      const accionActualizada = await prospectoService.updateAction(prospectoId, actionToEdit);
      if (accionActualizada) {
        setProspecto(prev => ({
          ...prev!,
          actions: (prev!.actions || []).map(a => a.id === accionActualizada.id ? accionActualizada : a)
        }));
      }
    } catch (err) {
      console.error('Error al actualizar acción:', err);
    } finally {
      handleCloseEditAction();
    }
  };

  const handleSaveChanges = async () => {
    if (!prospecto || !id) return;
    try {
      const prospectoToSave = {
        ...prospecto,
        events: prospecto.events || [],
        actions: prospecto.actions || [],
      };
      const updatedProspect = await prospectoService.updateProspectoFull(
        id,
        prospectoToSave,
        prospecto.events,
        prospecto.actions
      );
      if (updatedProspect) {
        setProspecto(updatedProspect);
      }
    } catch (err) {
      console.error('Error al guardar los cambios:', err);
    }
  };


  return (
    <div style={fixedHeightStyles.pageContainer}>
      <div style={fixedHeightStyles.headerContainer}>
        <Header />
      </div>
      <div style={fixedHeightStyles.contentWrapper}>
        <div style={fixedHeightStyles.mainContent}>
          <div className={styles.breadcrumb}>
            <span onClick={() => navigate('/crm/clients')}>Inicio</span>
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
              {/* <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Referente</Typography>
                <Typography variant="body2">{prospecto?.referente || "—"}</Typography>
              </Box>
              <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Oficial</Typography>
                <Typography variant="body2">{prospecto?.oficial || "—"}</Typography>
              </Box> */}

              <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Último contacto</Typography>
                <Typography variant="body2">{prospecto?.ultimoContacto || "—"}</Typography>
              </Box>
              <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Tipo Cliente</Typography>
                <Typography variant="body2">{prospecto?.tipoCliente || "—"}</Typography>
              </Box>
              {/* <Box className={styles.infoItem}>
                <Typography variant="caption" color="textSecondary">Estado</Typography>
                <Typography variant="body2">{prospecto?.activo || "—"}</Typography>
              </Box> */}
            </Box>
          </Paper>

          {prospecto && (
            <Card style={fixedHeightStyles.formCard}>
              <Tabs value={activeTab} onChange={handleTabChange} className={styles.tabs} variant="fullWidth">
                <Tab label="Datos del Prospecto" />
                <Tab label="Eventos" />
                <Tab label="Acciones" />
              </Tabs>
              <div style={fixedHeightStyles.tabContent}>
                {activeTab === 0 && (
                  <div style={fixedHeightStyles.tabsPanel}>
                    {/* ... dentro de {activeTab === 0 && (...) } ... */}
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
                          label="Contacto en el cliente"
                          value={prospecto.contacto || ''}
                          fullWidth
                          margin="normal"
                          size="small"
                          onChange={(e) =>
                            setProspecto({ ...prospecto, contacto: e.target.value })
                          }
                        />

                        {/* Estado (activo/inactivo) */}
                        {/* <FormControl fullWidth margin="normal" size="small">
                          <InputLabel>Estado</InputLabel>
                          <Select
                            value={prospecto.activo || 'activo'}
                            label="Estado"
                            onChange={(e) =>
                              setProspecto({ ...prospecto, activo: e.target.value })
                            }
                          >
                            <MenuItem value="activo">Activo</MenuItem>
                            <MenuItem value="inactivo">Inactivo</MenuItem>
                          </Select>
                        </FormControl> */}
                        <TextField
                          label="Tipo de Cliente"
                          name="tipoCliente"
                          value={prospecto.tipoCliente || ''}
                          onChange={(e) =>
                            setProspecto({ ...prospecto, tipoCliente: e.target.value })
                          }
                          fullWidth
                          margin="normal"
                          size="small"
                          variant="outlined"
                        />

                        <FormControlLabel
                          label="¿Ya es cliente?"
                          sx={{ marginTop: 1 }}
                          control={
                            <Checkbox
                              checked={!!prospecto.yaEsCliente}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setProspecto({
                                  ...prospecto,
                                  yaEsCliente: e.target.checked,
                                  numcomitente: e.target.checked ? prospecto.numcomitente : ''
                                })
                              }
                            />
                          }
                        />

                        {/* <TextField
                          label="Número de Comitente"
                          value={prospecto.numcomitente}
                          fullWidth
                          margin="normal"
                          size="small"
                          variant="outlined"
                          disabled={!prospecto.yaEsCliente}
                          required={prospecto.yaEsCliente}
                          onChange={(e) =>
                            setProspecto({ ...prospecto, numcomitente: e.target.value })
                          }
                        /> */}
                      </div>

                      <div className={styles.formColumn}>
                        <AsyncSelect
                          label="Referente"
                          value={prospecto?.referente || ''}
                          onChange={(newValue) =>
                            setProspecto(prev => (prev ? { ...prev, referente: newValue } : prev))
                          }
                          fetchOptions={getUsers}
                        />
                        <AsyncSelect
                          label="Oficial"
                          value={prospecto?.oficial || ''}
                          onChange={(newValue) =>
                            setProspecto(prev => (prev ? { ...prev, oficial: newValue } : prev))
                          }
                          fetchOptions={getUsers}
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
                          <Card key={event.id ?? Math.random()} variant="outlined" sx={{ mb: 1, p: 1 }}>
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
                                    Próximo evento: {event.next_contact}
                                  </Typography>
                                )}
                              </div>
                              <Box>
                                <IconButton size="small" onClick={() => handleOpenEditEvent(event)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => event.id !== undefined && deleteEvent(event.id)}
                                >
                                  {/* <DeleteIcon fontSize="small" /> */}
                                </IconButton>
                              </Box>
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
                          sx={{ width: 'calc(33% - 4px)' }}
                        />

                        <TextField
                          label="Próximo evento"
                          name="next_contact"
                          type="date"
                          value={newEvent.next_contact}
                          onChange={handleEventChange}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 'calc(33% - 4px)' }}
                        />

                        <Box className={styles.asyncSelectContainer}>
                          <AsyncSelect
                            label="Asignado"
                            value={newEvent.user_id}
                            placeholder="Seleccione un asignado"
                            onChange={(newValue) =>
                              setNewEvent((prev) => ({ ...prev, user_id: newValue }))
                            }
                            fetchOptions={getUsers}
                            className={styles.asyncSelect}
                          />
                        </Box>
                      </Box>

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
                          <Card key={action.id ?? Math.random()} variant="outlined" sx={{ mb: 1, p: 1 }}>
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
                                    Vencimiento de la acción: {action.next_contact}
                                  </Typography>
                                )}
                              </div>
                              <Box>
                                <IconButton size="small" onClick={() => handleOpenEditAction(action)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => action.id !== undefined && deleteAction(action.id)}
                                >
                                  {/* <DeleteIcon fontSize="small" /> */}
                                </IconButton>
                              </Box>
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
                          sx={{ width: 'calc(33% - 4px)' }}
                        />

                        <TextField
                          label="Vencimiento de la acción"
                          name="next_contact"
                          type="date"
                          value={newAction.next_contact}
                          onChange={handleActionChange}
                          size="small"
                          InputLabelProps={{ shrink: true }}
                          sx={{ width: 'calc(33% - 4px)' }}
                        />

                        <Box sx={{ width: 'calc(33% - 4px)' }}>
                          <AsyncSelect
                            label="Asignado"
                            placeholder="Seleccione un asignado"
                            value={newAction.user_id || ''}
                            onChange={(newValue) =>
                              setNewAction(prev => ({ ...prev, user_id: newValue }))
                            }
                            fetchOptions={getUsers}
                            className={styles.inputField}
                          />
                        </Box>
                      </Box>

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

      {/* Modal para editar evento */}
      <Dialog open={editEventDialogOpen} onClose={handleCloseEditEvent}>
        <DialogTitle>Editar Evento</DialogTitle>
        <DialogContent>
          <TextField
            label="Fecha"
            name="event_date"
            type="date"
            value={eventToEdit?.event_date || ''}
            onChange={handleEditEventChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Vencimiento de la acción"
            name="next_contact"
            type="date"
            value={eventToEdit?.next_contact || ''}
            onChange={handleEditEventChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ width: '100%', mt: 2, mb: 1 }}>
            <AsyncSelect
              label="Asignado"
              value={eventToEdit?.user_id || ''}
              placeholder="Seleccione un asignado"
              onChange={(newValue) =>
                setEventToEdit(prev => prev ? { ...prev, user_id: newValue } : prev)
              }
              fetchOptions={getUsers}
              className={`${styles.inputField} async-select-container`}
            />
          </Box>
          <TextField
            label="Descripción"
            name="description"
            value={eventToEdit?.description || ''}
            onChange={handleEditEventChange}
            fullWidth
            margin="dense"
            multiline
            rows={3}
          />
        </DialogContent>


        <DialogActions>
          <Button onClick={handleCloseEditEvent}>Cancelar</Button>
          <Button onClick={handleSaveEditedEvent} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para editar acción */}
      <Dialog open={editActionDialogOpen} onClose={handleCloseEditAction}>
        <DialogTitle>Editar Acción</DialogTitle>
        <DialogContent>
          <TextField
            label="Fecha"
            name="action_date"
            type="date"
            value={actionToEdit?.action_date || ''}
            onChange={handleEditActionChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Vencimiento de la acción"
            name="next_contact"
            type="date"
            value={actionToEdit?.next_contact || ''}
            onChange={handleEditActionChange}
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
          />
          <AsyncSelect
            label="Asignado"
            value={actionToEdit?.user_id || ''}
            onChange={(newValue) =>
              setActionToEdit(prev => prev ? { ...prev, user_id: newValue } : prev)
            }
            fetchOptions={getUsers}
          />
          <TextField
            label="Descripción"
            name="description"
            value={actionToEdit?.description || ''}
            onChange={handleEditActionChange}
            fullWidth
            margin="dense"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditAction}>Cancelar</Button>
          <Button onClick={handleSaveEditedAction} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProspectoView;
