import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface BarcodeProps {
  value: string;
  height?: number;
  className?: string;
}

const DEFAULT_HEIGHT = 56;
const BAR_WIDTH = 2;

/** Code-barres Code 128, lisible par les douchettes standard. Le numéro est affiché à part. */
export function Barcode({ value, height = DEFAULT_HEIGHT, className }: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    JsBarcode(svgRef.current, value, {
      format: 'CODE128',
      width: BAR_WIDTH,
      height,
      margin: 0,
      displayValue: false,
    });
  }, [value, height]);

  return <svg ref={svgRef} role="img" aria-label={`Code-barres du colis ${value}`} className={className} />;
}
