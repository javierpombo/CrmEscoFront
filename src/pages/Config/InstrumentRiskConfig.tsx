import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import Header from '../../components/Header/Header';
import Table from '../../components/Table/Table';
import { riskInstrumentService } from '../../services/riskInstrumentService';
import styles from './InstrumentRiskConfig.module.css';

// Interfaces para datos
interface Risk {
  id: number;
  description: string;
  fx: number;
  sobo: number;
  credito: number;
  tasa: number;
  equity: number;
}

interface Instrument {
  id: number;
  id_instruments?: string;
  description: string;
  abbreviation: string;
  iso?: string;
  fx: number;
  sobo: number;
  credito: number;
  tasa: number;
  equity: number;
}

// Función helper para obtener el identificador único del instrumento
const getInstrumentIdentifier = (instrument: Instrument): string => {
  return instrument.id_instruments ? instrument.id_instruments : instrument.id.toString();
};

// Estilos fijos para la página
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
  }
};

const InstrumentRiskConfig: React.FC = () => {
  const navigate = useNavigate();

  // Estados generales
  const [risks, setRisks] = useState<Risk[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [relatedInstruments, setRelatedInstruments] = useState<Instrument[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'risks' | 'instruments'>('risks');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estados para riesgos
  const [isCreatingRisk, setIsCreatingRisk] = useState<boolean>(false);
  const [isEditingRisk, setIsEditingRisk] = useState<boolean>(false);
  const [newRisk, setNewRisk] = useState<{ description: string; fx: boolean; sobo: boolean; credito: boolean; tasa: boolean; equity: boolean; }>({
    description: '',
    fx: false,
    sobo: false,
    credito: false,
    tasa: false,
    equity: false
  });
  const [editRiskData, setEditRiskData] = useState<{ id: number; description: string; fx: boolean; sobo: boolean; credito: boolean; tasa: boolean; equity: boolean; }>({
    id: 0,
    description: '',
    fx: false,
    sobo: false,
    credito: false,
    tasa: false,
    equity: false
  });

  // Estados para instrumentos (creación/edición)
  const [isCreatingInstrument, setIsCreatingInstrument] = useState<boolean>(false);
  const [isEditingInstrument, setIsEditingInstrument] = useState<boolean>(false);
  const [newInstrument, setNewInstrument] = useState<{ description: string; abbreviation: string; iso: string; }>({
    description: '',
    abbreviation: '',
    iso: ''
  });
  const [editInstrumentData, setEditInstrumentData] = useState<{ id: number; description: string; abbreviation: string; iso: string; }>({
    id: 0,
    description: '',
    abbreviation: '',
    iso: ''
  });

  // Carga inicial de datos
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [risksData, instrumentsData] = await Promise.all([
        riskInstrumentService.getRisks(),
        riskInstrumentService.getInstruments()
      ]);
      setRisks(risksData);
      setInstruments(instrumentsData);

      // Seleccionar el primer riesgo por defecto
      if (risksData.length > 0) {
        const firstRisk = risksData[0];
        setSelectedRisk(firstRisk);
        await loadRiskDetails(firstRisk.id);
        await loadInstrumentsForRisk(firstRisk.id);
      }
    } catch (err) {
      setError('Error al cargar los datos. Por favor, inténtelo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRiskDetails = async (riskId: number) => {
    try {
      const risk = await riskInstrumentService.getRisk(riskId);
      if (risk) {
        setSelectedRisk(risk);
      }
    } catch (err) {
      console.error(`Error al cargar detalles del riesgo ${riskId}:`, err);
    }
  };

  const loadInstrumentsForRisk = async (riskId: number) => {
    setIsLoading(true);
    try {
      const instrumentsData = await riskInstrumentService.getRiskInstruments(riskId);
      setRelatedInstruments(instrumentsData);
    } catch (err) {
      console.error('Error al cargar instrumentos relacionados:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRisk = (risk: Risk) => {
    loadRiskDetails(risk.id);
    loadInstrumentsForRisk(risk.id);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleTabChange = (tab: 'risks' | 'instruments') => {
    setActiveTab(tab);
  };

  // Formulario de creación y edición de riesgo
  const handleCreateRiskFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setNewRisk(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleOpenCreateRisk = () => {
    setNewRisk({ description: '', fx: false, sobo: false, credito: false, tasa: false, equity: false });
    setIsCreatingRisk(true);
  };

  const handleSaveNewRisk = async () => {
    if (!newRisk.description.trim()) {
      setError('La descripción del riesgo es obligatoria');
      return;
    }
    setIsLoading(true);
    try {
      const riskData = {
        description: newRisk.description,
        fx: newRisk.fx ? 1 : 0,
        sobo: newRisk.sobo ? 1 : 0,
        credito: newRisk.credito ? 1 : 0,
        tasa: newRisk.tasa ? 1 : 0,
        equity: newRisk.equity ? 1 : 0
      };
      const createdRisk = await riskInstrumentService.createRisk(riskData);
      console.log("Riesgo creado:", createdRisk);
      if (createdRisk) {
        const risksData = await riskInstrumentService.getRisks();
        setRisks(risksData);
        setSelectedRisk(createdRisk);
        setIsCreatingRisk(false);
      }
    } catch (err) {
      setError('Error al crear el riesgo. Por favor, inténtelo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditRisk = (risk: Risk) => {
    setEditRiskData({
      id: risk.id,
      description: risk.description,
      fx: Number(risk.fx) === 1,
      sobo: Number(risk.sobo) === 1,
      credito: Number(risk.credito) === 1,
      tasa: Number(risk.tasa) === 1,
      equity: Number(risk.equity) === 1
    });
    setIsEditingRisk(true);
  };

  const handleEditRiskFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setEditRiskData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveEditRisk = async () => {
    if (!editRiskData.description.trim()) {
      setError('La descripción del riesgo es obligatoria');
      return;
    }
    setIsLoading(true);
    try {
      const riskData = {
        description: editRiskData.description,
        fx: editRiskData.fx ? 1 : 0,
        sobo: editRiskData.sobo ? 1 : 0,
        credito: editRiskData.credito ? 1 : 0,
        tasa: editRiskData.tasa ? 1 : 0,
        equity: editRiskData.equity ? 1 : 0
      };
      const updatedRisk = await riskInstrumentService.updateRisk(editRiskData.id, riskData);
      console.log("Riesgo actualizado:", updatedRisk);
      if (updatedRisk) {
        const risksData = await riskInstrumentService.getRisks();
        setRisks(risksData);
        if (selectedRisk && selectedRisk.id === editRiskData.id) {
          setSelectedRisk(updatedRisk);
        }
        setIsEditingRisk(false);
      }
    } catch (err) {
      setError('Error al actualizar el riesgo. Por favor, inténtelo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para determinar si un instrumento está asignado, usando el id_instruments
  const isInstrumentAssigned = (instrument: Instrument) => {
    return relatedInstruments.some(ri => getInstrumentIdentifier(ri) === getInstrumentIdentifier(instrument));
  };

  // Función helper para obtener el identificador único del instrumento (id_instruments o id)
  const getInstrumentIdentifier = (instrument: Instrument): string => {
    return instrument.id_instruments ? instrument.id_instruments : instrument.id.toString();
  };

  // Función para asignar o quitar un instrumento (toggle), enviando el identificador correcto
  const toggleInstrumentAssignment = async (instrument: Instrument) => {
    if (!selectedRisk) return;
    setIsLoading(true);

    // Tomamos "E24511" (si existe) o convertimos el id numérico a string
    const identifier = getInstrumentIdentifier(instrument);

    try {
      if (isInstrumentAssigned(instrument)) {
        // DESASIGNAR => GET /risks/:riskId/instruments/:instrumentId
        await riskInstrumentService.removeInstrumentFromRisk(selectedRisk.id, identifier);
      } else {
        // ASIGNAR => POST /risks/:riskId/instruments con body { instrument_id: "..." }
        await riskInstrumentService.assignInstrumentToRisk(selectedRisk.id, identifier);
      }
      await loadInstrumentsForRisk(selectedRisk.id);
    } catch (err) {
      setError('Error al actualizar la asignación del instrumento.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Formulario de creación y edición de instrumento
  const handleOpenCreateInstrument = () => {
    setNewInstrument({ description: '', abbreviation: '', iso: '' });
    setIsCreatingInstrument(true);
  };

  const handleSaveNewInstrument = async () => {
    if (!newInstrument.description.trim() || !newInstrument.abbreviation.trim()) {
      setError('La descripción y abreviatura del instrumento son obligatorias');
      return;
    }
    setIsLoading(true);
    try {
      const instrumentData = {
        description: newInstrument.description,
        abbreviation: newInstrument.abbreviation,
        iso: newInstrument.iso
      };
      const createdInstrument = await riskInstrumentService.createInstrument(instrumentData);
      console.log("Instrumento creado:", createdInstrument);
      if (createdInstrument) {
        const instrumentsData = await riskInstrumentService.getInstruments();
        setInstruments(instrumentsData);
        setIsCreatingInstrument(false);
      }
    } catch (err) {
      setError('Error al crear el instrumento. Por favor, inténtelo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEditInstrument = (instrument: Instrument) => {
    setEditInstrumentData({
      id: instrument.id,
      description: instrument.description,
      abbreviation: instrument.abbreviation,
      iso: instrument.iso || ''
    });
    setIsEditingInstrument(true);
  };

  const handleEditInstrumentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditInstrumentData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveEditInstrument = async () => {
    if (!editInstrumentData.description.trim() || !editInstrumentData.abbreviation.trim()) {
      setError('La descripción y abreviatura del instrumento son obligatorias');
      return;
    }
    setIsLoading(true);
    try {
      const instrumentData = {
        description: editInstrumentData.description,
        abbreviation: editInstrumentData.abbreviation,
        iso: editInstrumentData.iso
      };
      const updatedInstrument = await riskInstrumentService.updateInstrument(editInstrumentData.id, instrumentData);
      console.log("Instrumento actualizado:", updatedInstrument);
      if (updatedInstrument) {
        const instrumentsData = await riskInstrumentService.getInstruments();
        setInstruments(instrumentsData);
        setIsEditingInstrument(false);
      }
    } catch (err) {
      setError('Error al actualizar el instrumento. Por favor, inténtelo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteInstrument = async (instrumentId: number) => {
    if (!window.confirm('¿Está seguro de eliminar este instrumento?')) return;
    setIsLoading(true);
    try {
      const success = await riskInstrumentService.deleteInstrument(instrumentId);
      console.log("Instrumento eliminado:", success);
      if (success) {
        const instrumentsData = await riskInstrumentService.getInstruments();
        setInstruments(instrumentsData);
      }
    } catch (err) {
      setError('Error al eliminar el instrumento. Por favor, inténtelo de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado por búsqueda (para ambos tabs)
  const filteredRisks = searchTerm
    ? risks.filter(risk => risk.description.toLowerCase().includes(searchTerm.toLowerCase()))
    : risks;
  const filteredInstruments = searchTerm
    ? instruments.filter(instrument =>
      instrument.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      instrument.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : instruments;

  // Para la tabla de asignación en el riesgo, se ordenan los instrumentos asignados primero
  const sortedInstruments = [...instruments].sort((a, b) => {
    const aAssigned = isInstrumentAssigned(a) ? 1 : 0;
    const bAssigned = isInstrumentAssigned(b) ? 1 : 0;
    return bAssigned - aAssigned;
  });

  // Definición de columnas para la tabla de instrumentos (vista general)
  const instrumentColumns = [
    { label: 'Descripción', field: 'description' },
    { label: 'Abreviatura', field: 'abbreviation' },
    { label: 'ISO', field: 'iso', render: (row: Instrument) => row.iso || '-' },
    {
      label: 'Acciones',
      field: 'acciones',
      render: (row: Instrument) => (
        <>
          <IconButton size="small" onClick={() => handleOpenEditInstrument(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteInstrument(row.id)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </>
      )
    }
  ];

  // Columnas para la tabla de asignación de instrumentos en el riesgo
  const riskAssignColumns = [
    { label: 'Descripción', field: 'description' },
    { label: 'Abreviatura', field: 'abbreviation' },
    { label: 'ISO', field: 'iso', render: (row: Instrument) => row.iso || '-' },
    {
      label: 'Estado',
      field: 'estado',
      render: (row: Instrument) =>
        isInstrumentAssigned(row) ? (
          <Chip label="Asignado" size="small" color="primary" />
        ) : (
          <Chip label="No asignado" size="small" variant="outlined" />
        )
    },
    {
      label: 'Acción',
      field: 'accion',
      render: (row: Instrument) => (
        <Button
          variant={isInstrumentAssigned(row) ? 'outlined' : 'contained'}
          size="small"
          onClick={() => toggleInstrumentAssignment(row)}
        >
          {isInstrumentAssigned(row) ? 'Quitar' : 'Asignar'}
        </Button>
      )
    }
  ];

  // Renderiza los íconos de riesgo usando comparación numérica
  const renderRiskIcons = (risk: Risk) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
      {Number(risk.fx) === 1 && <Chip icon={<SwapHorizIcon />} label="FX" size="small" color="primary" variant="outlined" />}
      {Number(risk.sobo) === 1 && <Chip icon={<AccountBalanceIcon />} label="Soberano" size="small" color="secondary" variant="outlined" />}
      {Number(risk.credito) === 1 && <Chip icon={<AttachMoneyIcon />} label="Crédito" size="small" color="info" variant="outlined" />}
      {Number(risk.tasa) === 1 && <Chip icon={<ShowChartIcon />} label="Tasa" size="small" color="success" variant="outlined" />}
      {Number(risk.equity) === 1 && <Chip icon={<TrendingUpIcon />} label="Equity" size="small" color="warning" variant="outlined" />}
    </Box>
  );

  return (
    <div style={fixedHeightStyles.pageContainer}>
      <div style={fixedHeightStyles.headerContainer}>
        <Header />
      </div>
      <div style={fixedHeightStyles.contentWrapper}>
        <div style={fixedHeightStyles.mainContent}>
          {/* Breadcrumb */}
          <div className={styles.breadcrumb}>
            <span onClick={() => navigate('/')}>Inicio</span>
            <span> {'>'} </span>
            <span>Configuración de Instrumentos y Riesgos</span>
          </div>

          {/* Botón de volver y conteo */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button startIcon={<ArrowBackIcon />} onClick={handleGoBack} size="small">
              Volver
            </Button>
            <div className={styles.countContainer}>
              <Typography variant="body2">
                Riesgos: {risks.length} | Instrumentos: {instruments.length}
              </Typography>
            </div>
          </Box>

          {/* Título y búsqueda */}
          <Typography variant="h5" gutterBottom>
            Configuración de Instrumentos y Riesgos
          </Typography>
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Buscar"
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ maxWidth: '400px' }}
            />
          </Box>

          {/* Tabs de navegación */}
          <Paper sx={{ mb: 3, borderRadius: '8px' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex' }}>
              <Button
                sx={{
                  borderRadius: '0',
                  borderBottom: activeTab === 'risks' ? '2px solid #1976d2' : 'none',
                  color: activeTab === 'risks' ? '#1976d2' : 'inherit',
                  fontWeight: activeTab === 'risks' ? 'bold' : 'normal',
                  py: 1.5,
                  px: 3
                }}
                onClick={() => handleTabChange('risks')}
              >
                Riesgos
              </Button>
              <Button
                sx={{
                  borderRadius: '0',
                  borderBottom: activeTab === 'instruments' ? '2px solid #1976d2' : 'none',
                  color: activeTab === 'instruments' ? '#1976d2' : 'inherit',
                  fontWeight: activeTab === 'instruments' ? 'bold' : 'normal',
                  py: 1.5,
                  px: 3
                }}
                onClick={() => handleTabChange('instruments')}
              >
                Instrumentos
              </Button>
            </Box>
          </Paper>

          {/* Contenido según pestaña */}
          {activeTab === 'risks' ? (
            <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 280px)' }}>
              {/* Lista de riesgos */}
              <Paper
                elevation={0}
                sx={{
                  width: '300px',
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Lista de Riesgos
                  </Typography>
                  <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateRisk}>
                    Nuevo Riesgo
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  {isLoading && filteredRisks.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        Cargando riesgos...
                      </Typography>
                    </Box>
                  ) : filteredRisks.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        No se encontraron riesgos
                      </Typography>
                    </Box>
                  ) : (
                    filteredRisks.map(risk => (
                      <Paper
                        key={risk.id}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          border: '1px solid #e0e0e0',
                          borderLeft: selectedRisk?.id === risk.id ? '4px solid #1976d2' : '1px solid #e0e0e0',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          backgroundColor: selectedRisk?.id === risk.id ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                        }}
                        onClick={() => handleSelectRisk(risk)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {risk.description}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditRisk(risk);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        {renderRiskIcons(risk)}
                      </Paper>
                    ))
                  )}
                </Box>
              </Paper>

              {/* Detalles del riesgo y asignación de instrumentos */}
              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {!selectedRisk ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <Typography variant="body1" color="textSecondary">
                      Seleccione un riesgo para ver sus detalles
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Detalles del riesgo */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6">Detalles del Riesgo: {selectedRisk.description}</Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" gutterBottom>
                        Tipos de Riesgo:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        <Chip icon={<SwapHorizIcon />} label={`FX: ${Number(selectedRisk.fx) === 1 ? 'Sí' : 'No'}`} size="small" variant="outlined" />
                        <Chip icon={<AccountBalanceIcon />} label={`Soberano: ${Number(selectedRisk.sobo) === 1 ? 'Sí' : 'No'}`} size="small" variant="outlined" />
                        <Chip icon={<AttachMoneyIcon />} label={`Crédito: ${Number(selectedRisk.credito) === 1 ? 'Sí' : 'No'}`} size="small" variant="outlined" />
                        <Chip icon={<ShowChartIcon />} label={`Tasa: ${Number(selectedRisk.tasa) === 1 ? 'Sí' : 'No'}`} size="small" variant="outlined" />
                        <Chip icon={<TrendingUpIcon />} label={`Equity: ${Number(selectedRisk.equity) === 1 ? 'Sí' : 'No'}`} size="small" variant="outlined" />
                      </Box>
                    </Box>

                    {/* Tabla de asignación de instrumentos para el riesgo */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Asignación de Instrumentos:
                      </Typography>
                      <Paper sx={{ overflowX: 'auto' }}>
                        <Table columns={riskAssignColumns} data={sortedInstruments} />
                      </Paper>
                    </Box>
                  </>
                )}
              </Paper>
            </Box>
          ) : (
            // Pestaña de Instrumentos: vista general con Table
            <Paper
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Lista de Instrumentos</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreateInstrument}>
                  Nuevo Instrumento
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {isLoading && filteredInstruments.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    Cargando instrumentos...
                  </Typography>
                </Box>
              ) : filteredInstruments.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    No se encontraron instrumentos
                  </Typography>
                </Box>
              ) : (
                <Table columns={instrumentColumns} data={filteredInstruments} />
              )}
            </Paper>
          )}

          {/* Modal para crear riesgo */}
          <Dialog open={isCreatingRisk} onClose={() => setIsCreatingRisk(false)}>
            <DialogTitle>Crear Nuevo Riesgo</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="description"
                name="description"
                label="Descripción"
                type="text"
                fullWidth
                variant="outlined"
                value={newRisk.description}
                onChange={handleCreateRiskFormChange}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Tipos de Riesgo:</Typography>
                <FormControlLabel
                  control={<Checkbox checked={newRisk.fx} onChange={handleCreateRiskFormChange} name="fx" />}
                  label="FX"
                />
                <FormControlLabel
                  control={<Checkbox checked={newRisk.sobo} onChange={handleCreateRiskFormChange} name="sobo" />}
                  label="Soberano"
                />
                <FormControlLabel
                  control={<Checkbox checked={newRisk.credito} onChange={handleCreateRiskFormChange} name="credito" />}
                  label="Crédito"
                />
                <FormControlLabel
                  control={<Checkbox checked={newRisk.tasa} onChange={handleCreateRiskFormChange} name="tasa" />}
                  label="Tasa"
                />
                <FormControlLabel
                  control={<Checkbox checked={newRisk.equity} onChange={handleCreateRiskFormChange} name="equity" />}
                  label="Equity"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCreatingRisk(false)}>Cancelar</Button>
              <Button onClick={handleSaveNewRisk} variant="contained" disabled={!newRisk.description.trim()}>
                Crear
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal para editar riesgo */}
          <Dialog open={isEditingRisk} onClose={() => setIsEditingRisk(false)}>
            <DialogTitle>Editar Riesgo</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="description"
                name="description"
                label="Descripción"
                type="text"
                fullWidth
                variant="outlined"
                value={editRiskData.description}
                onChange={handleEditRiskFormChange}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Tipos de Riesgo:</Typography>
                <FormControlLabel
                  control={<Checkbox checked={editRiskData.fx} onChange={handleEditRiskFormChange} name="fx" />}
                  label="FX"
                />
                <FormControlLabel
                  control={<Checkbox checked={editRiskData.sobo} onChange={handleEditRiskFormChange} name="sobo" />}
                  label="Soberano"
                />
                <FormControlLabel
                  control={<Checkbox checked={editRiskData.credito} onChange={handleEditRiskFormChange} name="credito" />}
                  label="Crédito"
                />
                <FormControlLabel
                  control={<Checkbox checked={editRiskData.tasa} onChange={handleEditRiskFormChange} name="tasa" />}
                  label="Tasa"
                />
                <FormControlLabel
                  control={<Checkbox checked={editRiskData.equity} onChange={handleEditRiskFormChange} name="equity" />}
                  label="Equity"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditingRisk(false)}>Cancelar</Button>
              <Button onClick={handleSaveEditRisk} variant="contained" disabled={!editRiskData.description.trim()}>
                Guardar Cambios
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal para crear instrumento */}
          <Dialog open={isCreatingInstrument} onClose={() => setIsCreatingInstrument(false)}>
            <DialogTitle>Crear Nuevo Instrumento</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="instrument-description"
                name="description"
                label="Descripción"
                type="text"
                fullWidth
                variant="outlined"
                value={newInstrument.description}
                onChange={(e) => setNewInstrument(prev => ({ ...prev, description: e.target.value }))}
              />
              <TextField
                margin="dense"
                id="instrument-abbreviation"
                name="abbreviation"
                label="Abreviatura"
                type="text"
                fullWidth
                variant="outlined"
                value={newInstrument.abbreviation}
                onChange={(e) => setNewInstrument(prev => ({ ...prev, abbreviation: e.target.value }))}
              />
              <TextField
                margin="dense"
                id="instrument-iso"
                name="iso"
                label="ISO"
                type="text"
                fullWidth
                variant="outlined"
                value={newInstrument.iso}
                onChange={(e) => setNewInstrument(prev => ({ ...prev, iso: e.target.value }))}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCreatingInstrument(false)}>Cancelar</Button>
              <Button onClick={handleSaveNewInstrument} variant="contained" disabled={!newInstrument.description.trim() || !newInstrument.abbreviation.trim()}>
                Crear
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal para editar instrumento */}
          <Dialog open={isEditingInstrument} onClose={() => setIsEditingInstrument(false)}>
            <DialogTitle>Editar Instrumento</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                id="edit-instrument-description"
                name="description"
                label="Descripción"
                type="text"
                fullWidth
                variant="outlined"
                value={editInstrumentData.description}
                onChange={handleEditInstrumentFormChange}
              />
              <TextField
                margin="dense"
                id="edit-instrument-abbreviation"
                name="abbreviation"
                label="Abreviatura"
                type="text"
                fullWidth
                variant="outlined"
                value={editInstrumentData.abbreviation}
                onChange={handleEditInstrumentFormChange}
              />
              <TextField
                margin="dense"
                id="edit-instrument-iso"
                name="iso"
                label="ISO"
                type="text"
                fullWidth
                variant="outlined"
                value={editInstrumentData.iso}
                onChange={handleEditInstrumentFormChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsEditingInstrument(false)}>Cancelar</Button>
              <Button onClick={handleSaveEditInstrument} variant="contained" disabled={!editInstrumentData.description.trim() || !editInstrumentData.abbreviation.trim()}>
                Guardar Cambios
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default InstrumentRiskConfig;
