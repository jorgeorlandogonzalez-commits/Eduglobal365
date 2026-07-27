import { RegionConfig } from './types';

export const REGIONS: RegionConfig[] = [
  {
    id: 'uraba',
    name: 'Urabá',
    keywords: ['banano', 'palma', 'pesca', 'puerto', 'clima cálido húmedo'],
    contextExample: 'Si en tu finca de Urabá cosechas 200 racimos de plátano y cada racimo tiene 12 plátanos, ¿cuántos plátanos tienes en total?'
  },
  {
    id: 'boyaca',
    name: 'Boyacá',
    keywords: ['papa', 'carbón', 'clima frío', 'artesanías de Ráquira', 'ruana'],
    contextExample: 'Si un bulto de papa en la plaza de Tunja cuesta 50.000 pesos y tienes 150.000, ¿cuántos bultos puedes comprar para tu familia?'
  },
  {
    id: 'caribe',
    name: 'Caribe',
    keywords: ['turismo', 'pesca', 'carnaval', 'clima cálido seco', 'playa'],
    contextExample: 'Si en Santa Marta un lanchero hace 4 viajes al día cobrando 30.000 pesos por pasaje a 10 turistas, ¿cuánto recauda en total?'
  },
  {
    id: 'amazonia',
    name: 'Amazonía',
    keywords: ['biodiversidad', 'etnobotánica', 'turismo sostenible', 'comunidades indígenas'],
    contextExample: 'En la Amazonía, ¿por qué crees que la copa de los árboles es tan importante para mantener la biodiversidad del suelo?'
  },
  {
    id: 'eje_cafetero',
    name: 'Eje Cafetero',
    keywords: ['café', 'paisaje cultural', 'turismo', 'clima templado', 'jeep'],
    contextExample: 'Si una carga de café pergamino seco requiere de 5 recolectores trabajando 2 días, ¿cuántos días tomaría con 10 recolectores al mismo ritmo?'
  },
  {
    id: 'urbano',
    name: 'Bogotá / Urbano',
    keywords: ['tecnología', 'startups', 'movilidad', 'diversidad cultural', 'TransMilenio'],
    contextExample: 'Si un bus de TransMilenio viaja a 40 km/h en carril exclusivo, ¿cuánto tiempo le toma recorrer 15 km desde el Portal Sur hasta el Centro?'
  }
];

export function getRegionContext(regionName: string): RegionConfig | undefined {
  const normalizedSearch = regionName.toLowerCase();
  return REGIONS.find(r => 
    r.name.toLowerCase().includes(normalizedSearch) || 
    r.id.toLowerCase() === normalizedSearch
  );
}
