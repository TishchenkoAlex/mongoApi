import * as express from 'express';
import { MSSQL } from '../mssql';
import { SDB } from './middleware/db-sessions';

export const router = express.Router();

interface Document {
  id: string,
  type: string,
  json: { [x: string]: any }
}

function flatDocument(doc: Document): { [x: string]: any } {
  return { ...doc.json, id: doc.id, type: doc.type }
}

async function get(conn: MSSQL, id: string) {
  const query = `SELECT * FROM Documents WHERE id = @p1`;
  const rawDocument = await conn.oneOrNone<Document>(query, [id]);
  if (!rawDocument) return null;
  const result = flatDocument(rawDocument);
  return result;
}

router.get('/:id', async (req, res, next) => {
  try {
    const conn = SDB(req);
    const result = await get(conn, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

router.get('/:type/:id', async (req, res, next) => {
  try {
    const conn = SDB(req);
    const result = await get(conn, req.params.id);
    res.json(result);
  } catch (err) { next(err); }
});

async function post(conn: MSSQL, type: string, json: string) {
  const query = `
    INSERT INTO Documents(type, json) 
    OUTPUT INSERTED.* 
    VALUES(@p1, JSON_QUERY(@p2));
  `;
  const rawDocument = (await conn.oneOrNone<Document>(query, [type, JSON.stringify(json)]))!;
  const result = flatDocument(rawDocument);
  return result;
}

router.post('/:type', async (req, res, next) => {
  try {
    const conn = SDB(req);
    const result = await post(conn, req.params.type, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

async function patch(conn: MSSQL, id: string, json: string) {
  const query = `
    UPDATE Documents
    SET json = JSON_QUERY(@p2)
    OUTPUT INSERTED.* 
    WHERE id = @p1;
  `;
  const rawDocument = (await conn.oneOrNone<Document>(query, [id, JSON.stringify(json)]));
  if (!rawDocument) return null;
  const result = flatDocument(rawDocument);
  return result;
}

router.patch('/:type/:id', async (req, res, next) => {
  try {
    const conn = SDB(req);
    const result = await patch(conn, req.params.id, req.body);
    res.json(result);
  } catch (err) { next(err); }
});

