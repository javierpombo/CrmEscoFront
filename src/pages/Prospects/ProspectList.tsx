import React, { useEffect, useState } from 'react';
import { Typography, TextField, IconButton } from '@mui/material';
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

// Servicios y tipos
import { prospectoService } from '../../api/api';
import { Prospecto, AccionType } from '../../types/Prospecto';

// Estilos
import styles from './ProspectList.module.css';

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
  const [filteredProspectos, setFilteredProspectos] = useState<Prospecto[]>([]);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'ascending' | 'descending' | null;
  }>({ key: null, direction: null });
  const [isSearching, setIsSearching] = useState(false);

  const navigate = useNavigate();

  // Aplicar debounce al término de búsqueda
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Opciones para el filtro de estado
  const statusFilterOptions: FilterOption[] = [
    { id: 'todos', name: 'Todos', icon: '/next-icon.svg' },
    { id: 'activos', name: 'Activos', icon: '/next-icon.svg' },
    { id: 'inactivos', name: 'Inactivos', icon: '/next-icon.svg' },
  ];

  // Función para renderizar solo el nombre del usuario
  const renderUserData = (user: any) => {
    return user ? user.name : '-';
  };

  // Función para obtener prospectos
  const fetchProspectos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await prospectoService.getProspectos(
        currentPage,
        filterStatus,
        sortConfig.key,
        sortConfig.direction
      );
      setProspectos(result.data);
      setFilteredProspectos(result.data);
      setTotalPages(result.pagination.lastPage);
      setTotalItems(result.pagination.total);
    } catch (err) {
      console.error('Error al cargar prospectos:', err);
      setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar prospectos cada vez que cambie la página o el filtro de estado
  useEffect(() => {
    if (!isSearching) {
      fetchProspectos();
    }
  }, [currentPage, filterStatus, sortConfig]);

  // Función para realizar la búsqueda (usando la API)
  const handleServerSearch = async () => {
    if (!debouncedSearchTerm) {
      fetchProspectos();
      return;
    }

    setIsLoading(true);
    setIsSearching(true);
    setError(null);

    try {
      // CAMBIO IMPORTANTE: Pasar filterStatus como tercer parámetro
      const result = await prospectoService.searchProspectos(
        debouncedSearchTerm,
        currentPage,
        filterStatus,
        sortConfig.key,
        sortConfig.direction
      );
      setProspectos(result.data);
      setTotalPages(result.pagination.lastPage);
      setTotalItems(result.pagination.total);
    } catch (err) {
      console.error('Error al buscar prospectos:', err);
      setError('Error al realizar la búsqueda. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para buscar cuando cambia el término de búsqueda debounced
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleServerSearch();
    } else if (isSearching) {
      setIsSearching(false);
      fetchProspectos();
    }
  }, [debouncedSearchTerm, sortConfig]);

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

    // Cuando cambia el ordenamiento, volver a cargar los datos
    if (isSearching && debouncedSearchTerm) {
      handleServerSearch();
    } else {
      fetchProspectos();
    }
  };

  // Aplicar ordenamiento a los datos
  const sortedData = React.useMemo(() => {
    let sortableItems = [...prospectos];
    if (sortConfig.key && sortConfig.direction) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Prospecto];
        const bValue = b[sortConfig.key as keyof Prospecto];

        // Para fechas, realizar comparación especial
        if (sortConfig.key === 'fechaVencimiento' || sortConfig.key === 'ultimoContacto') {
          const dateA = aValue ? new Date(aValue as string).getTime() : 0;
          const dateB = bValue ? new Date(bValue as string).getTime() : 0;

          if (sortConfig.direction === 'ascending') {
            return dateA - dateB;
          } else {
            return dateB - dateA;
          }
        }

        // Para otros campos
        if (aValue === bValue) return 0;
        if (sortConfig.direction === 'ascending') {
          return aValue < bValue ? -1 : 1;
        } else {
          return aValue > bValue ? -1 : 1;
        }
      });
    }
    return sortableItems;
  }, [prospectos, sortConfig]);

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
    { label: 'Último Contacto', field: 'ultimoContacto' },
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
        // Buscar acción vencida más antigua
        if (row.actions && row.actions.length > 0) {
          const vencidaAction = findOldestVencidaAction(row.actions);

          if (vencidaAction && vencidaAction.next_contact) {
            const [year, month, day] = vencidaAction.next_contact.split('T')[0].split('-');
            const formattedDate = `${day}/${month}/${year}`;

            return formattedDate;
          } else {
            // Si no hay acción vencida, mostrar la última acción (más reciente)
            const lastAction = row.actions[0];
            if (lastAction && lastAction.next_contact) {
              const [year, month, day] = lastAction.next_contact.split('T')[0].split('-');
              const dueDate = new Date(Number(year), Number(month) - 1, Number(day)); // Local date sin timezone

              const today = new Date();
              const isOverdue = dueDate < today;
              const dateClassName = isOverdue ? styles.colorRed : '';

              const formattedDate = `${day}/${month}/${year}`;

              return formattedDate;
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
          // Buscar acción vencida más antigua
          const vencidaAction = findOldestVencidaAction(row.actions);

          if (vencidaAction) {
            // Si hay acción vencida, mostrarla
            return (
              <span className={`${styles.sectorPill} ${styles.colorRed}`} title={vencidaAction.description || ''}>
                Vencido
              </span>
            );
          }
          const lastAction = row.actions[0];

          if (lastAction.status) {
            let statusClass;
            let statusText;
            const status = String(lastAction.status);

            switch (status) {
              case 'abierto':
                statusClass = styles.colorOrange;
                statusText = 'Abierto';
                break;
              case 'cerrado':
                statusClass = styles.colorGreen;
                statusText = 'Cerrado';
                break;
              default:
                statusClass = styles.colorGray;
                statusText = status.charAt(0).toUpperCase() + status.slice(1);
            }
            return (
              <span className={`${styles.sectorPill} ${statusClass}`} title={lastAction.description || ''}>
                {statusText}
              </span>
            );
          }
          return <span className={`${styles.sectorPill} ${styles.colorOrange}`}>Pendiente</span>;
        }
        return <span className={`${styles.sectorPill} ${styles.colorRed}`}>Sin Acción</span>;
      }
    }
  ];

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (debouncedSearchTerm) {
      handleServerSearch();
    }
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
          const refreshResult = await prospectoService.getProspectos(pageToLoad, filterStatus);
          setProspectos(refreshResult.data);
          setTotalPages(refreshResult.pagination.lastPage);
          setTotalItems(refreshResult.pagination.total);
          setCurrentPage(pageToLoad);
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
        const refreshResult = await prospectoService.getProspectos(1, filterStatus);
        setProspectos(refreshResult.data);
        setTotalPages(refreshResult.pagination.lastPage);
        setTotalItems(refreshResult.pagination.total);
        setCurrentPage(1);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error al crear prospecto:', error);
    }
  };


  const dataWithActions = prospectos.map(prospecto => {
    const isClient = prospecto.is_client === true || prospecto.is_client === 1 || prospecto.yaEsCliente === true;

    return {
      ...prospecto,
      rowClassName: isClient ? styles.clientRow : '',
      acciones: (
        <div className={styles.actionButtons}>
          <button className={styles.viewButton} onClick={() => handleViewProspect(prospecto.id || '')}>
            Ver
          </button>
          <button className={styles.deleteButton} onClick={() => handleDeleteProspect(prospecto.id || '')}>
            Eliminar
          </button>
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
                  options={statusFilterOptions}
                  onFilterSelect={(selected) => {
                    setFilterStatus(selected as 'todos' | 'activos' | 'inactivos');
                    setCurrentPage(1);
                  }}
                  buttonText="Estado"
                  width="150px"
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