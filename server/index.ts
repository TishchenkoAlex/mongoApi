import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import { NextFunction, Request, Response } from 'express';
import * as httpServer from 'http';
import * as path from 'path';
import { authHTTP } from './routes/middleware/check-auth';
import { jettiDB } from './routes/middleware/db-sessions';
import { router as auth } from './routes/auth';
import { router as document } from './routes/document';

const root = './';
const app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(express.static(path.join(root, 'dist')));

const api = `/api/v1.0/`;
app.use(api + 'document', jettiDB, document);
app.use('/auth', jettiDB, auth);

app.get('*', (req: Request, res: Response) => {
  res.status(200);
  res.send('Jetti API');
});

app.use(errorHandler);
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.message);
  const status = err && (err as any).status ? (err as any).status : 500;
  res.status(status).send(err.message);
}

export const HTTP = httpServer.createServer(app);

const port = (process.env.PORT) || '3000';
HTTP.listen(port, () => console.log(`API running on port:${port}`));
