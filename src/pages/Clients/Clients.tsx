import React, { useEffect, useState } from 'react';
import styles from './Clients.module.css';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navigation/Navbar/Navbar';
import Table from '../../components/Table/Table';
import FilterDropdown, { FilterOption } from '../../components/FilterDropdown/FilterDropdown';
import Pagination from '../../components/Pagination/Pagination';
import { Typography, Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getClients } from '../../api/api';

interface Client {
  id: string;
  nombre: string;
  sector: string;
  oficial: string;
  referente: string;
  numcomitente: string;
  cuit: string;
  mail: string;
  activo: boolean;
}

const ClientsDashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  // 'todos' = sin filtro, 'activos' o 'inactivos' según lo seleccionado
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const navigate = useNavigate();

  // Columnas para la tabla (deben coincidir con las propiedades mapeadas)
  const clientColumns = [
    { label: 'Nombre', field: 'nombre' },
    { label: 'Sector', field: 'sector' },
    { label: 'Oficial', field: 'oficial' },
    { label: 'Referente', field: 'referente' },
    { label: 'Número Comitente', field: 'numcomitente' },
    { label: 'Número de CUIT', field: 'cuit' },
    { label: 'Mail', field: 'mail' },
    { label: 'Estado', field: 'activo' },
  ];

  // Opciones del dropdown: "Todos", "Activos" e "Inactivos"
  const filterOptions: FilterOption[] = [
    { id: 'todos', name: 'Todos', icon: '/next-icon.svg' },
    { id: 'activos', name: 'Activos', icon: '/next-icon.svg' },
    { id: 'inactivos', name: 'Inactivos', icon: '/next-icon.svg' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getClients(currentPage, filterStatus);
        setClients(response.data);
        setTotalPages(response.pagination.lastPage);
      } catch (error) {
        console.error('Error al obtener clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, filterStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // La función onFilterSelect ahora recibe directamente el id del filtro (string)
  const handleFilterSelect = (filterId: string) => {
    setFilterStatus(filterId as 'todos' | 'activos' | 'inactivos');
    setCurrentPage(1);
  };

  // Búsqueda local: filtra los clientes por los campos mapeados
  const filteredClients = clients.filter(client =>
    (client.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.sector || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.oficial || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.referente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.mail || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Se agrega el botón "Ver" para cada fila que redirige al detalle del cliente
  const clientsWithActions = filteredClients.map(client => ({
    ...client,
    acciones: (
      <Button variant="outlined" onClick={() => navigate(`/crm/clients/details/${client.numcomitente}`)}>
        Ver
      </Button>
    )
  }));

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
                  options={filterOptions}
                  onFilterSelect={handleFilterSelect}
                  buttonText="Filtrar"
                  width="150px"
                />
                <TextField
                  className={styles.search}
                  placeholder="Buscar"
                  variant="outlined"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <img width="20px" height="20px" src="/search.svg" alt="Search" />
                    )
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

            {/* Tabla de Clientes */}
            <div className={styles.tableHeaderTabsParent}>
              <div className={styles.tableHeaderTabs}>
                {loading ? (
                  <div className={styles.emptyTable}>Cargando datos...</div>
                ) : (
                  <Table
                    columns={[...clientColumns, { label: 'Acciones', field: 'acciones' }]}
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
