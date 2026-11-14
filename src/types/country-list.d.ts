declare module 'country-list' {
  export interface CountryData {
    code: string;
    name: string;
  }
  export function getData(): CountryData[];
  export function getName(code: string): string | undefined;
  export function getCode(name: string): string | undefined;
  export function getNames(): string[];
  export function getCodes(): string[];
  export function getCodeList(): Record<string, string>;
  export function getNameList(): Record<string, string>;
  export function overwrite(countries: CountryData[]): void;
}
