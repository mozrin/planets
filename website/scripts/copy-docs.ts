import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve(import.meta.dirname, '../../docs/mpd');
const destination = resolve(import.meta.dirname, '../public/docs');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(source, destination, { recursive: true });
