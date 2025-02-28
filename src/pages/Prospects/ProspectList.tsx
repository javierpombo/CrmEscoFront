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
  // Estados para gestión de prospectos
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [filteredProspectos, setFilteredProspectos] = useState<Prospecto[]>([]);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para modal y paginación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const prospectPerPage = 10;
  const navigate = useNavigate();

  // Cargar prospectos al montar o cambiar de página
  useEffect(() => {
    const fetchProspectos = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await prospectoService.getProspectos(currentPage);

        setProspectos(result.data);
        setFilteredProspectos(result.data);
        setTotalPages(result.pagination.lastPage);
        setTotalItems(result.pagination.total);

        // Si la API devuelve un current_page diferente al que teníamos, actualizamos
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
  }, [currentPage]);

  // Columnas para la tabla y filtros
  const prospectColumns = [
    { label: 'Nombre', field: 'nombreCliente' },
    { label: 'Contacto', field: 'contacto' },
    { label: 'Tipo Cliente', field: 'tipoCliente' },
    { label: 'Oficial', field: 'oficial' },
    { label: 'Referente', field: 'referente' },
    { label: 'Último Contacto', field: 'ultimoContacto' },
    { label: 'Fecha de Vencimiento', field: 'fechaVencimiento' },
    { label: 'Acción Pendiente', field: 'tipoAccion' },
  ];

  // Generar opciones de filtro
  const filterOptions: FilterOption[] = prospectColumns.map(column => ({
    id: column.field,
    name: column.label,
    icon: `/next-icon.svg`
  }));

  // Función para filtrar prospectos localmente
  const filterProspectos = (filterId: string) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: filterId }));

    let filtered = [...prospectos];

    // Aplicar filtros
    const updatedFilters = { ...activeFilters, [filterId]: filterId };
    Object.keys(updatedFilters).forEach(filter => {
      switch (filter) {
        case 'nombreCliente':
          filtered = filtered.filter(p => p.nombreCliente && p.nombreCliente !== '-');
          break;
        case 'contacto':
          filtered = filtered.filter(p => p.contacto && p.contacto !== '-');
          break;
        case 'tipoCliente':
          filtered = filtered.filter(p => p.tipoCliente && p.tipoCliente !== '-');
          break;
        case 'oficial':
          filtered = filtered.filter(p => p.oficial && p.oficial !== '-');
          break;
        case 'referente':
          filtered = filtered.filter(p => p.referente && p.referente !== '-');
          break;
        // Puedes añadir más casos según sea necesario
      }
    });

    // Aplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p =>
        Object.values(p).some(val =>
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredProspectos(filtered);
  };

  // Función para remover filtros
  const removeFilter = (filterId: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterId];
    setActiveFilters(newFilters);

    let filtered = [...prospectos];

    // Reaplicar filtros restantes
    Object.keys(newFilters).forEach(filter => {
      switch (filter) {
        case 'nombreCliente':
          filtered = filtered.filter(p => p.nombreCliente && p.nombreCliente !== '-');
          break;
        case 'contacto':
          filtered = filtered.filter(p => p.contacto && p.contacto !== '-');
          break;
        case 'tipoCliente':
          filtered = filtered.filter(p => p.tipoCliente && p.tipoCliente !== '-');
          break;
        case 'oficial':
          filtered = filtered.filter(p => p.oficial && p.oficial !== '-');
          break;
        case 'referente':
          filtered = filtered.filter(p => p.referente && p.referente !== '-');
          break;
        // Más casos según necesites
      }
    });

    // Reaplicar búsqueda
    if (searchTerm) {
      filtered = filtered.filter(p =>
        Object.values(p).some(val =>
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredProspectos(filtered);
  };

  // Función de búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    let filtered = [...prospectos];

    if (term) {
      filtered = filtered.filter(p =>
        Object.values(p).some(val =>
          val && val.toString().toLowerCase().includes(term)
        )
      );
    }

    // Reaplicar filtros
    Object.keys(activeFilters).forEach(filter => {
      switch (filter) {
        case 'nombreCliente':
          filtered = filtered.filter(p => p.nombreCliente && p.nombreCliente !== '-');
          break;
        // Otros casos de filtro
      }
    });

    setFilteredProspectos(filtered);
  };

  // Función para manejar el cambio de página
  const handlePageChange = (page: number) => {
    // Reiniciamos los filtros al cambiar de página para mostrar los datos correctos del servidor
    setActiveFilters({});
    setSearchTerm('');
    setCurrentPage(page);
  };

  // Función para abrir el modal de creación de prospecto
  const handleNewProspectClick = () => {
    setIsModalOpen(true);
  };

  // Función para crear prospecto
  const handleCreateProspect = async (data: Omit<Prospecto, 'id'>) => {
    try {
      // Nos aseguramos de que no haya ID en los datos
      const newData = { ...data };
      delete (newData as any).id;
      
      const result = await prospectoService.createProspecto(newData);
      if (result) {
        // Refrescar la lista después de crear
        const refreshResult = await prospectoService.getProspectos(1);
        setProspectos(refreshResult.data);
        setFilteredProspectos(refreshResult.data);
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
          // Determinar la página que debemos cargar después de eliminar
          const pageToLoad = currentPage > 1 && filteredProspectos.length === 1
            ? currentPage - 1
            : currentPage;

          // Refrescar la lista después de eliminar
          const refreshResult = await prospectoService.getProspectos(pageToLoad);
          setProspectos(refreshResult.data);
          setFilteredProspectos(refreshResult.data);
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

  // Extender los datos para incluir acciones
  const dataWithActions = filteredProspectos.map(prospecto => ({
    ...prospecto,
    acciones: (
      <div className={styles.actionButtons}>
        <button
          className={styles.viewButton}
          onClick={() => handleViewProspect(prospecto.id || '')}
        >
          Ver
        </button>
        <button
          className={styles.deleteButton}
          onClick={() => handleDeleteProspect(prospecto.id || '')}
        >
          Eliminar
        </button>
      </div>
    )
  }));

  // Incluir columna de acciones
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
            {/* Encabezado */}
            <div className={styles.crmEscoParent}>
              <Typography className={styles.crmEsco} variant="h1" component="h1">
                Prospectos
              </Typography>

              <div className={styles.inputDropdownMenuItemParent}>
                {/* Botón Nuevo Prospecto */}
                <ButtonBasemddefault
                  showButtonBasemddefault
                  text="Nuevo"
                  onClick={handleNewProspectClick}
                />

                {/* Filtros y Búsqueda */}
                <FilterDropdown
                  options={filterOptions}
                  onFilterSelect={filterProspectos}
                  buttonText="Filtros"
                  width="150px"
                  menuPosition="left"
                  className={styles.customFilterDropdown}
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

            {/* Lista de Prospectos */}
            <div className={styles.tableHeaderTabsParent}>
              <div className={styles.tableHeaderTabs}>
                <Typography
                  className={styles.contactosActivos}
                  variant="h2"
                  component="h2"
                >
                  Lista de Prospectos
                </Typography>

                {/* Mostrar mensaje de error si hay algún problema */}
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                {/* Mostrar indicador de carga */}
                {isLoading ? (
                  <div className={styles.loadingIndicator}>
                    Cargando...
                  </div>
                ) : (
                  <>
                    {/* Filtros Activos */}
                    {Object.keys(activeFilters).length > 0 && (
                      <div className={styles.activeFiltersContainer}>
                        {Object.keys(activeFilters).map(filter => (
                          <div key={filter} className={styles.filterBadge}>
                            <span>{prospectColumns.find(col => col.field === filter)?.label || filter}</span>
                            <span
                              className={styles.removeFilter}
                              onClick={() => removeFilter(filter)}
                            >
                              ×
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tabla de Prospectos */}
                    <div className={styles.tableHeaderGroupParent}>
                      <Table
                        data={dataWithActions}
                        columns={columnsWithActions}
                      />
                    </div>
                  </>
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

        {/* Modal para Nuevo Prospecto - SIMPLIFICADO */}
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Nuevo Prospecto"
        >
          <ProspectForm
            onSubmit={handleCreateProspect}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      </main>
    </div>
  );
};

export default ProspectList;