import { loadYamlSync } from './utils';

type AppName = string;
type AppProps = {
  path: string;
  required?: string[];
  optional?: string[];
};

type AppConfig = {
  apps: Record<AppName, AppProps>;
};

export function loadConfigSync(filename: string): AppConfig {
  return loadYamlSync(filename);
}
