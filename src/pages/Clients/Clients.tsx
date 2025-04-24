import React, { useEffect, useState } from 'react';
import styles from './Clients.module.css';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navigation/Navbar/Navbar';
import Table from '../../components/Table/Table';
import FilterDropdown, { FilterOption } from '../../components/FilterDropdown/FilterDropdown';
import ImprovedDateRangePicker from './../../components/ImprovedDateRangePicker/ImprovedDateRangePicker';
import ActiveFilterChips, { FilterItem } from './../../components/ActiveFilterChips/ActiveFilterChips';
import Pagination from '../../components/Pagination/Pagination';
import { Typography, TextField, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getClients, searchClients } from '../../api/api';
import { clientesService } from '../../services/clientesService';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import { format, parseISO } from 'date-fns';

// Interfaz actualizada para incluir riesgos y fecha de vencimiento
interface ClientDashboard {
  id: string;
  nombre: string;
  oficial: string;
  referente: string;
  Numero: string;
  fechaVencimiento: string | null; // Fecha de vencimiento
  cuit?: string;
  mail?: string;
  sector?: string;
  fx?: string;
  sob?: string;
  credito?: string;
  tasa?: string;
  equity?: string;
  estadoAccion?: string;
}

// Interfaz para las columnas de la tabla
interface Column {
  label: string | React.ReactNode;
  field: string;
  render?: (row: any) => React.ReactNode;
}

// Función de debounce para optimizar búsquedas (copiada de ProspectList)
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const ClientsDashboard: React.FC = () => {
  // Estados de datos y paginación (siguiendo el patrón de ProspectList)
  const [clients, setClients] = useState<ClientDashboard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [filterRisk, setFilterRisk] = useState<string | null>(null);
  const [availableRisks, setAvailableRisks] = useState<Array<{ id: string; name: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortByDueDate, setSortByDueDate] = useState<'ascending' | 'descending' | null>(null);
  const [fxRiskFilter, setFxRiskFilter] = useState<number | null>(null);
  const [sobRiskFilter, setSobRiskFilter] = useState<number | null>(null);
  const [creditoRiskFilter, setCreditoRiskFilter] = useState<number | null>(null);
  const [tasaRiskFilter, setTasaRiskFilter] = useState<number | null>(null);
  const [equityRiskFilter, setEquityRiskFilter] = useState<number | null>(null);

  // filtros añadidos
  const [actionStateFilter, setActionStateFilter] = useState<'todos' | 'vencido' | 'cerrado' | 'abierto'>('todos');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending' | null;
  }>({
    key: 'fechaVencimiento',
    direction: 'ascending'
  });

  const navigate = useNavigate();

  // Aplicar debounce al término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  //Opciones para el filtro anidado
  const filterNestedOptions: FilterOption[] = [
    {
      id: 'clients',
      name: 'Clientes',
      icon: '/search.svg',
      children: [
        { id: 'todos', name: 'Todos' },
        { id: 'activos', name: 'Activos' },
        { id: 'inactivos', name: 'Inactivos' }
      ]
    },
    {
      id: 'actions',
      name: 'Acciones',
      icon: '/search.svg',
      children: [
        { id: 'todos', name: 'Todas' },
        { id: 'abierto', name: 'Abiertas' },
        { id: 'vencido', name: 'Vencidas' },
        { id: 'cerrado', name: 'Cerradas' }
      ]
    }
  ];

  const handleNestedFilterSelect = (filterId: string, parentId?: string) => {
    if (parentId === 'clients') {
      setFilterStatus(filterId as 'todos' | 'activos' | 'inactivos');
    } else if (parentId === 'actions') {
      setActionStateFilter(filterId as 'todos' | 'vencido' | 'cerrado' | 'abierto');
    }
    // No estamos buscando cuando aplicamos filtros
    setIsSearching(false);
    setCurrentPage(1);
  };


  // Función para manejar el ordenamiento (igual que en ProspectList)
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    setSortConfig({ key, direction });
  };

  // Renderizar ícono de ordenamiento (igual que en ProspectList)
  const getSortIcon = (columnName: string) => {
    if (sortConfig.key !== columnName) {
      return <SwapVertIcon fontSize="small" />;
    }

    if (sortConfig.direction === 'ascending') {
      return <ArrowUpwardIcon fontSize="small" />;
    }

    if (sortConfig.direction === 'descending') {
      return <ArrowDownwardIcon fontSize="small" />;
    }

    return <SwapVertIcon fontSize="small" />;
  };
  // Limpieza de filtros
  const clearAllFilters = () => {
    setFilterStatus('todos');
    setFxRiskFilter(null);
    setSobRiskFilter(null);
    setCreditoRiskFilter(null);
    setTasaRiskFilter(null);
    setEquityRiskFilter(null);
    setSearchTerm('');
    setCurrentPage(1);

    setStartDate(null);
    setEndDate(null);
    setActionStateFilter('todos');
  };

  const formatDateForApi = (date: Date | null): string | null => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd');
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    // No estamos buscando cuando aplicamos filtros de fecha
    setIsSearching(false);
    setCurrentPage(1);
  };

  const handleRiskFilterToggle = (riskType: string) => {
    switch (riskType) {
      case 'fx':
        setFxRiskFilter(prev => prev === null ? 1 : prev === 1 ? 0 : null);
        break;
      case 'sob':
        setSobRiskFilter(prev => prev === null ? 1 : prev === 1 ? 0 : null);
        break;
      case 'credito':
        setCreditoRiskFilter(prev => prev === null ? 1 : prev === 1 ? 0 : null);
        break;
      case 'tasa':
        setTasaRiskFilter(prev => prev === null ? 1 : prev === 1 ? 0 : null);
        break;
      case 'equity':
        setEquityRiskFilter(prev => prev === null ? 1 : prev === 1 ? 0 : null);
        break;
    }
    // No estamos buscando cuando aplicamos filtros de riesgo
    setIsSearching(false);
    setCurrentPage(1);
  };

  // Función para manejar la eliminación de un filtro específico
  const handleRemoveFilter = (id: string, type: string) => {
    switch (type) {
      case 'filterStatus':
        setFilterStatus('todos');
        break;
      case 'actionStateFilter':
        setActionStateFilter('todos');
        break;
      case 'dateRange':
        setStartDate(null);
        setEndDate(null);
        break;
      case 'fxRiskFilter':
        setFxRiskFilter(null);
        break;
      case 'sobRiskFilter':
        setSobRiskFilter(null);
        break;
      case 'creditoRiskFilter':
        setCreditoRiskFilter(null);
        break;
      case 'tasaRiskFilter':
        setTasaRiskFilter(null);
        break;
      case 'equityRiskFilter':
        setEquityRiskFilter(null);
        break;
      case 'searchTerm':
        setSearchTerm('');
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };


  // Construir la lista de filtros activos para el componente
  const buildActiveFilters = (): FilterItem[] => {
    const activeFilters: FilterItem[] = [];

    // Filtro de estado de cliente
    if (filterStatus !== 'todos') {
      activeFilters.push({
        id: filterStatus,
        type: 'filterStatus',
        label: filterStatus === 'activos' ? 'Clientes activos' : 'Clientes inactivos'
      });
    }

    // Filtro de estado de acción
    if (actionStateFilter !== 'todos') {
      let label = '';
      switch (actionStateFilter) {
        case 'abierto':
          label = 'Acciones abiertas';
          break;
        case 'vencido':
          label = 'Acciones vencidas';
          break;
        case 'cerrado':
          label = 'Acciones cerradas';
          break;
      }

      activeFilters.push({
        id: actionStateFilter,
        type: 'actionStateFilter',
        label
      });
    }

    // Filtro de rango de fechas
    if (startDate || endDate) {
      const startFormatted = startDate ? format(startDate, 'dd/MM/yyyy') : 'inicio';
      const endFormatted = endDate ? format(endDate, 'dd/MM/yyyy') : 'fin';

      activeFilters.push({
        id: 'dateRange',
        type: 'dateRange',
        label: `Fecha: ${startFormatted} - ${endFormatted}`
      });
    }

    // Filtros de riesgo
    if (fxRiskFilter !== null) {
      activeFilters.push({
        id: 'fx',
        type: 'fxRiskFilter',
        label: `FX: ${fxRiskFilter === 1 ? 'Sí' : 'No'}`
      });
    }

    if (sobRiskFilter !== null) {
      activeFilters.push({
        id: 'sob',
        type: 'sobRiskFilter',
        label: `Sob: ${sobRiskFilter === 1 ? 'Sí' : 'No'}`
      });
    }

    if (creditoRiskFilter !== null) {
      activeFilters.push({
        id: 'credito',
        type: 'creditoRiskFilter',
        label: `Crédito: ${creditoRiskFilter === 1 ? 'Sí' : 'No'}`
      });
    }

    if (tasaRiskFilter !== null) {
      activeFilters.push({
        id: 'tasa',
        type: 'tasaRiskFilter',
        label: `Tasa: ${tasaRiskFilter === 1 ? 'Sí' : 'No'}`
      });
    }

    if (equityRiskFilter !== null) {
      activeFilters.push({
        id: 'equity',
        type: 'equityRiskFilter',
        label: `Equity: ${equityRiskFilter === 1 ? 'Sí' : 'No'}`
      });
    }

    // Filtro de búsqueda
    if (searchTerm) {
      activeFilters.push({
        id: 'search',
        type: 'searchTerm',
        label: `Búsqueda: "${searchTerm}"`
      });
    }

    return activeFilters;
  };

  // Modifica las columnas de riesgo para manejar valores numéricos en lugar de strings
  const riskColumns = [
    {
      label: (
        <div className={styles.sortableHeader}>
          FX
          <IconButton size="small" onClick={() => handleRiskFilterToggle('fx')}>
            {fxRiskFilter === 1 ? <CheckBoxIcon fontSize="small" color="primary" /> :
              fxRiskFilter === 0 ? <CheckBoxOutlineBlankIcon fontSize="small" color="error" /> :
                <IndeterminateCheckBoxIcon fontSize="small" color="action" />}
          </IconButton>
        </div>
      ),
      field: 'fx',
      render: (row: any) => (
        parseInt(row.fx) === 1
          ? <span className={`${styles.sectorPill} ${styles.colorGreen}`}>Sí</span>
          : <span className={`${styles.sectorPill} ${styles.colorRed}`}>No</span>
      )
    },
    {
      label: (
        <div className={styles.sortableHeader}>
          Sob
          <IconButton size="small" onClick={() => handleRiskFilterToggle('sob')}>
            {sobRiskFilter === 1 ? <CheckBoxIcon fontSize="small" color="primary" /> :
              sobRiskFilter === 0 ? <CheckBoxOutlineBlankIcon fontSize="small" color="error" /> :
                <IndeterminateCheckBoxIcon fontSize="small" color="action" />}
          </IconButton>
        </div>
      ),
      field: 'sob',
      render: (row: any) => (
        parseInt(row.sob) === 1
          ? <span className={`${styles.sectorPill} ${styles.colorGreen}`}>Sí</span>
          : <span className={`${styles.sectorPill} ${styles.colorRed}`}>No</span>
      )
    },
    {
      label: (
        <div className={styles.sortableHeader}>
          Credito
          <IconButton size="small" onClick={() => handleRiskFilterToggle('credito')}>
            {creditoRiskFilter === 1 ? <CheckBoxIcon fontSize="small" color="primary" /> :
              creditoRiskFilter === 0 ? <CheckBoxOutlineBlankIcon fontSize="small" color="error" /> :
                <IndeterminateCheckBoxIcon fontSize="small" color="action" />}
          </IconButton>
        </div>
      ),
      field: 'credito',
      render: (row: any) => (
        parseInt(row.credito) === 1
          ? <span className={`${styles.sectorPill} ${styles.colorGreen}`}>Sí</span>
          : <span className={`${styles.sectorPill} ${styles.colorRed}`}>No</span>
      )
    },
    {
      label: (
        <div className={styles.sortableHeader}>
          Tasa
          <IconButton size="small" onClick={() => handleRiskFilterToggle('tasa')}>
            {tasaRiskFilter === 1 ? <CheckBoxIcon fontSize="small" color="primary" /> :
              tasaRiskFilter === 0 ? <CheckBoxOutlineBlankIcon fontSize="small" color="error" /> :
                <IndeterminateCheckBoxIcon fontSize="small" color="action" />}
          </IconButton>
        </div>
      ),
      field: 'tasa',
      render: (row: any) => (
        parseInt(row.tasa) === 1
          ? <span className={`${styles.sectorPill} ${styles.colorGreen}`}>Sí</span>
          : <span className={`${styles.sectorPill} ${styles.colorRed}`}>No</span>
      )
    },
    {
      label: (
        <div className={styles.sortableHeader}>
          Equity
          <IconButton size="small" onClick={() => handleRiskFilterToggle('equity')}>
            {equityRiskFilter === 1 ? <CheckBoxIcon fontSize="small" color="primary" /> :
              equityRiskFilter === 0 ? <CheckBoxOutlineBlankIcon fontSize="small" color="error" /> :
                <IndeterminateCheckBoxIcon fontSize="small" color="action" />}
          </IconButton>
        </div>
      ),
      field: 'equity',
      render: (row: any) => (
        parseInt(row.equity) === 1
          ? <span className={`${styles.sectorPill} ${styles.colorGreen}`}>Sí</span>
          : <span className={`${styles.sectorPill} ${styles.colorRed}`}>No</span>
      )
    }
  ];

  const renderActionState = (row: any) => {
    if (!row.estadoAccion) return <span>-</span>;

    switch (row.estadoAccion.toLowerCase()) {
      case 'vencido':
        return <span className={`${styles.sectorPill} ${styles.colorPendingVencido }`}>Vencido</span>;
      case 'cerrado':
        return <span className={`${styles.sectorPill} ${styles.colorPendingCerrado }`}>Cerrado</span>;
      case 'abierto':
        return <span className={`${styles.sectorPill} ${styles.colorPendingAbierto }`}>Abierto</span>;
      default:
        return <span>{row.estadoAccion}</span>;
    }
  };

  const clientColumns: Array<{
    label: string | React.ReactNode;
    field: string;
    render?: (row: any) => React.ReactNode;
  }> = [
      {
        label: (
          <div className={styles.sortableHeader}>
            Nombre
            <IconButton size="small" onClick={() => requestSort('nombre')}>
              {getSortIcon('nombre')}
            </IconButton>
          </div>
        ),
        field: 'nombre'
      },
      {
        label: (
          <div className={styles.sortableHeader}>
            Oficial
            <IconButton size="small" onClick={() => requestSort('oficial')}>
              {getSortIcon('oficial')}
            </IconButton>
          </div>
        ),
        field: 'oficial'
      },
      {
        label: (
          <div className={styles.sortableHeader}>
            Referente
            <IconButton size="small" onClick={() => requestSort('referente')}>
              {getSortIcon('referente')}
            </IconButton>
          </div>
        ),
        field: 'referente'
      },
      { label: 'Número Comitente', field: 'Numero' },
      ...riskColumns,
      {
        label: (
          <div className={styles.sortableHeader}>
            Acción Pendiente
          </div>
        ),
        field: 'estadoAccion',
        render: renderActionState
      },
      {
        label: (
          <div className={styles.sortableHeader}>
            Fecha de Vencimiento
            <IconButton size="small" onClick={() => requestSort('fechaVencimiento')}>
              {getSortIcon('fechaVencimiento')}
            </IconButton>
          </div>
        ),
        field: 'fechaVencimiento',
        render: (row: any) => row.fechaVencimiento ? format(parseISO(row.fechaVencimiento), 'dd/MM/yyyy') : '-'
      },
    ];

  // Función para obtener clientes (usando api.ts en vez de servicios)
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      //Construir los parámetros de consulta basados en los filtros
      const riskParams: any = {};
      if (fxRiskFilter !== null) riskParams.fx = fxRiskFilter;
      if (sobRiskFilter !== null) riskParams.sob = sobRiskFilter;
      if (creditoRiskFilter !== null) riskParams.credito = creditoRiskFilter;
      if (tasaRiskFilter !== null) riskParams.tasa = tasaRiskFilter;
      if (equityRiskFilter !== null) riskParams.equity = equityRiskFilter;

      // NUEVO: Añadir el filtro de estado de acción si no es 'todos'
      if (actionStateFilter !== 'todos') {
        riskParams.action_state = actionStateFilter;
      }

      // NUEVO: Añadir filtros de fecha si están establecidos
      if (startDate) {
        riskParams.start_date = formatDateForApi(startDate);
      }
      if (endDate) {
        riskParams.end_date = formatDateForApi(endDate);
      }

      // Añadir término de búsqueda si existe
      if (debouncedSearchTerm) {
        riskParams.search_term = debouncedSearchTerm;
      }

      const result = await getClients(
        currentPage,
        filterStatus,
        sortConfig.key || 'fechaVencimiento',
        sortConfig.direction || 'ascending',
        filterRisk,
        riskParams
      );

      setClients(result.data);
      setTotalPages(result.pagination.lastPage);
      setTotalItems(result.pagination.total);
    } catch (err) {
      console.error('Error al cargar clientes:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para realizar la búsqueda (usando la API optimizada)
  const handleServerSearch = async () => {
    if (!debouncedSearchTerm) {
      fetchClients();
      return;
    }

    setIsLoading(true);
    setIsSearching(true);
    setError(null);

    try {
      // Construir los parámetros de consulta basados en los filtros de riesgo
      const riskParams: any = {};
      if (fxRiskFilter !== null) riskParams.fx = fxRiskFilter;
      if (sobRiskFilter !== null) riskParams.sob = sobRiskFilter;
      if (creditoRiskFilter !== null) riskParams.credito = creditoRiskFilter;
      if (tasaRiskFilter !== null) riskParams.tasa = tasaRiskFilter;
      if (equityRiskFilter !== null) riskParams.equity = equityRiskFilter;

      // NUEVO: Añadir el filtro de estado de acción si no es 'todos'
      if (actionStateFilter !== 'todos') {
        riskParams.action_state = actionStateFilter;
      }

      // NUEVO: Añadir filtros de fecha si están establecidos
      if (startDate) {
        riskParams.start_date = formatDateForApi(startDate);
      }
      if (endDate) {
        riskParams.end_date = formatDateForApi(endDate);
      }

      // Añadir el término de búsqueda como un parámetro adicional
      riskParams.search_term = debouncedSearchTerm;

      const result = await getClients(
        currentPage,
        filterStatus,
        sortConfig.key || 'fechaVencimiento',
        sortConfig.direction || 'ascending',
        null,
        riskParams
      );

      setClients(result.data);
      setTotalPages(result.pagination.lastPage);
      setTotalItems(result.pagination.total);
    } catch (err) {
      console.error('Error al buscar clientes:', err);
      setError('Error al realizar la búsqueda. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar clientes cada vez que cambie la página, filtro de estado o configuración de ordenamiento

  useEffect(() => {
    const fetchClientsWithRiskFilters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Construir los parámetros de consulta basados en los filtros
        const riskParams: any = {};
        if (fxRiskFilter !== null) riskParams.fx = fxRiskFilter;
        if (sobRiskFilter !== null) riskParams.sob = sobRiskFilter;
        if (creditoRiskFilter !== null) riskParams.credito = creditoRiskFilter;
        if (tasaRiskFilter !== null) riskParams.tasa = tasaRiskFilter;
        if (equityRiskFilter !== null) riskParams.equity = equityRiskFilter;
        if (actionStateFilter !== 'todos') {
          riskParams.action_state = actionStateFilter;
        }
        if (startDate) {
          riskParams.start_date = formatDateForApi(startDate);
        }
        if (endDate) {
          riskParams.end_date = formatDateForApi(endDate);
        }

        // Añadir término de búsqueda si existe
        if (debouncedSearchTerm) {
          riskParams.search_term = debouncedSearchTerm;
        }

        const result = await getClients(
          currentPage,
          filterStatus,
          sortConfig.key || 'fechaVencimiento',
          sortConfig.direction || 'ascending',
          null,
          riskParams
        );

        setClients(result.data);
        setTotalPages(result.pagination.lastPage);
        setTotalItems(result.pagination.total);

        // Resetear isSearching si estaba activo
        if (isSearching) {
          setIsSearching(false);
        }
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientsWithRiskFilters();
  }, [
    currentPage,
    filterStatus,
    sortConfig,
    fxRiskFilter,
    sobRiskFilter,
    creditoRiskFilter,
    tasaRiskFilter,
    equityRiskFilter,
    actionStateFilter,
    startDate,
    endDate,
    debouncedSearchTerm // Añadir el término de búsqueda debounced como dependencia
  ]);

  // Cargar los riesgos disponibles al montar el componente
  useEffect(() => {
    const loadRisks = async () => {
      try {
        const risks = await clientesService.getAllRisks();
        const transformedRisks = risks.map(risk => ({
          id: risk.id.toString(),
          name: risk.description || risk.description || 'Riesgo sin nombre'
        }));
        setAvailableRisks(transformedRisks);
      } catch (error) {
        console.error('Error al cargar los riesgos:', error);
      }
    };

    loadRisks();
  }, []);

  const toggleSortByDueDate = () => {
    setSortByDueDate(prev => (prev === 'ascending' ? 'descending' : 'ascending'));
  };

  // Función para manejar cambios en el input de búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    // Si hay una búsqueda nueva y ya existen filtros aplicados, eliminarlos
    if (newSearchTerm && (
      filterStatus !== 'todos' ||
      actionStateFilter !== 'todos' ||
      startDate ||
      endDate ||
      fxRiskFilter !== null ||
      sobRiskFilter !== null ||
      creditoRiskFilter !== null ||
      tasaRiskFilter !== null ||
      equityRiskFilter !== null
    )) {
      setFilterStatus('todos');
      setActionStateFilter('todos');
      setStartDate(null);
      setEndDate(null);
      setFxRiskFilter(null);
      setSobRiskFilter(null);
      setCreditoRiskFilter(null);
      setTasaRiskFilter(null);
      setEquityRiskFilter(null);
    }

    setIsSearching(true);
  };

  // Función para manejar el evento de Enter en el buscador
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleServerSearch();
    }
  };

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Si hay un término de búsqueda activo, realizar la búsqueda con la nueva página
    if (debouncedSearchTerm) {
      handleServerSearch();
      setFilterStatus('todos');
      setActionStateFilter('todos');
      setStartDate(null);
      setEndDate(null);
      setFxRiskFilter(null);
      setSobRiskFilter(null);
      setCreditoRiskFilter(null);
      setTasaRiskFilter(null);
      setEquityRiskFilter(null);
    }
  };

  // Se agrega el botón "Ver" para cada fila que redirige al detalle del cliente
  const clientsWithActions = clients.map(client => ({
    ...client,
    acciones: (
      <IconButton
        size="small"
        onClick={() => navigate(`/crm/clients/details/${client.Numero}`)}
        title="Ver detalles"
        sx={{ color: '#0094FF', padding: '4px' }}
      >
        <img src="/edit.png" alt="Editar" style={{ width: '22px', height: '22px' }} />
      </IconButton>
    )
  }));

  // Columnas con acciones
  const columnsWithActions: Array<{
    label: string | React.ReactNode;
    field: string;
    render?: (row: any) => React.ReactNode;
  }> = [
      ...clientColumns,
      { label: 'Acciones', field: 'acciones' }
    ];

  return (
    <div className={styles.desktop64}>
      <Navbar />
      <main className={styles.headervariant3Parent}>
        <Header />
        <section className={styles.frameWrapper}>
          <div className={styles.frameGroup}>
            {/* Título, filtros y búsqueda */}
            <div className={styles.crmEscoParent}>
              <Typography className={styles.crmEsco} variant="h1" component="h1">
                Clientes
              </Typography>
              <div className={styles.inputDropdownMenuItemParent}>
                <FilterDropdown
                  options={filterNestedOptions}
                  onFilterSelect={handleNestedFilterSelect}
                  buttonText="Filtrar por"
                  width="200px"
                  key={`filter-dropdown-${filterStatus}-${actionStateFilter}`}
                />
                <ImprovedDateRangePicker
                  onDateRangeChange={handleDateRangeChange}
                  buttonLabel="Filtrar por fecha"
                  initialStartDate={startDate}
                  initialEndDate={endDate}
                />
                <TextField
                  className={styles.search}
                  placeholder="Buscar"
                  variant="outlined"
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyPress={handleKeyPress}
                  sx={{
                    '& fieldset': { borderColor: '#e7e7e7' },
                    '& .MuiInputBase-root': {
                      height: '44px',
                      backgroundColor: '#fefefe',
                      borderRadius: '8px',
                    },
                    '& .MuiInputBase-input': {
                      paddingLeft: '8px',
                      color: '#777',
                    },
                    width: '320px',
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={clearAllFilters}
                  sx={{
                    height: '44px',
                    borderColor: '#e7e7e7',
                    color: '#777',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#c7c7c7',
                      backgroundColor: '#f9f9f9',
                    }
                  }}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
            <div className={styles.tableHeaderTabsParent}>
              <div className={styles.tableHeaderTabs}>
                <Typography className={styles.contactosActivos} variant="h2" component="h2">
                  Lista de Clientes
                </Typography>

                {/* Componente de Filtros Activos (versión limpia, sin título ni fondo) */}
                <ActiveFilterChips
                  filters={buildActiveFilters()}
                  onRemoveFilter={handleRemoveFilter}
                />

                {error && <div className={styles.errorMessage}>{error}</div>}
                {isLoading ? (
                  <div className={styles.loadingIndicator}>Cargando...</div>
                ) : (
                  <Table
                    columns={columnsWithActions as any}
                    data={clientsWithActions}
                  />
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Paginación */}
        <div className={styles.footer}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </main>
    </div>
  );
};

export default ClientsDashboard;