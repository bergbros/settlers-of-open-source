export class DataManager {
  dataTable: any[];

  public constructor() {
    this.dataTable = [];
  }

  public addObject(object: any): void {
    this.dataTable.push(object);
  }

  private genLookupFn(attr: string, attrVal: string) {
    let lookupFn = (obj: any) => {
      return obj[attr] === attrVal;
    }
    return lookupFn;
  }

  private getIndexForObjectByAttr(attr: string, attrVal: string): number {
    return this.dataTable.findIndex(
      this.genLookupFn(attr, attrVal)
    );
  }

  public getObjectByAttr(attr: string, attrVal: string): object | null {
    var index = this.getIndexForObjectByAttr(attr, attrVal);
    if (index === -1) {
      return null;
    } else {
      return this.dataTable[index];
    }
  }

  public objectWithAttrExists(attr: string, attrVal: string): boolean {
    var index = this.getIndexForObjectByAttr(attr, attrVal);
    if (index === -1) {
      return false;
    } else {
      return true;
    }
  }

  public removeObjectByAttr(attr: string, attrVal: string): boolean {
    var indexToRemove = this.getIndexForObjectByAttr(attr, attrVal);
    if (indexToRemove === -1) {
      return false;
    } else {
      this.dataTable.splice(indexToRemove, 1);
      return true;
    }
  }
}