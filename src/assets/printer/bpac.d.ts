declare module 'src/assets/printer/bpac.js' {
  export class Printer {
    constructor();
    printFile(data: any): void;
  }
  // Add any other types or functions that might be needed
}

declare module 'src/assets/printer/template.lbxs' {
  const templatePath: string;
  export default templatePath;
}
