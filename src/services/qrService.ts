import JsBarcode from 'jsbarcode';

export function generateBarcode(value: string): string {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, value, {
    format: "CODE128",
    lineColor: "#000",
    width: 2,
    height: 40,
    displayValue: true
  });
  return canvas.toDataURL("image/png");
}

export function generateCourrierReference(type: 'entrant' | 'sortant'): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const prefix = type === 'entrant' ? 'CE' : 'CS';
  return `${prefix}-${year}-${random}`;
}
