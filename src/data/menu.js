import { DATASCOPE_URL } from '../config/constants';

export const navbarData  = [
  {
    "id": 1,
    "text": "Home",
    "link": `${DATASCOPE_URL}/home`,
    "icon": "/icon.svg"
  },
  {
    "id": 2,
    "text": "CRM",
    "icon": "/icon.svg",
    "subItems": [
      {
        "id": 3,
        "text": "Prospectos",
        "link": "/crm/prospectos",
        "icon": "/icon.svg"
      },
      {
        "id": 4,
        "text": "Clientes",
        "link": "/crm/clients",
        "icon": "/icon.svg"
      }
    ]
  }
];

export default navbarData;