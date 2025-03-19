import React, { useEffect, useState } from 'react';
import styles from './Clients.module.css';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navigation/Navbar/Navbar';
import Table from '../../components/Table/Table';
import FilterDropdown, { FilterOption } from '../../components/FilterDropdown/FilterDropdown';
import Pagination from '../../components/Pagination/Pagination';
import { Typography, TextField, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getClients, searchClients } from '../../api/api';
import { clientesService } from '../../services/clientesService';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapVertIcon from '@mui/icons-material/SwapVert';

// Interfaz actualizada para incluir riesgos y fecha de vencimiento
interface ClientDashboard {
  id: string;
  nombre: string;
  oficial: string;
  referente: string;
  Numero: string;
  risks: Array<{ id: string; name: string }>; // Array de riesgos
  fechaVencimiento: string | null; // Fecha de vencimiento
  cuit?: string;
  mail?: string;
  sector?: string;
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

  // Función para renderizar los riesgos (máximo 5)
  const renderRisks = (risks: Array<{ id: string; name: string }>) => {
    if (!risks || risks.length === 0) return '-';

    const displayedRisks = risks.slice(0, 5);
    return (
      <div className={styles.riskContainer}>
        {displayedRisks.map((risk, index) => (
          <span key={index} className={styles.riskTag}>
            {risk.name || 'Riesgo'}
          </span>
        ))}
        {risks.length > 5 && <span className={styles.moreRisks}>+{risks.length - 5}</span>}
      </div>
    );
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

  // Columnas actualizadas para la tabla (quitado 'activo', agregado 'risks' y 'fechaVencimiento')
  const clientColumns: Array<{
    label: string | React.ReactNode;
    field: string;
    render?: (row: any) => React.ReactNode;
  }> = [
      { label: 'Nombre', field: 'nombre' },
      { label: 'Oficial', field: 'oficial' },
      { label: 'Referente', field: 'referente' },
      { label: 'Número Comitente', field: 'Numero' },
      {
        label: 'Riesgos',
        field: 'risks',
        render: (row: ClientDashboard) => renderRisks(row.risks)
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
      },
    ];

  // Opciones para el filtro de estado
  const statusFilterOptions: FilterOption[] = [
    { id: 'todos', name: 'Todos', icon: '/next-icon.svg' },
    { id: 'activos', name: 'Activos', icon: '/next-icon.svg' },
    { id: 'inactivos', name: 'Inactivos', icon: '/next-icon.svg' },
  ];

  // Función para obtener clientes (usando api.ts en vez de servicios)
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Usamos la función optimizada de getClients que hace una sola petición
      const result = await getClients(
        currentPage,
        filterStatus,
        sortConfig.key || 'fechaVencimiento',
        sortConfig.direction || 'ascending',
        filterRisk
      );

      // Los datos ya vienen transformados de la API, no necesitamos procesarlos más
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
      // Usamos la función optimizada de searchClients que hace una sola petición
      const result = await searchClients(
        debouncedSearchTerm,
        currentPage,
        filterStatus,
        filterRisk,
        sortConfig.key,
        sortConfig.direction
      );

      // Los datos ya vienen transformados de la API, no necesitamos procesarlos más
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
    if (!isSearching) {
      fetchClients();
    }
  }, [currentPage, filterStatus, filterRisk, sortConfig]);

  // Efecto para buscar cuando cambia el término de búsqueda debounced
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleServerSearch();
    } else if (isSearching) {
      setIsSearching(false);
      fetchClients();
    }
  }, [currentPage, filterStatus, filterRisk, sortConfig.key, sortConfig.direction, debouncedSearchTerm]);

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
    setSearchTerm(event.target.value);
  };

  // Función para manejar el evento de Enter en el buscador
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleServerSearch();
    }
  };

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    // Quitar esta línea: setSearchTerm('');
    setCurrentPage(page);

    // Si hay un término de búsqueda activo, realizar la búsqueda con la nueva página
    if (debouncedSearchTerm) {
      handleServerSearch();
    }
  };

  // Función para manejar la selección de filtro de estado
  const handleFilterStatusSelect = (selected: string) => {
    setFilterStatus(selected as 'todos' | 'activos' | 'inactivos');
    setCurrentPage(1);
  };

  // Función para manejar la selección de filtro de riesgo
  const handleFilterRiskSelect = (selected: string) => {
    setFilterRisk(selected === 'null' ? null : selected);
    setCurrentPage(1);
  };

  // Se agrega el botón "Ver" para cada fila que redirige al detalle del cliente
  const clientsWithActions = clients.map(client => ({
    ...client,
    acciones: (
      <Button
        variant="outlined"
        onClick={() => navigate(`/crm/clients/details/${client.Numero}`)}
      >
        Ver
      </Button>
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
                  options={statusFilterOptions}
                  onFilterSelect={handleFilterStatusSelect}
                  buttonText="Estado"
                  width="150px"
                />
                {availableRisks.length > 0 && (
                  <FilterDropdown
                    options={[
                      { id: 'null', name: 'Sin filtro de riesgo', icon: '/next-icon.svg' },
                      ...availableRisks.map(risk => ({
                        id: risk.id,
                        name: risk.name,
                        icon: '/next-icon.svg'
                      }))
                    ]}
                    onFilterSelect={handleFilterRiskSelect}
                    buttonText="Riesgo"
                    width="200px"
                  />
                )}
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
              </div>
            </div>

            {/* Tabla de Clientes */}
            <div className={styles.tableHeaderTabsParent}>
              <div className={styles.tableHeaderTabs}>
                <Typography className={styles.contactosActivos} variant="h2" component="h2">
                  Lista de Clientes
                </Typography>
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