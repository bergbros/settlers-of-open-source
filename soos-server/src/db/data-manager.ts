export class DataManager<T> {
  dataTable: T[];

  constructor() {
    this.dataTable = [];
  }

  addObject(object: T): void {
    this.dataTable.push(object);
  }

  private genLookupFn(attr: string, attrVal: string) {
    const lookupFn = (obj: T) => {
      return obj[attr] === attrVal;
    };
    return lookupFn;
  }

  private getIndexForObjectByAttr(attr: string, attrVal: string): number {
    return this.dataTable.findIndex(
      this.genLookupFn(attr, attrVal),
    );
  }

  getObjectByAttr(attr: string, attrVal: string): T | null {
    const index = this.getIndexForObjectByAttr(attr, attrVal);
    if (index === -1) {
      return null;
    } else {
      return this.dataTable[index];
    }
  }

  objectWithAttrExists(attr: string, attrVal: string): boolean {
    const index = this.getIndexForObjectByAttr(attr, attrVal);
    if (index === -1) {
      return false;
    } else {
      return true;
    }
  }

  removeObjectByAttr(attr: string, attrVal: string): boolean {
    const indexToRemove = this.getIndexForObjectByAttr(attr, attrVal);
    if (indexToRemove === -1) {
      return false;
    } else {
      this.dataTable.splice(indexToRemove, 1);
      return true;
    }
  }
}
