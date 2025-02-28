import React, { useEffect, useState } from 'react';
import { Typography, Tabs, Tab, CircularProgress } from '@mui/material';
import axios from 'axios';

// Importaciones de componentes
import Navbar from '../../components/Navigation/Navbar/Navbar';
import Header from '../../components/Header/Header';
import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/Pagination';
import FilterDropdown, { FilterOption } from '../../components/FilterDropdown/FilterDropdown';

// Estilos
import styles from './ClientsList.module.css';

// URL base de la API
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Interfaces
interface Client {
  id: number;
  Nombre: string;
  Apellido: string;
  RazonSocial?: string;
  CUIT: string;
  Email: string;
  Telefono: string;
  EstaAnulado: number;
  // Otros campos según el modelo de tu backend
}

interface PaginatedResponse {
  current_page: number;
  data: Client[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

const ClientsList: React.FC = () => {
  // Estados
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('active');

  // Columnas para la tabla
  const clientColumns = [
    { label: 'ID', field: 'id' },
    { label: 'Nombre', field: 'Nombre' },
    { label: 'Apellido', field: 'Apellido' },
    { label: 'Razón Social', field: 'RazonSocial' },
    { label: 'CUIT', field: 'CUIT' },
    { label: 'Email', field: 'Email' },
    { label: 'Teléfono', field: 'Telefono' }
  ];

  // Generar opciones de filtro
  const filterOptions: FilterOption[] = clientColumns.map(column => ({
    id: column.field,
    name: column.label,
    icon: `/next-icon.svg`
  }));

  // Cargar clientes
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const endpoint = activeTab === 'active' 
          ? `${API_BASE_URL}/clients/active/${currentPage}`
          : `${API_BASE_URL}/clients/inactive/${currentPage}`;
          
        const response = await axios.get<PaginatedResponse>(endpoint);
        
        setClients(response.data.data);
        setFilteredClients(response.data.data);
        setTotalPages(response.data.last_page);
        
        // Si la API devuelve un current_page diferente al que teníamos, actualizamos
        if (response.data.current_page !== currentPage) {
          setCurrentPage(response.data.current_page);
        }
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [currentPage, activeTab]);

  // Función para filtrar clientes
  const filterClients = (filterId: string) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: filterId }));

    let filtered = [...clients];
    
    // Aplicar todos los filtros activos
    Object.keys({ ...activeFilters, [filterId]: filterId }).forEach(filter => {
      switch (filter) {
        case 'Nombre':
          filtered = filtered.filter(client => client.Nombre && client.Nombre !== '-');
          break;
        case 'Apellido':
          filtered = filtered.filter(client => client.Apellido && client.Apellido !== '-');
          break;
        case 'RazonSocial':
          filtered = filtered.filter(client => client.RazonSocial && client.RazonSocial !== '-');
          break;
        case 'CUIT':
          filtered = filtered.filter(client => client.CUIT && client.CUIT !== '-');
          break;
        case 'Email':
          filtered = filtered.filter(client => client.Email && client.Email !== '-');
          break;
        case 'Telefono':
          filtered = filtered.filter(client => client.Telefono && client.Telefono !== '-');
          break;
        default:
          break;
      }
    });

    // Aplicar búsqueda de texto si existe
    if (searchTerm) {
      filtered = filtered.filter(client =>
        Object.values(client).some(val => 
          val && typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredClients(filtered);
  };

  // Función para remover filtros
  const removeFilter = (filterId: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterId];
    setActiveFilters(newFilters);

    let filtered = [...clients];
    
    // Aplicar los filtros restantes
    Object.keys(newFilters).forEach(filter => {
      switch (filter) {
        case 'Nombre':
          filtered = filtered.filter(client => client.Nombre && client.Nombre !== '-');
          break;
        case 'Apellido':
          filtered = filtered.filter(client => client.Apellido && client.Apellido !== '-');
          break;
        case 'RazonSocial':
          filtered = filtered.filter(client => client.RazonSocial && client.RazonSocial !== '-');
          break;
        case 'CUIT':
          filtered = filtered.filter(client => client.CUIT && client.CUIT !== '-');
          break;
        case 'Email':
          filtered = filtered.filter(client => client.Email && client.Email !== '-');
          break;
        case 'Telefono':
          filtered = filtered.filter(client => client.Telefono && client.Telefono !== '-');
          break;
        default:
          break;
      }
    });

    // Aplicar búsqueda de texto si existe
    if (searchTerm) {
      filtered = filtered.filter(client =>
        Object.values(client).some(val => 
          val && typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    setFilteredClients(filtered);
  };

  // Función de búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    let filtered = [...clients];
    
    if (term) {
      filtered = filtered.filter(client =>
        Object.values(client).some(val => 
          val && typeof val === 'string' && val.toLowerCase().includes(term)
        )
      );
    }

    // Reaplicar filtros activos
    if (Object.keys(activeFilters).length > 0) {
      Object.keys(activeFilters).forEach(filter => {
        switch (filter) {
          case 'Nombre':
            filtered = filtered.filter(client => client.Nombre && client.Nombre !== '-');
            break;
          case 'Apellido':
            filtered = filtered.filter(client => client.Apellido && client.Apellido !== '-');
            break;
          case 'RazonSocial':
            filtered = filtered.filter(client => client.RazonSocial && client.RazonSocial !== '-');
            break;
          case 'CUIT':
            filtered = filtered.filter(client => client.CUIT && client.CUIT !== '-');
            break;
          case 'Email':
            filtered = filtered.filter(client => client.Email && client.Email !== '-');
            break;
          case 'Telefono':
            filtered = filtered.filter(client => client.Telefono && client.Telefono !== '-');
            break;
          default:
            break;
        }
      });
    }

    setFilteredClients(filtered);
  };

  // Manejar cambio de página
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Manejar cambio de tab
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
    setCurrentPage(1); // Reset a la primera página al cambiar de tab
    setActiveFilters({}); // Limpiar filtros
    setSearchTerm('');
  };

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
                Clientes
              </Typography>

              <div className={styles.inputDropdownMenuItemParent}>
                {/* Filtros y Búsqueda */}
                <FilterDropdown 
                  options={filterOptions} 
                  onFilterSelect={filterClients}
                  buttonText="Filtros"
                  width="150px"
                  menuPosition="left"
                  className={styles.customFilterDropdown}
                />
                
                <input
                  className={styles.searchInput}
                  placeholder="Buscar"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e as any)}
                />
              </div>
            </div>

            {/* Tabs de selección */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              className={styles.tabs}
              variant="fullWidth"
            >
              <Tab label="Clientes Activos" value="active" />
              <Tab label="Clientes Inactivos" value="inactive" />
            </Tabs>

            {/* Lista de Clientes */}
            <div className={styles.tableHeaderTabsParent}>
              <div className={styles.tableHeaderTabs}>
                <Typography
                  className={styles.contactosActivos}
                  variant="h2"
                  component="h2"
                >
                  {activeTab === 'active' ? 'Clientes Activos' : 'Clientes Inactivos'}
                </Typography>

                {/* Filtros Activos */}
                {Object.keys(activeFilters).length > 0 && (
                  <div className={styles.activeFiltersContainer}>
                    {Object.keys(activeFilters).map(filter => (
                      <div key={filter} className={styles.filterBadge}>
                        <span>{clientColumns.find(col => col.field === filter)?.label || filter}</span>
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

                {/* Mostrar mensaje de error si hay algún problema */}
                {error && (
                  <div className={styles.errorMessage}>
                    {error}
                  </div>
                )}

                {/* Mostrar indicador de carga */}
                {isLoading ? (
                  <div className={styles.loadingIndicator}>
                    <CircularProgress />
                    <Typography>Cargando...</Typography>
                  </div>
                ) : (
                  <>
                    {/* Tabla de Clientes */}
                    <div className={styles.tableHeaderGroupParent}>
                      <Table
                        data={filteredClients}
                        columns={clientColumns}
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
      </main>
    </div>
  );
};

export default ClientsList;