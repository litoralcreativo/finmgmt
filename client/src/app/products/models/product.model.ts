import { TableColumn } from 'lito-fr';

export class Product {
  _id: string;

  @TableColumn({ columnName: 'Nombre' })
  name: string;
  @TableColumn({ columnName: 'descripcion' })
  description: string;

  constructor(init?: ProductResponse) {
    if (init) {
      this._id = init._id;
      this.name = init.nombre;
      this.description = init.descripcion;
    }
  }
}

export type ProductResponse = {
  _id: string;
  nombre: string;
  descripcion: string;
};
