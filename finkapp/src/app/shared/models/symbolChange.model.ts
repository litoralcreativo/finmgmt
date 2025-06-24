export interface SymbolChangeResponse {
  compra: string;
  venta: string;
  fecha: string;
  variacion: string;
  'class-variacion': 'up' | 'down' | 'equal';
};

type percent = number;

export interface SymbolChange {
  compra: number;
  venta: number;
  fecha: Date;
  variacion: percent;
  'class-variacion': 'up' | 'down' | 'equal';
};

/* {
    "compra": "1238,44",
    "venta": "1238,44",
    "fecha": "03\/06\/2024 - 12:50",
    "ultimo": "1215,93",
    "valor": "1238,44",
    "variacion": "1,90%",
    "valor_cierre_ant": "1215,93",
    "class-variacion": "up"
} */
