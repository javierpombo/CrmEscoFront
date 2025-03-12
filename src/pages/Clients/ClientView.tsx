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
import { Client, ClientEvent, ClientAction, Strategy } from '../../types/Client';

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
    const [strategy, setStrategy] = useState<Strategy | null>(null);
    const [isEditingStrategy, setIsEditingStrategy] = useState<boolean>(false);
    const [strategyForm, setStrategyForm] = useState<{ strategy: string, description: string }>({
        strategy: '',
        description: ''
    });

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
    const [clientNumComitente, setClientNumComitente] = useState<string>('');

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
                    setClientNumComitente(numcomitente);
                    const [eventsData, actionsData, strategyData] = await Promise.all([
                        clientesService.getEventsByCodComitente(numcomitente),
                        clientesService.getActionsByCodComitente(numcomitente),
                        clientesService.getStrategyByClientNumber(numcomitente)
                    ]);
                    setClient({
                        ...clientData,
                        events: eventsData,
                        actions: actionsData
                    });

                    // Si hay estrategia, la guardamos en el estado
                    if (strategyData) {
                        setStrategy(strategyData);
                        setStrategyForm({
                            strategy: strategyData.strategy,
                            description: strategyData.description || ''
                        });
                    }

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

    // Funciones para manejar la estrategia
    const handleStrategyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setStrategyForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditStrategy = () => {
        setIsEditingStrategy(true);
    };

    const handleCancelEditStrategy = () => {
        // Restablecemos los valores originales
        if (strategy) {
            setStrategyForm({
                strategy: strategy.strategy,
                description: strategy.description || ''
            });
        } else {
            setStrategyForm({
                strategy: '',
                description: ''
            });
        }
        setIsEditingStrategy(false);
    };

    const handleSaveStrategy = async () => {
        if (!clientNumComitente) return;

        try {
            let result;
            if (strategy?.id) {
                // Si ya existe una estrategia, la actualizamos
                result = await clientesService.updateStrategy(strategy.id, {
                    ...strategy,
                    strategy: strategyForm.strategy,
                    description: strategyForm.description,
                    client_number: parseInt(clientNumComitente)
                });
            } else {
                // Si no existe, creamos una nueva
                result = await clientesService.createStrategy({
                    strategy: strategyForm.strategy,
                    description: strategyForm.description,
                    client_number: parseInt(clientNumComitente)
                });
            }

            if (result) {
                setStrategy(result);
                setIsEditingStrategy(false);
            }
        } catch (err) {
            console.error('Error al guardar la estrategia:', err);
        }
    };

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
        if (!client || !clientNumComitente || !newEvent.event_date || !newEvent.description || !newEvent.next_contact || !newEvent.user_id) return;

        const eventToCreate = {
            ...newEvent,
            client_id: clientNumComitente
        };

        try {
            const createdEvent = await clientesService.createEvent(clientNumComitente, eventToCreate);
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
        if (!client || !clientNumComitente || !eventToEdit ||
            !eventToEdit.event_date || !eventToEdit.description ||
            !eventToEdit.next_contact || !eventToEdit.user_id) return;
        try {
            const updatedEvent = await clientesService.updateEvent(clientNumComitente, eventToEdit);
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
        if (!client || !clientNumComitente || !newAction.action_date || !newAction.description || !newAction.next_contact || !newAction.user_id) return;

        const actionToCreate = {
            ...newAction,
            client_id: clientNumComitente
        };

        try {
            const createdAction = await clientesService.createAction(clientNumComitente, actionToCreate);
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
        if (!client || !clientNumComitente || !actionToEdit ||
            !actionToEdit.action_date || !actionToEdit.description ||
            !actionToEdit.next_contact || !actionToEdit.user_id) return;
        try {
            const updatedAction = await clientesService.updateAction(clientNumComitente, actionToEdit);
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
                    
                    {/* Sección de estrategia directamente integrada en la info del cliente */}
                    <Box sx={{ mt: 2, borderTop: '1px solid #e0e0e0', pt: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Estrategia 
                            </Typography>
                            {!isEditingStrategy ? (
                                <Button 
                                    size="small" 
                                    variant="outlined" 
                                    startIcon={strategy ? <EditIcon /> : <AddIcon />}
                                    onClick={handleEditStrategy}
                                >
                                    {strategy ? 'Editar' : 'Agregar'}
                                </Button>
                            ) : (
                                <Box display="flex" gap={1}>
                                    <Button 
                                        size="small" 
                                        variant="outlined" 
                                        color="inherit"
                                        onClick={handleCancelEditStrategy}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        size="small" 
                                        variant="contained" 
                                        color="primary"
                                        onClick={handleSaveStrategy}
                                        disabled={!strategyForm.strategy}
                                    >
                                        Guardar
                                    </Button>
                                </Box>
                            )}
                        </Box>
                        
                        {isEditingStrategy ? (
                            // Formulario de edición de estrategia
                            <Box>
                                <TextField
                                    label="Estrategia"
                                    name="strategy"
                                    value={strategyForm.strategy}
                                    onChange={handleStrategyChange}
                                    fullWidth
                                    size="small"
                                    required
                                    margin="dense"
                                />
                                <TextField
                                    label="Descripción"
                                    name="description"
                                    value={strategyForm.description}
                                    onChange={handleStrategyChange}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    size="small"
                                    margin="dense"
                                />
                            </Box>
                        ) : (
                            // Mostrar estrategia o mensaje si no existe
                            strategy ? (
                                <Box>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Typography variant="caption" color="textSecondary" sx={{ minWidth: '150px' }}>
                                            Estrategia:
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {strategy.strategy}
                                        </Typography>
                                    </Box>
                                    {strategy.description && (
                                        <Box display="flex" alignItems="flex-start">
                                            <Typography variant="caption" color="textSecondary" sx={{ minWidth: '150px' }}>
                                                Descripción:
                                            </Typography>
                                            <Typography variant="body2">
                                                {strategy.description}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary" align="center" py={1}>
                                    No hay estrategia definida para este cliente
                                </Typography>
                            )
                        )}
                    </Box>
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
                                                    required
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
                                                    required
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ flex: 1 }}
                                                />

                                                <FormControl sx={{ flex: 1 }} size="small" required>
                                                    <AsyncSelect
                                                        label="Asignado"
                                                        placeholder="Seleccione un asignado"
                                                        value={newEvent.user_id}
                                                        onChange={(newValue) =>
                                                            setNewEvent(prev => ({ ...prev, user_id: newValue }))
                                                        }
                                                        fetchOptions={clientesService.getUsers}
                                                        required
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
                                                required
                                                sx={{ mt: 1 }}
                                            />
                                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    size="small"
                                                    startIcon={<AddIcon />}
                                                    onClick={addEvent}
                                                    disabled={!newEvent.event_date || !newEvent.description || !newEvent.next_contact || !newEvent.user_id}
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
                                                    required
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
                                                    required
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ width: '33%' }}
                                                />
                                                <FormControl
                                                    fullWidth
                                                    size="small"
                                                    sx={{ width: '33%' }}
                                                    required
                                                >
                                                    <AsyncSelect
                                                        label="Asignado"
                                                        placeholder="Seleccione un asignado"
                                                        value={newAction.user_id} // CORREGIDO: Usa newAction en lugar de newEvent
                                                        onChange={(newValue) =>
                                                            setNewAction(prev => ({ ...prev, user_id: newValue })) // CORREGIDO: Actualiza newAction
                                                        }
                                                        fetchOptions={clientesService.getUsers}
                                                        required
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
                                                required
                                                sx={{ mt: 1 }}
                                            />
                                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
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
                        required
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
                        required
                        InputLabelProps={{ shrink: true }}
                    />
                    <FormControl
                        fullWidth
                        margin="dense"
                        required
                    >
                        <AsyncSelect
                            label="Asignado"
                            placeholder="Seleccione un asignado"
                            value={eventToEdit?.user_id || ''} // CORREGIDO: Usa eventToEdit en lugar de newEvent
                            onChange={(newValue) =>
                                setEventToEdit(prev => prev ? { ...prev, user_id: newValue } : prev) // CORREGIDO: Actualiza eventToEdit
                            }
                            fetchOptions={clientesService.getUsers}
                            required
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
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditEvent}>Cancelar</Button>
                    <Button
                        onClick={handleSaveEditedEvent}
                        variant="contained"
                        color="primary"
                        disabled={!eventToEdit?.event_date || !eventToEdit?.description || !eventToEdit?.next_contact || !eventToEdit?.user_id}
                    >
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
                        <FormControl fullWidth margin="dense" sx={{ flex: 1 }} required>
                            <AsyncSelect
                                label="Asignado"
                                placeholder="Seleccione un asignado"
                                value={actionToEdit?.user_id || ''}
                                onChange={(newValue) =>
                                    setActionToEdit(prev => prev ? { ...prev, user_id: newValue } : prev)
                                }
                                fetchOptions={clientesService.getUsers}
                                required
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
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditAction}>Cancelar</Button>
                    <Button
                        onClick={handleSaveEditedAction}
                        variant="contained"
                        color="primary"
                        disabled={!actionToEdit?.action_date || !actionToEdit?.description || !actionToEdit?.next_contact || !actionToEdit?.user_id}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ClientView;