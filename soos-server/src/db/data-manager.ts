export class DataManager<T> {
  dataTable: T[];

  public constructor() {
    this.dataTable = [];
  }

  public addObject(object: T): void {
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

  public getObjectByAttr(attr: string, attrVal: string): T | null {
    const index = this.getIndexForObjectByAttr(attr, attrVal);
    if (index === -1) {
      return null;
    } else {
      return this.dataTable[index];
    }
  }

  public objectWithAttrExists(attr: string, attrVal: string): boolean {
    const index = this.getIndexForObjectByAttr(attr, attrVal);
    if (index === -1) {
      return false;
    } else {
      return true;
    }
  }

  public removeObjectByAttr(attr: string, attrVal: string): boolean {
    const indexToRemove = this.getIndexForObjectByAttr(attr, attrVal);
    if (indexToRemove === -1) {
      return false;
    } else {
      this.dataTable.splice(indexToRemove, 1);
      return true;
    }
  }
}
