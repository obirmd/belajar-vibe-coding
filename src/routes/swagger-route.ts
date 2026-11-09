import { Elysia } from 'elysia';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load the generated OpenAPI JSON file from the project root
const specPath = join(process.cwd(), 'openapi.json');
const spec = JSON.parse(readFileSync(specPath, 'utf-8'));

export const swaggerRoute = new Elysia()
  .get('/swagger.json', () => spec);

