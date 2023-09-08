import { promises as fs } from 'node:fs';

export class Wordlist {
  wordlist: string[] = [];
  filename: string;

  public constructor(filename: string) {
    this.filename = filename;
  }

  private async init() {
    this.wordlist = await this.loadFile(this.filename);
    console.log('saved lines with length ' + this.wordlist.length);
  }

  public getRandomWord(): string {
    let word = '';
    if (this.wordlist.length == 0) {
      this.init().then(() => {
        word = this.wordlist[Math.floor(Math.random() * this.wordlist.length)];
      });
    } else {
      word = this.wordlist[Math.floor(Math.random() * this.wordlist.length)];
    }
    return word;
  }

  private async loadFile(filename: string): Promise<string[]> {
    var data = await fs.readFile(filename, "utf-8");
    return data.split('\n');
  }
}