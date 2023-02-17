import type { IOtOperation } from '../models';
import { AddColumnMetaBuilder } from './field/add-column-meta';
import { AddFieldBuilder } from './field/add-field';
import { DeleteFieldBuilder } from './field/delete-field';
import { SetColumnMetaBuilder } from './field/set-column-meta';
import { SetFieldNameBuilder } from './field/set-field-name';
import { AddRecordBuilder } from './record/add-record';
import { DeleteRecordBuilder } from './record/delete-record';
import { SetRecordBuilder } from './record/set-record';
import { SetRecordOrderBuilder } from './record/set-record-order';

export type { IDeleteFieldOpContext } from './field/delete-field';
export type { ISetRecordOrderOpContext } from './record/set-record-order';
export type { IDeleteRecordOpContext } from './record/delete-record';
export type { ISetRecordOpContext } from './record/set-record';
export type { ISetColumnMetaOpContext } from './field/set-column-meta';
export type { IAddColumnMetaOpContext } from './field/add-column-meta';
export type { ISetFieldNameOpContext } from './field/set-field-name';

export class OpBuilder {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  static editor = {
    setRecord: new SetRecordBuilder(),
    deleteRecord: new DeleteRecordBuilder(),
    setRecordOrder: new SetRecordOrderBuilder(),

    deleteField: new DeleteFieldBuilder(),
    addColumnMeta: new AddColumnMetaBuilder(),
    setColumnMeta: new SetColumnMetaBuilder(),
    setFieldName: new SetFieldNameBuilder(),
  };

  // eslint-disable-next-line @typescript-eslint/naming-convention
  static creator = {
    addField: new AddFieldBuilder(),
    addRecord: new AddRecordBuilder(),
  };

  static ops2Contexts(ops: IOtOperation[]) {
    return ops.map((op) => {
      const result = this.detect(op);
      if (!result) {
        throw new Error(`can't detect op: ${op}`);
      }
      return result;
    });
  }

  static detect(op: IOtOperation) {
    for (const builder of Object.values(this.editor)) {
      const result = builder.detect(op);
      if (result) {
        return result;
      }
    }
    return null;
  }
}