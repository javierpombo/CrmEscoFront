import { DATASCOPE_URL } from '../config/constants';

export const navbarData  = [
  {
    "id": 1,
    "text": "Home",
    "link": `${DATASCOPE_URL}/home`
  },
  {
    "id": 2,
    "text": "CRM",
    "subItems": [
      {
        "id": 3,
        "text": "Prospectos",
        "link": "/crm/prospectos"
      },
      {
        "id": 4,
        "text": "Clientes",
        "link": "/crm/clients"
      }
    ]
  }
];

export default navbarData;