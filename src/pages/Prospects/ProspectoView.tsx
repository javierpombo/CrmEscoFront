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
  DialogActions,
  Grid,
  SelectChangeEvent,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { FormControlLabel, Checkbox } from '@mui/material';

import Header from '../../components/Header/Header';
import { prospectoService } from '../../services/prospectoService';
import { Prospecto, AccionType } from '../../types/Prospecto';
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
    marginTop: '5px',
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

  const [newAction, setNewAction] = useState<{
    action_date: string;
    description: string;
    next_contact: string;
    user_id: string;
    status: 'abierto' | 'cerrado' | 'vencido';
  }>({
    action_date: "",
    description: "",
    next_contact: "",
    user_id: "",
    status: "abierto"
  });

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
          const users = await getUsers();

          setUsers(users.map(user => ({
            id: String(user.id),
            label: user.label
          })));

          setProspecto({
            ...data,
            referente: data.referente,
            oficial: data.oficial,
          });

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

  const handleStatusChange = (event: SelectChangeEvent<'abierto' | 'cerrado' | 'vencido'>) => {
    setNewAction(prev => ({
      ...prev,
      status: event.target.value as 'abierto' | 'cerrado' | 'vencido'
    }));
  };

  // Manejador específico para el Select de MUI en la edición de acción
  const handleEditStatusChange = (event: SelectChangeEvent<'abierto' | 'cerrado' | 'vencido'>) => {
    if (!actionToEdit) return;
    setActionToEdit(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: event.target.value as 'abierto' | 'cerrado' | 'vencido'
      };
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGoBack = () => {
    navigate('/crm/prospectos');
  };

  // Manejo de cambios en el formulario de creación de acción
  const handleActionChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewAction((prev) => ({ ...prev, [name]: value }));
  };


  // Crear acción: llama al service y actualiza el estado
  const addAction = async () => {
    if (!prospecto || !prospecto.id || !newAction.action_date || !newAction.description) return;
    const prospectoId = prospecto.id as string;
    try {
      const accionCreada = await prospectoService.createAction(prospectoId, newAction as AccionType);
      if (accionCreada) {
        setProspecto(prev => ({
          ...prev!,
          actions: [...(prev?.actions || []), accionCreada]
        }));
        setNewAction({ action_date: "", description: "", next_contact: "", user_id: "", status: "abierto" });
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
  // 1. Agregar la función formatDate mejorada
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');  // Añade hora para evitar problemas de zona horaria
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC'  // Esto puede ayudar a mantener consistencia
    });
  };

  const handleCloseAction = async (actionId: string | number) => {
    if (!prospecto) return;

    try {
      const actionToClose = prospecto.actions?.find(a => a.id === actionId) as AccionType;
      if (!actionToClose) return;

      const updatedAction: AccionType = {
        ...actionToClose,
        status: 'cerrado' as 'abierto' | 'cerrado' | 'vencido'
      };

      // Pasar el ID de la acción como primer parámetro
      const result = await prospectoService.updateAction(
        actionId.toString(),
        updatedAction
      );

      if (result) {
        setProspecto(prev => {
          if (!prev) return null;
          const updatedActions = (prev.actions || []).map(a =>
            a.id === actionId ? { ...a, status: 'cerrado' as 'abierto' | 'cerrado' | 'vencido' } : a
          );
          return { ...prev, actions: updatedActions };
        });
      }
    } catch (err) {
      console.error('Error al cerrar la acción:', err);
    }
  };

  // 3. Modificar handleEditActionChange para manejar diferentes tipos de eventos
  const handleEditActionChange = (
    e: SelectChangeEvent<any> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!actionToEdit) return;
    const { name, value } = e.target;
    setActionToEdit(prev => prev ? { ...prev, [name]: value } : null);
  };

  // 4. Actualizar handleSaveEditedAction para usar el ID de la acción
  const handleSaveEditedAction = async () => {
    if (!prospecto || !actionToEdit || !actionToEdit.id) return;

    try {
      // Usar el ID de la acción como primer parámetro
      const accionActualizada = await prospectoService.updateAction(
        actionToEdit.id.toString(),
        actionToEdit
      );

      if (accionActualizada) {
        const updatedActions = (prospecto.actions || []).map(a =>
          a.id === accionActualizada.id ? accionActualizada : a
        );

        // Añadir conversión de tipo explícita
        setProspecto(prev => {
          if (!prev) return null;
          return {
            ...prev,
            actions: updatedActions,
            // Asegurar que ultimoContacto nunca sea undefined
            ultimoContacto: prev.ultimoContacto || null
          } as Prospecto;  // Forzar el tipo Prospecto
        });
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
        actions: prospecto.actions || [],
      };
      const updatedProspect = await prospectoService.updateProspectoFull(
        id,
        prospectoToSave,
        prospecto.actions
      );
      if (updatedProspect) {
        setProspecto(updatedProspect);
      }
    } catch (err) {
      console.error('Error al guardar los cambios:', err);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'cerrado': return '#4CAF50'; // Verde
      case 'vencido': return '#F44336'; // Rojo
      default: return '#2196F3'; // Azul para "abierto" o estado por defecto
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
              <Typography variant="body2">Acciones: {(prospecto?.actions || []).length}</Typography>
            </div>
          </Box>
          <Typography variant="h5" gutterBottom>
            {prospecto?.nombreCliente || 'Detalle de Prospecto'}
          </Typography>

          {prospecto && (
            <Card style={fixedHeightStyles.formCard}>
              <Tabs value={activeTab} onChange={handleTabChange} className={styles.tabs} variant="fullWidth">
                <Tab label="Datos del Prospecto" />
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
                          label="Sector/Industria"
                          name="Sector/Industria"
                          value={prospecto.sector_industria || ''}
                          onChange={(e) =>
                            setProspecto({ ...prospecto, sector_industria: e.target.value })
                          }
                          fullWidth
                          margin="normal"
                          size="small"
                          variant="outlined"
                        />

                        <FormControlLabel
                          label="¿Ya es cliente?"
                          sx={{ marginTop: 0 }}
                          control={
                            <Checkbox
                              checked={!!prospecto.yaEsCliente}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setProspecto({
                                  ...prospecto,
                                  yaEsCliente: e.target.checked,
                                  numComitente: e.target.checked ? prospecto.numComitente : ''
                                })
                              }
                            />
                          }
                        />
                      </div>

                      <div className={styles.formColumn}>
                        <AsyncSelect
                          label="Referente"
                          value={prospecto?.referente || ''}
                          onChange={(newValue) =>
                            setProspecto((prev) => (prev ? { ...prev, referente: newValue } : prev))
                          }
                          fetchOptions={getUsers}
                        />

                        <AsyncSelect
                          label="Oficial"
                          value={prospecto?.oficial || ''}
                          onChange={(newValue) =>
                            setProspecto((prev) => (prev ? { ...prev, oficial: newValue } : prev))
                          }
                          fetchOptions={getUsers}
                        />
                      </div>
                    </div>

                    {/* Sección para información de contacto */}
                    <div className={styles.additionalContactInfo}>
                      <Divider sx={{ my: 0.5 }} />
                      <Typography variant="h6" gutterBottom>
                        Información de contacto del cliente
                      </Typography>

                      <Grid container spacing={2}>
                        {/* Primera fila */}
                        <Grid item xs={12} md={6}>
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
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Cargo del Contacto"
                            name="Cargo del Contacto"
                            value={prospecto.cargo_contacto || ''}
                            onChange={(e) =>
                              setProspecto({ ...prospecto, cargo_contacto: e.target.value })
                            }
                            fullWidth
                            margin="normal"
                            size="small"
                            variant="outlined"
                          />
                        </Grid>

                        {/* Segunda fila */}
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Teléfono/Celular"
                            value={prospecto.telefono_contacto || ''}
                            onChange={(e) =>
                              setProspecto({ ...prospecto, telefono_contacto: e.target.value })
                            }
                            fullWidth
                            margin="normal"
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Email"
                            type="email"
                            value={prospecto.email_contacto || ''}
                            onChange={(e) =>
                              setProspecto({ ...prospecto, email_contacto: e.target.value })
                            }
                            fullWidth
                            margin="normal"
                            size="small"
                          />
                        </Grid>
                      </Grid>

                      {/* Información adicional en toda la anchura */}
                      <TextField
                        label="Información Relevante"
                        value={prospecto.info_adicional || ''}
                        onChange={(e) =>
                          setProspecto({ ...prospecto, info_adicional: e.target.value })
                        }
                        fullWidth
                        margin="normal"
                        size="small"
                        multiline
                        rows={3}
                      />
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
                    {/* Header de la sección de acciones con contadores */}
                    <Box sx={{
                      p: 2,
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Acciones ({(prospecto?.actions || []).length})
                      </Typography>
                      <Box>
                        <Chip
                          icon={<AccessTimeIcon fontSize="small" />}
                          label={`Abiertos: ${(prospecto?.actions || []).filter(a => a.status === 'abierto').length}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          icon={<ErrorIcon fontSize="small" />}
                          label={`Vencidos: ${(prospecto?.actions || []).filter(a => a.status === 'vencido').length}`}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          icon={<CheckCircleIcon fontSize="small" />}
                          label={`Cerrados: ${(prospecto?.actions || []).filter(a => a.status === 'cerrado').length}`}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    <Divider />

                    {/* Lista de acciones */}
                    <Box className={styles.listContainer}>
                      {(prospecto.actions || []).length > 0 ? (
                        (prospecto.actions || []).map((action) => (
                          <Card
                            key={action.id ?? Math.random()}
                            variant="outlined"
                            sx={{
                              mb: 1.5,
                              p: 0,
                              borderRadius: '6px',
                              borderLeft: action.status === 'vencido'
                                ? '4px solid #f44336'
                                : action.status === 'cerrado'
                                  ? '4px solid #4caf50'
                                  : '4px solid #2196f3',
                              opacity: action.status === 'cerrado' ? 0.7 : 1
                            }}
                          >
                            <Box sx={{ p: 1.5 }}>
                              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                  <Box display="flex" alignItems="center" mb={0.5}>
                                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                                      Fecha: {formatDate(action.action_date)}
                                    </Typography>
                                    <Chip
                                      label={action.status}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </Box>
                                  <Typography variant="body2" mt={0.5}>{action.description}</Typography>
                                  {action.next_contact && (
                                    <Typography
                                      variant="caption"
                                      color={action.status === 'vencido' ? "error" : "primary"}
                                      display="block"
                                      sx={{ mt: 0.5 }}
                                    >
                                      Vencimiento: {formatDate(action.next_contact)}
                                    </Typography>
                                  )}
                                </Box>
                                <Box display="flex">
                                  {action.status !== 'cerrado' && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="success"
                                      startIcon={<CheckCircleIcon />}
                                      onClick={() => handleCloseAction(action.id as string | number)}
                                      sx={{ mr: 1 }}
                                    >
                                      Cerrar
                                    </Button>
                                  )}
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
                            </Box>
                          </Card>
                        ))
                      ) : (
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ my: 2 }}>
                          No hay acciones registradas
                        </Typography>
                      )}
                    </Box>

                    {/* Formulario para agregar nueva acción */}
                    <Box className={styles.addForm}>
                      <Typography variant="subtitle2" gutterBottom>
                        <AddIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        Agregar nueva acción
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Fecha"
                            name="action_date"
                            type="date"
                            value={newAction.action_date}
                            onChange={handleActionChange}
                            fullWidth
                            size="small"
                            required
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Vencimiento"
                            name="next_contact"
                            type="date"
                            value={newAction.next_contact}
                            onChange={handleActionChange}
                            fullWidth
                            size="small"
                            required
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small" required>
                            <AsyncSelect
                              label="Asignado"
                              placeholder="Seleccione un asignado"
                              value={newAction.user_id}
                              onChange={(newValue) =>
                                setNewAction(prev => ({ ...prev, user_id: newValue }))
                              }
                              fetchOptions={getUsers}
                              required
                            />
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Descripción"
                            name="description"
                            value={newAction.description}
                            onChange={handleActionChange}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            required
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={addAction}
                          disabled={!newAction.action_date || !newAction.description || !newAction.next_contact || !newAction.user_id}
                        >
                          Agregar
                        </Button>
                      </Box>
                    </Box>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modal para editar acción */}
      <Dialog
        open={editActionDialogOpen}
        onClose={handleCloseEditAction}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{actionToEdit?.status === 'cerrado' ? 'Ver Acción' : 'Editar Acción'}</DialogTitle>
        <DialogContent className={actionToEdit?.status === 'cerrado' ? styles.readOnlyDialog : ''}>
          {actionToEdit?.status === 'cerrado' ? (
            // Modo solo lectura para acciones cerradas
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: '350px', padding: '8px 0' }}>
              <Box className={styles.actionViewField}>
                <Typography variant="caption" color="textSecondary" className={styles.actionFieldLabel}>Fecha:</Typography>
                <Typography variant="body1" className={styles.actionFieldValue}>{formatDate(actionToEdit.action_date)}</Typography>
              </Box>
              <Box className={styles.actionViewField}>
                <Typography variant="caption" color="textSecondary" className={styles.actionFieldLabel}>Vencimiento:</Typography>
                <Typography variant="body1" className={styles.actionFieldValue}>{formatDate(actionToEdit.next_contact)}</Typography>
              </Box>
              <Box className={styles.actionViewField}>
                <Typography variant="caption" color="textSecondary" className={styles.actionFieldLabel}>Estado:</Typography>
                <Typography variant="body1" className={styles.actionFieldValue}>Cerrado</Typography>
              </Box>
              <Box className={styles.actionViewField}>
                <Typography variant="caption" color="textSecondary" className={styles.actionFieldLabel}>Asignado:</Typography>
                <Typography variant="body1" className={styles.actionFieldValue}>
                  {users.find(u => u.id === actionToEdit.user_id)?.label || actionToEdit.user_id}
                </Typography>
              </Box>
              <Box className={styles.actionViewField}>
                <Typography variant="caption" color="textSecondary" className={styles.actionFieldLabel}>Descripción:</Typography>
                <Typography variant="body1" className={styles.actionFieldValue}>{actionToEdit.description}</Typography>
              </Box>
            </Box>
          ) : (
            // Modo edición normal para acciones no cerradas
            <>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, mt: 1 }}>
                <TextField
                  label="Fecha"
                  name="action_date"
                  type="date"
                  value={actionToEdit?.action_date || ''}
                  onChange={handleEditActionChange}
                  margin="dense"
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Vencimiento"
                  name="next_contact"
                  type="date"
                  value={actionToEdit?.next_contact || ''}
                  onChange={handleEditActionChange}
                  margin="dense"
                  required
                  InputLabelProps={{ shrink: true }}
                  sx={{ flex: 1 }}
                />
              </Box>
              <FormControl fullWidth margin="dense" required>
                <InputLabel id="action-status-label">Estado</InputLabel>
                <Select
                  labelId="action-status-label"
                  name="status"
                  value={actionToEdit?.status || 'abierto'}
                  onChange={handleEditActionChange}
                  label="Estado"
                >
                  <MenuItem value="abierto">Abierto</MenuItem>
                  <MenuItem value="vencido">Vencido</MenuItem>
                  <MenuItem value="cerrado">Cerrado</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth margin="dense" required>
                <AsyncSelect
                  label="Asignado"
                  placeholder="Seleccione un asignado"
                  value={actionToEdit?.user_id || ''}
                  onChange={(newValue) =>
                    setActionToEdit(prev => prev ? { ...prev, user_id: newValue } : prev)
                  }
                  fetchOptions={getUsers}
                  required
                />
              </FormControl>
              <TextField
                label="Descripción"
                name="description"
                value={actionToEdit?.description || ''}
                onChange={handleEditActionChange}
                fullWidth
                margin="dense"
                multiline
                rows={3}
                required
              />
            </>
          )}
        </DialogContent>
        <DialogActions className={styles.actionButtonContainer}>
          <Button onClick={handleCloseEditAction}>
            {actionToEdit?.status === 'cerrado' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {actionToEdit?.status !== 'cerrado' && (
            <Button
              onClick={handleSaveEditedAction}
              variant="contained"
              color="primary"
              disabled={!actionToEdit?.action_date || !actionToEdit?.description || !actionToEdit?.next_contact || !actionToEdit?.user_id}
            >
              Guardar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProspectoView;
