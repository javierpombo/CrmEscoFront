import React, { useEffect, useState } from 'react';
import { Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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
import { Prospecto } from '../../types/Prospecto';

// Estilos
import styles from './ProspectList.module.css';

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
  // Estado para el filtro de estado: 'todos', 'activos' o 'inactivos'
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');

  const navigate = useNavigate();

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

  // Cargar prospectos cada vez que cambie la página o el filtro de estado
  useEffect(() => {
    const fetchProspectos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await prospectoService.getProspectos(currentPage, filterStatus);
        // Guarda la data original y la data que se muestra
        setProspectos(result.data);
        setFilteredProspectos(result.data);
        setTotalPages(result.pagination.lastPage);
        setTotalItems(result.pagination.total);
        if (result.pagination.currentPage !== currentPage) {
          setCurrentPage(result.pagination.currentPage);
        }
      } catch (err) {
        console.error('Error al cargar prospectos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProspectos();
  }, [currentPage, filterStatus]);


  // Definición de columnas para la tabla
  const prospectColumns = [
    { label: 'Nombre', field: 'nombreCliente' },
    { label: 'Contacto en el cliente', field: 'contacto' },
    { label: 'Tipo Cliente', field: 'tipoCliente' },
    {
      label: 'Oficial',
      field: 'officialUser',
      render: (row: Prospecto) => renderUserData(row.officialUser)
    },
    {
      label: 'Referente',
      field: 'referentUser',
      render: (row: Prospecto) => renderUserData(row.referentUser)
    },
    { label: 'Último Contacto', field: 'ultimoContacto' },
    { label: 'Fecha de Vencimiento', field: 'fechaVencimiento' },
    {
      label: 'Acción Pendiente',
      field: 'tipoAccion',
      render: (row: Prospecto) => {
        if (row.tipoAccion) {
          return <span className={`${styles.sectorPill} ${styles.colorOrange}`}>Pendiente</span>;
        }
        return <span className={`${styles.sectorPill} ${styles.colorRed}`}>Sin Acción</span>;

      }
    }
  ];

  // Función de búsqueda (si quieres mantenerla para búsquedas locales)
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
  
    if (!term) {
      // Si no hay término, se restaura la data original
      setProspectos(filteredProspectos);
    } else {
      const filtered = filteredProspectos.filter((p: Prospecto) =>
        Object.keys(p).some(key => {
          const val = (p as any)[key];
          if (val && typeof val === "object") {
            // Si es un objeto, revisamos si tiene la propiedad "name"
            return val.name && val.name.toString().toLowerCase().includes(term);
          }
          return val && val.toString().toLowerCase().includes(term);
        })
      );      
      setProspectos(filtered);
    }
  };
  
  
  

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    setSearchTerm('');
    setCurrentPage(page);
  };

  // Función para abrir el modal de creación
  const handleNewProspectClick = () => {
    setIsModalOpen(true);
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

  // Función para ver detalle de prospecto
  const handleViewProspect = (id: string) => {
    console.log(`Navegando a detalles del prospecto ${id}`);
    navigate(`detalle/${id}`);
  };

  // Agregar columna de acciones a cada prospecto
  const dataWithActions = prospectos.map(prospecto => ({
    ...prospecto,
    acciones: (
      <div className={styles.actionButtons}>
        <button className={styles.viewButton} onClick={() => handleViewProspect(prospecto.id || '')}>
          Ver
        </button>
        <button className={styles.deleteButton} onClick={() => handleDeleteProspect(prospecto.id || '')}>
          Eliminar
        </button>
      </div>
    )
  }));

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
                  onClick={handleNewProspectClick}
                />
                {/* Dropdown para filtro de estado */}
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
                  InputProps={{
                    startAdornment: (
                      <img width="20px" height="20px" src="/search.svg" alt="Search" />
                    ),
                  }}
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
                  <Table data={dataWithActions} columns={columnsWithActions} />
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
