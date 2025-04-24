import React, { useEffect, useState } from 'react';
import { Typography, TextField, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Importaciones de componentes
import Navbar from '../../components/Navigation/Navbar/Navbar';
import Header from '../../components/Header/Header';
import FilterDropdown, { FilterOption } from '../../components/FilterDropdown/FilterDropdown';
import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/Pagination';
import ButtonBasemddefault from '../../components/ButtonBasemddefault/ButtonBasemddefault';
import { Modal } from '../../components/Modals/Modal';
import { ProspectForm } from '../../components/Forms/ProspectForm/ProspectForm';
import ImprovedDateRangePicker from './../../components/ImprovedDateRangePicker/ImprovedDateRangePicker';
import ActiveFilterChips, { FilterItem } from './../../components/ActiveFilterChips/ActiveFilterChips';

// Servicios y tipos
import { prospectoService } from '../../api/api';
import { Prospecto, AccionType } from '../../types/Prospecto';

// Estilos
import styles from './ProspectList.module.css';
import { format, parseISO } from 'date-fns';

// Función de debounce para optimizar búsquedas
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

const ProspectList: React.FC = () => {
  // Estados de datos y paginación
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros simplificados
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [actionStateFilter, setActionStateFilter] = useState<'todos' | 'vencido' | 'cerrado' | 'abierto'>('todos');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending' | null;
  }>({ key: null, direction: null });
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  // Aplicar debounce al término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Opciones para los filtros anidados
  const filterNestedOptions: FilterOption[] = [
    {
      id: 'prospects',
      name: 'Prospectos',
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

  // Manejador para los filtros anidados
  // Manejador para los filtros anidados
  const handleNestedFilterSelect = (filterId: string, parentId?: string) => {
    if (parentId === 'prospects') {
      setFilterStatus(filterId as 'todos' | 'activos' | 'inactivos');
    } else if (parentId === 'actions') {
      setActionStateFilter(filterId as 'todos' | 'vencido' | 'cerrado' | 'abierto');
    }
    // No estamos buscando cuando aplicamos filtros
    setIsSearching(false);
    setCurrentPage(1);
  };

  // Función para manejar cambio de rango de fechas
  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    // No estamos buscando cuando aplicamos filtros de fecha
    setIsSearching(false);
    setCurrentPage(1);
  };

  // Función para formatear fechas para la API
  const formatDateForApi = (date: Date | null): string | null => {
    if (!date) return null;
    return format(date, 'yyyy-MM-dd');
  };

  // Función para renderizar solo el nombre del usuario
  const renderUserData = (user: any) => {
    return user ? user.name : '-';
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setFilterStatus('todos');
    setActionStateFilter('todos');
    setStartDate(null);
    setEndDate(null);
    setSearchTerm('');
    setCurrentPage(1);
    setSortConfig({ key: null, direction: null });
  };

  // Función para construir los filtros activos
  const buildActiveFilters = (): FilterItem[] => {
    const activeFilters: FilterItem[] = [];

    // Filtro de estado de prospecto
    if (filterStatus !== 'todos') {
      activeFilters.push({
        id: filterStatus,
        type: 'filterStatus',
        label: filterStatus === 'activos' ? 'Prospectos activos' : 'Prospectos inactivos'
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

  // Función para eliminar un filtro específico
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
      case 'searchTerm':
        setSearchTerm('');
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Función para obtener prospectos con todos los filtros
  const fetchProspectos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Crear objeto de filtros para enviar a la API
      const filters: any = {
        status: filterStatus,
        action_state: actionStateFilter !== 'todos' ? actionStateFilter : null
      };

      // Añadir filtros de fecha si están establecidos
      if (startDate) {
        filters.start_date = formatDateForApi(startDate);
      }
      if (endDate) {
        filters.end_date = formatDateForApi(endDate);
      }

      // Añadir término de búsqueda si existe
      if (debouncedSearchTerm) {
        filters.search_term = debouncedSearchTerm;
      }

      // Actualizar la llamada al servicio para incluir los nuevos filtros
      const result = await prospectoService.getProspectos(
        currentPage,
        filterStatus,
        sortConfig.key,
        sortConfig.direction,
        filters // Pasar todos los filtros agregados
      );

      setProspectos(result.data);
      setTotalPages(result.pagination.lastPage);
      setTotalItems(result.pagination.total);
    } catch (err) {
      console.error('Error al cargar prospectos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar prospectos cada vez que cambie algún filtro, página o ordenamiento
  useEffect(() => {
    if (!isSearching) {
      fetchProspectos();
    }
  }, [
    currentPage,
    filterStatus,
    actionStateFilter,
    startDate,
    endDate,
    sortConfig,
    debouncedSearchTerm
  ]);

  // Efecto para buscar cuando cambia el término de búsqueda debounced
  useEffect(() => {
    // Eliminar la condición que verifica isSearching
    fetchProspectos();

    // Si estábamos en modo búsqueda, desactivarlo después de cargar los datos
    if (isSearching) {
      setIsSearching(false);
    }
  }, [
    currentPage,
    filterStatus,
    actionStateFilter,
    startDate,
    endDate,
    sortConfig,
    debouncedSearchTerm
  ]);

  // Función para manejar cambios en el input de búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);

    // Si hay una búsqueda nueva y ya existen filtros aplicados, eliminarlos
    if (newSearchTerm && (filterStatus !== 'todos' || actionStateFilter !== 'todos' || startDate || endDate)) {
      setFilterStatus('todos');
      setActionStateFilter('todos');
      setStartDate(null);
      setEndDate(null);
    }

    setIsSearching(true);
  };

  // Función para manejar el evento de Enter en el buscador
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      fetchProspectos();
    }
  };

  // Función para manejar el ordenamiento
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

  // Renderizar ícono de ordenamiento
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

  const findOldestVencidaAction = (actions: AccionType[]): AccionType | null => {
    if (!actions || actions.length === 0) return null;

    // Filtrar solo acciones con status "vencido"
    const vencidas = actions.filter(action => String(action.status) === 'vencido');

    if (vencidas.length === 0) return null;

    // Si hay una sola acción vencida, devolverla directamente
    if (vencidas.length === 1) return vencidas[0];

    // Si hay múltiples, ordenar por fecha (más antigua primero)
    return vencidas.sort((a, b) => {
      const dateA = a.next_contact ? new Date(a.next_contact).getTime() : 0;
      const dateB = b.next_contact ? new Date(b.next_contact).getTime() : 0;
      return dateA - dateB; // Orden ascendente
    })[0];
  };

  // Definición de columnas para la tabla
  const prospectColumns = [
    {
      label: (
        <div className={styles.sortableHeader}>
          Nombre
          <IconButton size="small" onClick={() => requestSort('nombreCliente')}>
            {getSortIcon('nombreCliente')}
          </IconButton>
        </div>
      ),
      field: 'nombreCliente'
    },
    {
      label: (
        <div className={styles.sortableHeader}>
          Contacto en el cliente
          <IconButton size="small" onClick={() => requestSort('contacto')}>
            {getSortIcon('contacto')}
          </IconButton>
        </div>
      ),
      field: 'contacto'
    },
    {
      label: (
        <div className={styles.sortableHeader}>
          Cargo del contacto
          <IconButton size="small" onClick={() => requestSort('cargo_contacto')}>
            {getSortIcon('cargo_contacto')}
          </IconButton>
        </div>
      ),
      field: 'cargo_contacto'
    },
    {
      label: (
        <div className={styles.sortableHeader}>
          Oficial
          <IconButton size="small" onClick={() => requestSort('officialUser')}>
            {getSortIcon('officialUser')}
          </IconButton>
        </div>
      ),
      field: 'officialUser',
      render: (row: Prospecto) => renderUserData(row.officialUser)
    },
    {
      label: (
        <div className={styles.sortableHeader}>
          Referente
          <IconButton size="small" onClick={() => requestSort('referentUser')}>
            {getSortIcon('referentUser')}
          </IconButton>
        </div>
      ),
      field: 'Referente',
      render: (row: Prospecto) => renderUserData(row.referentUser)
    },
    {
      label: 'Último Contacto',
      field: 'ultimoContacto',
      render: (row: Prospecto) => {
        if (!row.ultimoContacto) return '-';
        try {
          return format(parseISO(row.ultimoContacto), 'dd/MM/yyyy');
        } catch (e) {
          return row.ultimoContacto;
        }
      }
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
      render: (row: Prospecto) => {
        if (row.actions && row.actions.length > 0) {
          const action = row.actions[0]; // Tomamos la única acción disponible

          if (action && action.next_contact) {
            try {
              return format(parseISO(action.next_contact), 'dd/MM/yyyy');
            } catch (e) {
              // Fallback en caso de error al parsear
              const [year, month, day] = action.next_contact.split('T')[0].split('-');
              return `${day}/${month}/${year}`;
            }
          }
        }
        return '-';
      }
    },
    {
      label: 'Acción Pendiente',
      field: 'tipoAccion',
      render: (row: Prospecto) => {
        if (row.actions && row.actions.length > 0) {
          const vencidaAction = findOldestVencidaAction(row.actions);
          if (vencidaAction) {
            return (
              <span
                className={`${styles.sectorPill} ${styles.colorPendingVencido}`}
                title={vencidaAction.description || ''}
              >
                Vencido
              </span>
            );
          }

          const lastAction = row.actions[0];
          const status = String(lastAction.status).toLowerCase();
          let statusClass = styles.colorGray;
          let statusText = status.charAt(0).toUpperCase() + status.slice(1);

          if (status === 'abierto') {
            statusClass = styles.colorPendingAbierto;
          } else if (status === 'cerrado') {
            statusClass = styles.colorPendingCerrado;
          }

          return (
            <span
              className={`${styles.sectorPill} ${statusClass}`}
              title={lastAction.description || ''}
            >
              {statusText}
            </span>
          );
        }

        // sin ninguna acción
        return (
          <span className={`${styles.sectorPill} ${styles.colorGray}`}>
            Sin Acción
          </span>
        );
      },
    }

  ];

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Función para ver detalle de prospecto
  const handleViewProspect = (id: string) => {
    console.log(`Navegando a detalles del prospecto ${id}`);
    navigate(`detalle/${id}`);
  };

  // Función para eliminar prospecto
  const handleDeleteProspect = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este prospecto?')) {
      try {
        const success = await prospectoService.deleteProspecto(id);
        if (success) {
          const pageToLoad = currentPage > 1 && prospectos.length === 1 ? currentPage - 1 : currentPage;
          fetchProspectos();
        }
      } catch (error) {
        console.error('Error al eliminar prospecto:', error);
      }
    }
  };

  // Función para crear prospecto
  const handleCreateProspect = async (data: Omit<Prospecto, 'id'>) => {
    try {
      const newData = { ...data };
      delete (newData as any).id;
      const result = await prospectoService.createProspecto(newData);
      if (result) {
        setCurrentPage(1);
        fetchProspectos();
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error al crear prospecto:', error);
    }
  };

  // Agregar filtro de clientes y acciones a la tabla
  const dataWithActions = prospectos.map(prospecto => {
    const isClient = prospecto.is_client === true || prospecto.is_client === 1 || prospecto.yaEsCliente === true;

    return {
      ...prospecto,
      rowClassName: isClient ? styles.clientRow : '',
      acciones: (
        <div className={styles.actionButtons}>
          <IconButton
            size="small"
            onClick={() => handleViewProspect(prospecto.id || '')}
            title="Ver detalles"
            sx={{ color: '#0094FF', padding: '4px' }}
          >
            <img src="/edit.png" alt="Editar" style={{ width: '22px', height: '22px' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeleteProspect(prospecto.id || '')}
            title="Eliminar"
            sx={{ color: '#0094FF', padding: '4px' }}
          >
            <img src="/delete.png" alt="Eliminar" style={{ width: '22px', height: '22px' }} />
          </IconButton>
          {isClient && (
            <span title="Este prospecto ya es cliente">
              <CheckCircleIcon style={{ color: '#4CAF50', fontSize: '20px', marginLeft: '8px' }} />
            </span>
          )}
        </div>
      )
    };
  });

  const columnsWithActions = [
    ...prospectColumns,
    { label: 'Acciones', field: 'acciones' }
  ];

  return (
    <div className={styles.desktop64}>
      <Navbar />
      <main className={styles.headervariant3Parent}>
        <Header />
        <section className={styles.frameWrapper}>
          <div className={styles.frameGroup}>
            <div className={styles.crmEscoParent}>
              <Typography className={styles.crmEsco} variant="h1" component="h1">
                Prospectos
              </Typography>
              <div className={styles.inputDropdownMenuItemParent}>
                <ButtonBasemddefault
                  showButtonBasemddefault
                  text="Nuevo"
                  onClick={() => setIsModalOpen(true)}
                />
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
              </div>
            </div>
            <div className={styles.tableHeaderTabsParent}>
              <div className={styles.tableHeaderTabs}>
                <Typography className={styles.contactosActivos} variant="h2" component="h2">
                  Lista de Prospectos
                </Typography>

                <ActiveFilterChips
                  filters={buildActiveFilters()}
                  onRemoveFilter={handleRemoveFilter}
                />
                {error && <div className={styles.errorMessage}>{error}</div>}
                {isLoading ? (
                  <div className={styles.loadingIndicator}>Cargando...</div>
                ) : (
                  <Table data={dataWithActions} columns={columnsWithActions as any} />
                )}
              </div>
            </div>
          </div>
        </section>
        <div className={styles.footer}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nuevo Prospecto">
          <ProspectForm onSubmit={handleCreateProspect} onCancel={() => setIsModalOpen(false)} />
        </Modal>
      </main>
    </div>
  );
};

export default ProspectList;