// src/pages/Clients/ClientView.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
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

import Navbar from '../../components/Navigation/Navbar/Navbar';
import Header from '../../components/Header/Header';
import AsyncSelect from '../../components/AsyncSelect/AsyncSelect';

// Servicio y tipos de clientes
import { clientesService } from '../../services/clientesService';
import { Client, ClientEvent, ClientAction } from '../../types/Client';

import styles from './ClientView.module.css';

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
        maxHeight: '300px',
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

const ClientView: React.FC = () => {
    // Usamos "numcomitente" (equivalente a "CodComitente") en la URL
    const { numcomitente } = useParams<{ numcomitente: string }>();
    const navigate = useNavigate();

    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<number>(0);
    const [users, setUsers] = useState<{ id: string; label: string }[]>([]);

    // Estados para nuevos eventos y acciones; se inicializan con valor vacío para "user_id"
    const [newEvent, setNewEvent] = useState<ClientEvent>({
        id: '',
        client_id: '',
        event_date: '',
        description: '',
        next_contact: '',
        user_id: ''
    });
    const [newAction, setNewAction] = useState<ClientAction>({
        id: '',
        client_id: '',
        action_date: '',
        description: '',
        next_contact: '',
        user_id: ''
    });

    // Estados para modales de edición
    const [editEventDialogOpen, setEditEventDialogOpen] = useState<boolean>(false);
    const [eventToEdit, setEventToEdit] = useState<ClientEvent | null>(null);
    const [editActionDialogOpen, setEditActionDialogOpen] = useState<boolean>(false);
    const [actionToEdit, setActionToEdit] = useState<ClientAction | null>(null);

    // Cargar el detalle del cliente, eventos y acciones
    useEffect(() => {
        const fetchClientData = async () => {
            if (!numcomitente) {
                setError('Número de comitente no válido');
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const clientData = await clientesService.getClientByCodComitente(numcomitente);
                if (clientData) {
                    const [eventsData, actionsData] = await Promise.all([
                        clientesService.getEventsByCodComitente(numcomitente),
                        clientesService.getActionsByCodComitente(numcomitente)
                    ]);
                    setClient({
                        ...clientData,
                        events: eventsData,
                        actions: actionsData
                    });
                    const usersData = await clientesService.getUsers();
                    setUsers(usersData);
                } else {
                    setError('Cliente no encontrado');
                }
            } catch (err) {
                console.error('Error al cargar el cliente:', err);
                setError('Error al cargar los datos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClientData();
    }, [numcomitente]);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleGoBack = () => {
        navigate('/crm/clients');
    };

    // Funciones para eventos
    const handleEventChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewEvent(prev => ({ ...prev, [name]: value }));
    };

    const addEvent = async () => {
        if (!client || !client.id || !newEvent.event_date || !newEvent.description) return;
        try {
            const createdEvent = await clientesService.createEvent(client.id, newEvent);
            if (createdEvent) {
                setClient(prev => prev ? { ...prev, events: [...(prev.events ?? []), createdEvent] } : prev);
                setNewEvent({ id: '', client_id: '', event_date: '', description: '', next_contact: '', user_id: '' });
            }
        } catch (err) {
            console.error('Error al crear evento:', err);
        }
    };

    const deleteEvent = async (eventId: string | number) => {
        if (!client) return;
        try {
            await clientesService.deleteEvent(eventId.toString());
            setClient(prev => prev ? { ...prev, events: (prev.events ?? []).filter(e => e.id !== eventId) } : prev);
        } catch (err) {
            console.error('Error al eliminar evento:', err);
        }
    };

    const handleOpenEditEvent = (event: ClientEvent) => {
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
        setEventToEdit(prev => prev ? { ...prev, [name]: value } : prev);
    };

    const handleSaveEditedEvent = async () => {
        if (!client || !client.id || !eventToEdit) return;
        try {
            const updatedEvent = await clientesService.updateEvent(client.id, eventToEdit);
            if (updatedEvent) {
                setClient(prev => prev ? {
                    ...prev,
                    events: (prev.events ?? []).map(e => e.id === updatedEvent.id ? updatedEvent : e)
                } : prev);
            }
        } catch (err) {
            console.error('Error al actualizar evento:', err);
        } finally {
            handleCloseEditEvent();
        }
    };

    // Funciones para acciones
    const handleActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewAction(prev => ({ ...prev, [name]: value }));
    };

    const addAction = async () => {
        if (!client || !client.id || !newAction.action_date || !newAction.description) return;
        try {
            const createdAction = await clientesService.createAction(client.id, newAction);
            if (createdAction) {
                setClient(prev => prev ? { ...prev, actions: [...(prev.actions ?? []), createdAction] } : prev);
                setNewAction({ id: '', client_id: '', action_date: '', description: '', next_contact: '', user_id: '' });
            }
        } catch (err) {
            console.error('Error al crear acción:', err);
        }
    };

    const deleteAction = async (actionId: string | number) => {
        if (!client) return;
        try {
            await clientesService.deleteAction(actionId.toString());
            setClient(prev => prev ? { ...prev, actions: (prev.actions ?? []).filter(a => a.id !== actionId) } : prev);
        } catch (err) {
            console.error('Error al eliminar acción:', err);
        }
    };

    const handleOpenEditAction = (action: ClientAction) => {
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
        setActionToEdit(prev => prev ? { ...prev, [name]: value } : prev);
    };

    const handleSaveEditedAction = async () => {
        if (!client || !client.id || !actionToEdit) return;
        try {
            const updatedAction = await clientesService.updateAction(client.id, actionToEdit);
            if (updatedAction) {
                setClient(prev => prev ? {
                    ...prev,
                    actions: (prev.actions ?? []).map(a => a.id === updatedAction.id ? updatedAction : a)
                } : prev);
            }
        } catch (err) {
            console.error('Error al actualizar acción:', err);
        } finally {
            handleCloseEditAction();
        }
    };

    const handleSaveChanges = async () => {
        if (!client || !client.id) return;
        try {
            const updatedClient = await clientesService.updateClientFull(
                client.id,
                client,
                client.events ?? [],
                client.actions ?? []
            );
            if (updatedClient) {
                setClient(updatedClient);
            }
        } catch (err) {
            console.error('Error al guardar los cambios:', err);
        }
    };

    // Variables locales para evitar errores de undefined
    const events = client?.events ?? [];
    const actions = client?.actions ?? [];

    // Función para renderizar todos los datos del cliente (excepto events y actions)
    const renderClientData = () => {
        if (!client) return null;
        const excludedKeys = ['events', 'actions', 'id', 'numcomitente'];
        return (
            <Paper elevation={0} className={styles.summaryCard}>
                <Box display="flex" flexDirection="column" gap={1} p={1}>
                    {Object.entries(client).map(([key, value]) => {
                        if (excludedKeys.includes(key)) return null;
                        let displayKey = key;
                        let displayValue;
                        if (typeof value === 'boolean') {
                            displayKey = 'estado';
                            displayValue = value ? 'activo' : 'inactivo';
                        } else {
                            displayValue = value !== null && value !== undefined ? value.toString() : '—';
                        }
                        return (
                            <Box key={key} display="flex" alignItems="center">
                                <Typography variant="caption" color="textSecondary" sx={{ minWidth: '150px' }}>
                                    {displayKey}:
                                </Typography>
                                <Typography variant="body2">
                                    {displayValue}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            </Paper>
        );
    };
    
    

    return (
        <div style={fixedHeightStyles.pageContainer}>
            {/* <Navbar /> */}
            <div style={fixedHeightStyles.headerContainer}>
                <Header />
            </div>
            <div style={fixedHeightStyles.contentWrapper}>
                <div style={fixedHeightStyles.mainContent}>
                    <div className={styles.breadcrumb}>
                        <span onClick={() => navigate('/crm/clients')}>Inicio</span>
                        <span> {'>'} </span>
                        <span onClick={() => navigate('/crm/clients')}>Clientes</span>
                        <span> {'>'} </span>
                        <span>{client?.nombre || 'Detalle'}</span>
                    </div>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} size="small">
                            Volver
                        </Button>
                        <div className={styles.countContainer}>
                            <Typography variant="body2">Eventos: {events.length}</Typography>
                            <Typography variant="body2">Acciones: {actions.length}</Typography>
                        </div>
                    </Box>
                    <Typography variant="h5" gutterBottom>
                        {client?.nombre || 'Detalle de Cliente'}
                    </Typography>
                    {/* Mostrar todos los datos del cliente */}
                    {renderClientData()}

                    {client && (
                        <Card className={styles.formCard}>
                            <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" className={styles.tabs}>
                                <Tab label="Eventos" />
                                <Tab label="Acciones" />
                            </Tabs>
                            <div className={styles.tabContent}>
                                {activeTab === 0 && (
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Eventos ({events.length})
                                        </Typography>
                                        <Box className={styles.listContainer}>
                                            {events.length > 0 ? (
                                                events.map(event => (
                                                    <Card key={event.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                            <Box>
                                                                <Typography variant="subtitle2">Fecha: {event.event_date}</Typography>
                                                                <Typography variant="body2" mt={0.5}>{event.description}</Typography>
                                                                {event.next_contact && (
                                                                    <Typography variant="caption" color="primary" display="block">
                                                                        Próximo evento: {event.next_contact}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <Box>
                                                                <IconButton size="small" onClick={() => handleOpenEditEvent(event)}>
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" color="error" onClick={() => deleteEvent(event.id)}>
                                                                    {/* <DeleteIcon fontSize="small" /> */}
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    </Card>
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="textSecondary" align="center" sx={{ my: 2 }}>
                                                    No hay eventos registrados
                                                </Typography>
                                            )}
                                        </Box>
                                        <Box className={styles.addForm}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                <AddIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                                Agregar nuevo evento
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    gap: 2,           // Espacio horizontal entre elementos
                                                    alignItems: 'center', // Alinea verticalmente al centro
                                                    flexWrap: 'wrap'  // Permite que se acomoden en varias líneas si no cabe en una sola
                                                }}
                                            >
                                                <TextField
                                                    label="Fecha"
                                                    name="event_date"
                                                    type="date"
                                                    value={newEvent.event_date}
                                                    onChange={handleEventChange}
                                                    size="small"
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ flex: 1 }} // Ocupa espacio de manera proporcional
                                                />

                                                <TextField
                                                    label="Próximo evento"
                                                    name="next_contact"
                                                    type="date"
                                                    value={newEvent.next_contact}
                                                    onChange={handleEventChange}
                                                    size="small"
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ flex: 1 }}
                                                />

                                                <FormControl sx={{ flex: 1 }} size="small">
                                                    <AsyncSelect
                                                        label="Asignado"
                                                        placeholder="Seleccione un asignado"
                                                        value={newEvent.user_id}
                                                        onChange={(newValue) =>
                                                            setNewEvent(prev => ({ ...prev, user_id: newValue }))
                                                        }
                                                        fetchOptions={clientesService.getUsers}
                                                    />
                                                </FormControl>
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
                                        </Box>
                                    </Box>
                                )}
                                {activeTab === 1 && (
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Acciones ({actions.length})
                                        </Typography>
                                        <Box className={styles.listContainer}>
                                            {actions.length > 0 ? (
                                                actions.map(action => (
                                                    <Card key={action.id} variant="outlined" sx={{ mb: 1, p: 1 }}>
                                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                            <Box>
                                                                <Typography variant="subtitle2">Fecha: {action.action_date}</Typography>
                                                                <Typography variant="body2" mt={0.5}>{action.description}</Typography>
                                                                {action.next_contact && (
                                                                    <Typography variant="caption" color="primary" display="block">
                                                                        Vencimiento de la acción: {action.next_contact}
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                            <Box>
                                                                <IconButton size="small" onClick={() => handleOpenEditAction(action)}>
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton size="small" color="error" onClick={() => deleteAction(action.id)}>
                                                                    {/* <DeleteIcon fontSize="small" /> */}
                                                                </IconButton>
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
                                        <Box className={styles.addForm}>
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
                                                    sx={{ width: '33%' }}
                                                />
                                                <TextField
                                                    label="Vencimiento"
                                                    name="next_contact"
                                                    type="date"
                                                    value={newAction.next_contact}
                                                    onChange={handleActionChange}
                                                    size="small"
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ width: '33%' }}
                                                />
                                                <FormControl
                                                    fullWidth
                                                    size="small"
                                                    sx={{ width: '33%' }}
                                                >
                                                    <AsyncSelect
                                                        label="Asignado"
                                                        placeholder="Seleccione un asignado"
                                                        value={newEvent.user_id}
                                                        onChange={(newValue) =>
                                                            setNewEvent(prev => ({ ...prev, user_id: newValue }))
                                                        }
                                                        fetchOptions={clientesService.getUsers}
                                                    />
                                                </FormControl>

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
                                        </Box>
                                    </Box>
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
                        label="Vencimiento"
                        name="next_contact"
                        type="date"
                        value={eventToEdit?.next_contact || ''}
                        onChange={handleEditEventChange}
                        fullWidth
                        margin="dense"
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl
                        fullWidth
                        size="small"
                        sx={{ width: '33%' }}
                    >
                        <AsyncSelect
                            label="Asignado"
                            placeholder="Seleccione un asignado"
                            value={newEvent.user_id}
                            onChange={(newValue) =>
                                setNewEvent(prev => ({ ...prev, user_id: newValue }))
                            }
                            fetchOptions={clientesService.getUsers}
                        />
                    </FormControl>

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
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
      <TextField
        label="Fecha"
        name="action_date"
        type="date"
        value={actionToEdit?.action_date || ''}
        onChange={handleEditActionChange}
        margin="dense"
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
        InputLabelProps={{ shrink: true }}
        sx={{ flex: 1 }}
      />
      <FormControl fullWidth size="small" sx={{ flex: 1 }}>
        <AsyncSelect
          label="Asignado"
          placeholder="Seleccione un asignado"
          value={actionToEdit?.user_id || ''}
          onChange={(newValue) =>
            setActionToEdit(prev => prev ? { ...prev, user_id: newValue } : prev)
          }
          fetchOptions={clientesService.getUsers}
        />
      </FormControl>
    </Box>
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

export default ClientView;
