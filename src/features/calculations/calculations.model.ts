import db from '../../config/database';
import { ICalculation, ICalculationRow, ICalculationNode } from './calculations.types';

/**
 * Fetch all calculations with user information (flat list)
 */
export const getAllCalculations = (): Promise<ICalculationRow[]> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        c.id,
        c.parent_id,
        c.user_id,
        c.operation,
        c.number,
        c.result,
        c.depth,
        c.created_at,
        u.username
      FROM calculations c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at ASC
    `;

    db.all(query, [], (err, rows: ICalculationRow[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * Get a single calculation by ID
 */
export const getCalculationById = (id: number): Promise<ICalculation | undefined> => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT
        id, parent_id, user_id, operation, number, result, depth, created_at
      FROM calculations
      WHERE id = ?
    `;

    db.get(query, [id], (err, row: ICalculation) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Create a starting number (root calculation)
 */
export const createStartingNumber = (userId: number, number: number): Promise<ICalculation> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO calculations (user_id, operation, number, result, depth)
      VALUES (?, 'start', ?, ?, 0)
    `;

    db.run(query, [userId, number, number], function (err) {
      if (err) {
        reject(err);
      } else {
        getCalculationById(this.lastID)
          .then((calculation) => {
            if (calculation) {
              resolve(calculation);
            } else {
              reject(new Error('Failed to retrieve created calculation'));
            }
          })
          .catch(reject);
      }
    });
  });
};

/**
 * Add an operation (reply to a calculation)
 */
export const addOperation = (
  parentId: number,
  userId: number,
  operation: '+' | '-' | '*' | '/',
  number: number,
  result: number,
  depth: number
): Promise<ICalculation> => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO calculations (parent_id, user_id, operation, number, result, depth)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [parentId, userId, operation, number, result, depth], function (err) {
      if (err) {
        reject(err);
      } else {
        getCalculationById(this.lastID)
          .then((calculation) => {
            if (calculation) {
              resolve(calculation);
            } else {
              reject(new Error('Failed to retrieve created calculation'));
            }
          })
          .catch(reject);
      }
    });
  });
};

/**
 * Transform flat calculation rows into nested tree structure
 */
export const buildCalculationTree = (rows: ICalculationRow[]): ICalculationNode[] => {
  const map = new Map<number, ICalculationNode>();
  const roots: ICalculationNode[] = [];

  // Create map of all nodes with empty children arrays
  rows.forEach((row) => {
    const node: ICalculationNode = {
      id: row.id,
      parent_id: row.parent_id,
      user_id: row.user_id,
      username: row.username,
      operation: row.operation as ICalculation['operation'],
      number: row.number,
      result: row.result,
      depth: row.depth,
      created_at: row.created_at,
      children: [],
    };
    map.set(row.id, node);
  });

  // Build parent-child relationships
  rows.forEach((row) => {
    const node = map.get(row.id)!;
    if (row.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(row.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  return roots;
};
