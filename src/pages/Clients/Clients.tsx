import React, { useEffect, useState } from 'react';
import styles from './Clients.module.css';
import Header from '../../components/Header/Header';
import Navbar from '../../components/Navigation/Navbar/Navbar';
import Table from '../../components/Table/Table';
import FilterDropdown, { FilterOption } from '../../components/FilterDropdown/FilterDropdown';
import { getContacts } from '../../api/api';
import { Typography, Button, TextField } from '@mui/material';

interface Contact {
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

interface ApiContact {
  Actividad?: string;
  CUIT?: string;
  Descripcion?: string;
  DomicilioCom?: string;
  EMail?: string;
  EstaAnulado?: string;
  EstaBloqueado?: string;
  FechaActualizacion?: string;
  Numero?: string;
  Oficial?: string;
  Referente?: string;
  [key: string]: any;
}

const Dashboard: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1) Obtener la data de contactos
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const apiData = await getContacts();
        const transformedData: Contact[] = apiData.map((item: ApiContact, index: number) => {
          const isActive = item.EstaAnulado === '0' && item.EstaBloqueado === '0';
          return {
            id: item.Numero || String(index + 1),
            nombre: item.Descripcion || '-',
            sector: item.Actividad || '-',
            oficial: item.Oficial?.split(',')[0] || '-',
            referente: item.Referente?.split(',')[0] || '-',
            numcomitente: item.Numero || '-',
            cuit: item.CUIT || '-',
            mail: item.EMail || '-',
            activo: isActive,
          };
        });
        setContacts(transformedData);
        setFilteredContacts(transformedData);
      } catch (error) {
        console.error('Error al obtener los contactos:', error);
        setContacts([]);
        setFilteredContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, []);

  // 2) Definir columnas en { label, field }
  const contactColumns = [
    { label: 'Nombre', field: 'nombre' },
    { label: 'Sector', field: 'sector' },
    { label: 'Oficial', field: 'oficial' },
    { label: 'Referente', field: 'referente' },
    { label: 'Número Comitente', field: 'numcomitente' },
    { label: 'Número de CUIT', field: 'cuit' },
    { label: 'Mail Comitente', field: 'mail' },
    { label: 'Estado', field: 'activo' },
  ];

  // Generar opciones de filtro basadas en las columnas de la tabla
  const filterOptions: FilterOption[] = contactColumns.map(column => ({
    id: column.field,
    name: column.label,
    icon: `/next-icon.svg`
  }));

  // 3) Filtros
  const filterContacts = (filterId: string) => {
    setActiveFilters(prev => ({ ...prev, [filterId]: filterId }));

    let filtered = [...contacts];
    
    // Aplicar todos los filtros activos
    Object.keys({ ...activeFilters, [filterId]: filterId }).forEach(filter => {
      switch (filter) {
        case 'sector':
          filtered = filtered.filter(contact => contact.sector && contact.sector !== '-');
          break;
        case 'oficial':
          filtered = filtered.filter(contact => contact.oficial && contact.oficial !== '-');
          break;
        case 'referente':
          filtered = filtered.filter(contact => contact.referente && contact.referente !== '-');
          break;
        case 'nombre':
          filtered = filtered.filter(contact => contact.nombre && contact.nombre !== '-');
          break;
        case 'numcomitente':
          filtered = filtered.filter(contact => contact.numcomitente && contact.numcomitente !== '-');
          break;
        case 'cuit':
          filtered = filtered.filter(contact => contact.cuit && contact.cuit !== '-');
          break;
        case 'mail':
          filtered = filtered.filter(contact => contact.mail && contact.mail !== '-');
          break;
        case 'activo':
          // Este ya se filtra después (activeContacts/inactiveContacts)
          break;
        default:
          break;
      }
    });

    // Aplicar búsqueda de texto si existe
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.oficial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.referente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.mail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  const removeFilter = (filterId: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[filterId];
    setActiveFilters(newFilters);

    let filtered = [...contacts];
    
    // Aplicar los filtros restantes
    Object.keys(newFilters).forEach(filter => {
      switch (filter) {
        case 'sector':
          filtered = filtered.filter(contact => contact.sector && contact.sector !== '-');
          break;
        case 'oficial':
          filtered = filtered.filter(contact => contact.oficial && contact.oficial !== '-');
          break;
        case 'referente':
          filtered = filtered.filter(contact => contact.referente && contact.referente !== '-');
          break;
        case 'nombre':
          filtered = filtered.filter(contact => contact.nombre && contact.nombre !== '-');
          break;
        case 'numcomitente':
          filtered = filtered.filter(contact => contact.numcomitente && contact.numcomitente !== '-');
          break;
        case 'cuit':
          filtered = filtered.filter(contact => contact.cuit && contact.cuit !== '-');
          break;
        case 'mail':
          filtered = filtered.filter(contact => contact.mail && contact.mail !== '-');
          break;
        case 'activo':
          // Este ya se filtra después
          break;
        default:
          break;
      }
    });

    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.oficial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.referente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.mail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  };

  // 4) Búsqueda
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    let filtered = contacts;
    if (term) {
      filtered = filtered.filter(contact =>
        contact.nombre.toLowerCase().includes(term) ||
        contact.sector.toLowerCase().includes(term) ||
        contact.oficial.toLowerCase().includes(term) ||
        contact.referente.toLowerCase().includes(term) ||
        contact.mail.toLowerCase().includes(term)
      );
    }

    if (Object.keys(activeFilters).length > 0) {
      Object.keys(activeFilters).forEach(filter => {
        switch (filter) {
          case 'sector':
            filtered = filtered.filter(contact => contact.sector && contact.sector !== '-');
            break;
          case 'oficial':
            filtered = filtered.filter(contact => contact.oficial && contact.oficial !== '-');
            break;
          case 'referente':
            filtered = filtered.filter(contact => contact.referente && contact.referente !== '-');
            break;
          case 'nombre':
            filtered = filtered.filter(contact => contact.nombre && contact.nombre !== '-');
            break;
          case 'numcomitente':
            filtered = filtered.filter(contact => contact.numcomitente && contact.numcomitente !== '-');
            break;
          case 'cuit':
            filtered = filtered.filter(contact => contact.cuit && contact.cuit !== '-');
            break;
          case 'mail':
            filtered = filtered.filter(contact => contact.mail && contact.mail !== '-');
            break;
          case 'activo':
            // Este ya se filtra después
            break;
          default:
            break;
        }
      });
    }

    setFilteredContacts(filtered);
  };

  // 5) Contactos activos vs inactivos
  const activeContacts = filteredContacts.filter(contact => contact.activo);
  const inactiveContacts = filteredContacts.filter(contact => !contact.activo);

  return (
    <div className={styles.desktop64}>
      <Navbar />

      <main className={styles.headervariant3Parent}>
        <Header />

        <section className={styles.frameWrapper}>
          <div className={styles.frameGroup}>

            {/* Título + Filtros + Búsqueda */}
            <div className={styles.crmEscoParent}>
              <Typography
                className={styles.crmEsco}
                variant="h1"
                component="h1"
              >
                CRM ESCO
              </Typography>
              <div className={styles.inputDropdownMenuItemParent}>
                <FilterDropdown 
                  options={filterOptions} 
                  onFilterSelect={filterContacts} 
                  buttonText="Filtros"
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

            {/* CONTENEDOR DONDE VAN LAS DOS TABLAS */}
            <div className={styles.tableHeaderTabsParent}>
              {/* CONTACTOS ACTIVOS */}
              <div className={styles.tableHeaderTabs}>
                <div className={styles.sectionHeader}>
                  <Typography
                    className={styles.contactosActivos}
                    variant="h2"
                    component="h2"
                  >
                    Contactos activos
                  </Typography>

                  {/* Chips de filtros activos */}
                  {Object.keys(activeFilters).length > 0 && (
                    <div className={styles.activeFiltersContainer}>
                      {Object.keys(activeFilters).map(filter => (
                        <div key={filter} className={styles.filterBadge}>
                          <span>{contactColumns.find(col => col.field === filter)?.label || filter}</span>
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
                </div>

                <div className={styles.tableHeaderGroupParent}>
                  {loading ? (
                    <div className={styles.emptyTable}>Cargando datos...</div>
                  ) : (
                    <Table
                      data={activeContacts}
                      columns={contactColumns}
                    />
                  )}
                </div>

                <Button className={styles.button} variant="outlined">
                  Ver todos
                </Button>
              </div>

              {/* CONTACTOS INACTIVOS */}
              <div className={styles.tableHeaderTabs}>
                <Typography
                  className={styles.contactosActivos}
                  variant="h2"
                  component="h2"
                >
                  Contactos inactivos
                </Typography>
                <div className={styles.tableHeaderGroupParent}>
                  {loading ? (
                    <div className={styles.emptyTable}>Cargando datos...</div>
                  ) : (
                    <Table
                      data={inactiveContacts}
                      columns={contactColumns}
                    />
                  )}
                </div>
                <Button className={styles.button} variant="outlined">
                  Ver todos
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;