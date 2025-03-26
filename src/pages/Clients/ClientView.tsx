// src/pages/Clients/ClientView.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Button,
    Card,
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
    Chip,
    ListItem,
    ListItemText,
    Divider,
    Grid,
    SelectChangeEvent,
    List
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import Header from '../../components/Header/Header';
import AsyncSelect from '../../components/AsyncSelect/AsyncSelect';

// Servicio y tipos de clientes
import { clientesService } from '../../services/clientesService';
import { Client, ClientAction, Strategy, Risk, Instrument } from '../../types/Client';

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
    listContainer: {
        maxHeight: '350px',
        overflowY: 'auto',
        marginBottom: '16px',
        padding: '8px'
    },
    addForm: {
        padding: '16px',
        backgroundColor: '#f9f9f9',
        marginTop: '16px',
        borderRadius: '8px'
    }
};

const ClientView: React.FC = () => {
    const { numcomitente } = useParams<{ numcomitente: string }>();
    const navigate = useNavigate();

    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [users, setUsers] = useState<{ id: string; label: string }[]>([]);
    const [strategy, setStrategy] = useState<Strategy | null>(null);
    const [isEditingStrategy, setIsEditingStrategy] = useState<boolean>(false);
    const [strategyForm, setStrategyForm] = useState<{ strategy: string, description: string }>({
        strategy: '',
        description: ''
    });

    // Estados para acciones
    const [newAction, setNewAction] = useState<ExtendedClientAction>({
        id: '',
        client_id: '',
        action_date: '',
        description: '',
        next_contact: '',
        user_id: '',
        status: 'abierto'
    });

    // Estados para riesgos
    const [clientRisks, setClientRisks] = useState<Risk[]>([]);
    const [availableRisks, setAvailableRisks] = useState<Risk[]>([]);
    const [riskInstruments, setRiskInstruments] = useState<Record<string, Instrument[]>>({});
    const [riskDialogOpen, setRiskDialogOpen] = useState<boolean>(false);

    // Estados para modales de edición
    const [editActionDialogOpen, setEditActionDialogOpen] = useState<boolean>(false);
    const [actionToEdit, setActionToEdit] = useState<ExtendedClientAction | null>(null);
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
                    const [actionsData, strategyData, risksData] = await Promise.all([
                        clientesService.getActionsByCodComitente(numcomitente),
                        clientesService.getStrategyByClientNumber(numcomitente),
                        clientesService.getClientRisks(numcomitente),
                        // clientesService.getAllRisks()
                    ]);

                    setClient({
                        ...clientData,
                        actions: actionsData
                    });

                    if (strategyData) {
                        setStrategy(strategyData);
                        setStrategyForm({
                            strategy: strategyData.strategy,
                            description: strategyData.description || ''
                        });
                    }

                    setClientRisks(risksData || []);

                    // if (risksData && risksData.length > 0) {
                    //     const instruments: Record<string, Instrument[]> = {};
                    //     for (const risk of risksData) {
                    //         const riskInstruments = await clientesService.getRiskInstruments(risk.id);
                    //         instruments[risk.id] = riskInstruments || [];
                    //     }
                    //     setRiskInstruments(instruments);
                    // }

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
                result = await clientesService.updateStrategy(strategy.id, {
                    ...strategy,
                    strategy: strategyForm.strategy,
                    description: strategyForm.description,
                    client_number: parseInt(clientNumComitente)
                });
            } else {
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
    type ActionStatus = 'abierto' | 'vencido' | 'cerrado';

    type ExtendedClientAction = ClientAction & {
        status: ActionStatus;
    };


    const handleGoBack = () => {
        navigate('/crm/clients');
    };

    // Funciones para acciones
    const handleActionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewAction(prev => ({ ...prev, [name]: value }));
    };

    const handleEditActionChange = (
        e: SelectChangeEvent<any> | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setActionToEdit(prev => (prev ? { ...prev, [name]: value } : prev));
    };

    const addAction = async () => {
        if (!client || !clientNumComitente || !newAction.action_date || !newAction.description || !newAction.next_contact || !newAction.user_id) return;

        const actionToCreate: ExtendedClientAction = {
            ...newAction,
            client_id: clientNumComitente,
            status: 'abierto'
        };

        try {
            const createdAction = await clientesService.createAction(clientNumComitente, actionToCreate);
            if (createdAction) {
                setClient(prev => prev ? {
                    ...prev,
                    actions: [...(prev.actions ?? []), createdAction]
                } : prev);

                setNewAction({
                    id: '',
                    client_id: '',
                    action_date: '',
                    description: '',
                    next_contact: '',
                    user_id: '',
                    status: 'abierto'
                });
            }
        } catch (err) {
            console.error('Error al crear acción:', err);
        }
    };

    const handleOpenEditAction = (action: ExtendedClientAction) => {
        console.log("Abriendo edición para acción:", action);  // Para depuración
        setActionToEdit({ ...action });  // Usar una copia para evitar referencias compartidas
        setEditActionDialogOpen(true);
    };

    const handleCloseEditAction = () => {
        setEditActionDialogOpen(false);
        setActionToEdit(null);
    };

    const handleSaveEditedAction = async () => {
        if (!client || !clientNumComitente || !actionToEdit ||
            !actionToEdit.action_date || !actionToEdit.description ||
            !actionToEdit.next_contact || !actionToEdit.user_id) return;

        try {
            const updatedAction = await clientesService.updateAction(
                actionToEdit.id.toString(),
                actionToEdit
            );

            if (updatedAction) {
                setClient(prev => prev ? {
                    ...prev,
                    actions: (prev.actions ?? []).map(a =>
                        a.id === updatedAction.id ? updatedAction : a
                    )
                } : prev);
            }
        } catch (err) {
            console.error('Error al actualizar acción:', err);
        } finally {
            handleCloseEditAction();
        }
    };

    const handleOpenRiskDialog = () => {
        setRiskDialogOpen(true);
    };

    const handleCloseRiskDialog = () => {
        setRiskDialogOpen(false);
    };

    const handleCloseAction = async (actionId: string | number) => {
        if (!client) return;

        try {
            const actionToClose = client.actions?.find(a => a.id === actionId) as ExtendedClientAction;
            if (!actionToClose) return;

            const updatedAction: ExtendedClientAction = {
                ...actionToClose,
                status: 'cerrado'
            };

            const result = await clientesService.updateAction(
                actionId.toString(),
                updatedAction
            );

            if (result) {
                setClient(prev => {
                    if (!prev) return null;
                    const updatedActions = (prev.actions || []).map(a =>
                        a.id === actionId ? { ...a, status: 'cerrado' } : a
                    );
                    return { ...prev, actions: updatedActions };
                });
            }
        } catch (err) {
            console.error('Error al cerrar la acción:', err);
        }
    };

    const handleToggleRisk = async (risk: Risk) => {
        const isAssigned = clientRisks.some(r => r.id === risk.id);

        try {
            if (isAssigned) {
                await clientesService.removeRiskFromClient(numcomitente!, risk.id);
                setClientRisks(prev => prev.filter(r => r.id !== risk.id));
                setRiskInstruments(prev => {
                    const newInstruments = { ...prev };
                    delete newInstruments[risk.id];
                    return newInstruments;
                });
            } else {
                await clientesService.addRiskToClient(numcomitente!, risk.id);
                setClientRisks(prev => [...prev, risk]);

                const instruments = await clientesService.getRiskInstruments(risk.id);
                setRiskInstruments(prev => ({
                    ...prev,
                    [risk.id]: instruments || []
                }));
            }
        } catch (err) {
            console.error('Error al actualizar riesgos:', err);
        }
    };

    const renderRiskIcons = (risk: Risk) => {
        return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {risk.fx == 1 && (
                    <Chip icon={<SwapHorizIcon />} label="FX" size="small" color="primary" variant="outlined" />
                )}
                {risk.sobo == 1 && (
                    <Chip icon={<AccountBalanceIcon />} label="Soberano" size="small" color="secondary" variant="outlined" />
                )}
                {risk.credito == 1 && (
                    <Chip icon={<AttachMoneyIcon />} label="Crédito" size="small" color="info" variant="outlined" />
                )}
                {risk.tasa == 1 && (
                    <Chip icon={<ShowChartIcon />} label="Tasa" size="small" color="success" variant="outlined" />
                )}
                {risk.equity == 1 && (
                    <Chip icon={<TrendingUpIcon />} label="Equity" size="small" color="warning" variant="outlined" />
                )}
            </Box>
        );
    };

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

    const actions = client?.actions ?? [];

    const renderClientData = () => {
        if (!client) return null;
        const excludedKeys = ['actions', 'id', 'numcomitente'];
        return (
            <Paper elevation={0} className={styles.summaryCard} sx={{ p: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                            Información del Cliente
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={1}>
                            {Object.entries(client).map(([key, value]) => {
                                if (excludedKeys.includes(key)) return null;
                                let displayKey = key.charAt(0).toUpperCase() + key.slice(1);
                                let displayValue;
                                if (typeof value === 'boolean') {
                                    displayKey = 'Estado';
                                    displayValue = value ? 'Activo' : 'Inactivo';
                                } else {
                                    displayValue = value !== null && value !== undefined ? value.toString() : '—';
                                }
                                return (
                                    <Grid item xs={12} key={key}>
                                        <Box display="flex" alignItems="center" py={0.5}>
                                            <Typography variant="body2" color="textSecondary" sx={{ minWidth: '150px', fontWeight: 500 }}>
                                                {displayKey}:
                                            </Typography>
                                            <Typography variant="body2">
                                                {displayValue}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1" gutterBottom fontWeight="medium">
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
                        <Divider sx={{ mb: 2 }} />
                        {isEditingStrategy ? (
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
                            strategy ? (
                                <Box>
                                    <Box display="flex" alignItems="center" mb={1}>
                                        <Typography variant="body2" color="textSecondary" sx={{ minWidth: '150px', fontWeight: 500 }}>
                                            Estrategia:
                                        </Typography>
                                        <Typography variant="body2" fontWeight="medium">
                                            {strategy.strategy}
                                        </Typography>
                                    </Box>
                                    {strategy.description && (
                                        <Box display="flex" alignItems="flex-start">
                                            <Typography variant="body2" color="textSecondary" sx={{ minWidth: '150px', fontWeight: 500 }}>
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
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="subtitle1" fontWeight="medium">
                            Perfil de Riesgo
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Paper elevation={1} sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                                <Box display="flex" flexWrap="wrap" gap={2} justifyContent="center">
                                    <Chip
                                        icon={<SwapHorizIcon />}
                                        label={clientRisks.some(r => r.fx == 1) ? "FX: Sí" : "FX: No"}
                                        color={clientRisks.some(r => r.fx == 1) ? "primary" : "default"}
                                        variant="outlined"
                                        sx={{ minWidth: '100px' }}
                                    />
                                    <Chip
                                        icon={<AccountBalanceIcon />}
                                        label={clientRisks.some(r => r.sobo == 1) ? "Soberano: Sí" : "Soberano: No"}
                                        color={clientRisks.some(r => r.sobo == 1) ? "secondary" : "default"}
                                        variant="outlined"
                                        sx={{ minWidth: '140px' }}
                                    />
                                    <Chip
                                        icon={<AttachMoneyIcon />}
                                        label={clientRisks.some(r => r.credito == 1) ? "Crédito: Sí" : "Crédito: No"}
                                        color={clientRisks.some(r => r.credito == 1) ? "info" : "default"}
                                        variant="outlined"
                                        sx={{ minWidth: '120px' }}
                                    />
                                    <Chip
                                        icon={<ShowChartIcon />}
                                        label={clientRisks.some(r => r.tasa == 1) ? "Tasa: Sí" : "Tasa: No"}
                                        color={clientRisks.some(r => r.tasa == 1) ? "success" : "default"}
                                        variant="outlined"
                                        sx={{ minWidth: '100px' }}
                                    />
                                    <Chip
                                        icon={<TrendingUpIcon />}
                                        label={clientRisks.some(r => r.equity == 1) ? "Equity: Sí" : "Equity: No"}
                                        color={clientRisks.some(r => r.equity == 1) ? "warning" : "default"}
                                        variant="outlined"
                                        sx={{ minWidth: '120px' }}
                                    />
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        );
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
                        <span onClick={() => navigate('/crm/clients')}>Clientes</span>
                        <span> {'>'} </span>
                        <span>{client?.nombre || 'Detalle'}</span>
                    </div>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} size="small">
                            Volver
                        </Button>
                        <div className={styles.countContainer}>
                            <Typography variant="body2">Acciones: {actions.length}</Typography>
                        </div>
                    </Box>
                    <Typography variant="h5" gutterBottom>
                        {client?.nombre || 'Detalle de Cliente'}
                    </Typography>

                    {/* Mostrar todos los datos del cliente */}
                    {renderClientData()}

                    {/* Sección de Acciones */}
                    {client && (
                        <Card sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                            <Box sx={{
                                p: 2,
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    Acciones ({actions.length})
                                </Typography>
                                <Box>
                                    <Chip
                                        icon={<AccessTimeIcon fontSize="small" />}
                                        label={`Abiertos: ${actions.filter(a => a.status === 'abierto').length}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        icon={<ErrorIcon fontSize="small" />}
                                        label={`Vencidos: ${actions.filter(a => a.status === 'vencido').length}`}
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        icon={<CheckCircleIcon fontSize="small" />}
                                        label={`Cerrados: ${actions.filter(a => a.status === 'cerrado').length}`}
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                    />
                                </Box>
                            </Box>
                            <Divider />
                            <Box className={styles.listContainer}>
                                {actions.length > 0 ? (
                                    actions.map(action => {
                                        return (
                                            <Card
                                                key={action.id}
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
                                                                    onClick={() => handleCloseAction(action.id)}
                                                                    sx={{ mr: 1 }}
                                                                >
                                                                    Cerrar
                                                                </Button>
                                                            )}
                                                            <IconButton size="small" onClick={() => handleOpenEditAction(action as ExtendedClientAction)}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Card>
                                        );
                                    })
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
                                                fetchOptions={clientesService.getUsers}
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
                        </Card>
                    )}
                </div>
            </div>

            {/* Modal para editar acción */}
            <Dialog open={editActionDialogOpen} onClose={handleCloseEditAction}>
                <DialogTitle>Editar Acción</DialogTitle>
                <DialogContent>
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
                            fetchOptions={clientesService.getUsers}
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

            {/* Modal para gestionar riesgos */}
            <Dialog open={riskDialogOpen} onClose={handleCloseRiskDialog} maxWidth="md" fullWidth>
                <DialogTitle>Gestionar Riesgos del Cliente</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Seleccione los riesgos aplicables al cliente. Cada riesgo puede tener diferentes categorías (FX, Soberano, Crédito, etc.) e instrumentos asociados.
                    </Typography>

                    <List>
                        {availableRisks.map(risk => {
                            const isAssigned = clientRisks.some(r => r.id === risk.id);
                            return (
                                <ListItem
                                    key={risk.id}
                                    secondaryAction={
                                        <Button
                                            variant={isAssigned ? "contained" : "outlined"}
                                            color={isAssigned ? "primary" : "inherit"}
                                            onClick={() => handleToggleRisk(risk)}
                                            size="small"
                                        >
                                            {isAssigned ? "Quitar" : "Asignar"}
                                        </Button>
                                    }
                                    sx={{
                                        borderBottom: '1px solid #e0e0e0',
                                        bgcolor: isAssigned ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                                        borderRadius: '4px',
                                        mb: 1
                                    }}
                                >
                                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} fontSize="small" />
                                                    <Typography variant="subtitle2">{risk.description}</Typography>
                                                </Box>
                                            }
                                            secondary={renderRiskIcons(risk)}
                                        />
                                        {isAssigned && riskInstruments[risk.id]?.length > 0 && (
                                            <Box sx={{ mt: 1, ml: 4 }}>
                                                <Typography variant="caption" color="textSecondary">
                                                    Instrumentos: {riskInstruments[risk.id].map(i => i.abbreviation).join(', ')}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </ListItem>
                            );
                        })}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRiskDialog} variant="contained">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ClientView;
