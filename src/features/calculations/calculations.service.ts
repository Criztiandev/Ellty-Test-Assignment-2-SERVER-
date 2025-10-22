import {
  getAllCalculations,
  getCalculationById,
  createStartingNumber as createStartingNumberModel,
  addOperation as addOperationModel,
  buildCalculationTree,
} from './calculations.model';
import { ICalculationNode, ICalculation } from './calculations.types';

/**
 * Calculate result based on operation
 * @throws Error if division by zero or result exceeds limits
 */
export const calculateResult = (
  leftOperand: number,
  operation: '+' | '-' | '*' | '/',
  rightOperand: number
): number => {
  let result: number;

  switch (operation) {
    case '+':
      result = leftOperand + rightOperand;
      break;
    case '-':
      result = leftOperand - rightOperand;
      break;
    case '*':
      result = leftOperand * rightOperand;
      break;
    case '/':
      if (rightOperand === 0) {
        throw new Error('Division by zero is not allowed');
      }
      result = leftOperand / rightOperand;
      break;
    default:
      throw new Error('Invalid operation');
  }

  // Round to 2 decimal places
  result = Math.round(result * 100) / 100;

  // Check limits (±1,000,000)
  if (result > 1_000_000 || result < -1_000_000) {
    throw new Error('Result exceeds limit (±1,000,000)');
  }

  return result;
};

/**
 * Get all calculations as nested tree
 */
export const getCalculationsTree = async (): Promise<ICalculationNode[]> => {
  const rows = await getAllCalculations();
  return buildCalculationTree(rows);
};

/**
 * Create a starting number (root calculation)
 */
export const createStartingNumber = async (
  userId: number,
  number: number
): Promise<ICalculation> => {
  // Validate number limits
  if (number > 1_000_000 || number < -1_000_000) {
    throw new Error('Number exceeds limit (±1,000,000)');
  }

  const calculation = await createStartingNumberModel(userId, number);

  // Fetch username for response
  return {
    id: calculation.id,
    parent_id: calculation.parent_id,
    user_id: calculation.user_id,
    operation: calculation.operation,
    number: calculation.number,
    result: calculation.result,
    depth: calculation.depth,
    created_at: calculation.created_at,
  };
};

/**
 * Add an operation (reply to a calculation)
 */
export const createOperation = async (
  parentId: number,
  userId: number,
  operation: '+' | '-' | '*' | '/',
  number: number
): Promise<ICalculation> => {
  // Validate number limits
  if (number > 1_000_000 || number < -1_000_000) {
    throw new Error('Number exceeds limit (±1,000,000)');
  }

  // Fetch parent calculation
  const parent = await getCalculationById(parentId);
  if (!parent) {
    throw new Error('Parent calculation not found');
  }

  // Check depth limit
  const newDepth = parent.depth + 1;
  if (newDepth > 50) {
    throw new Error('Maximum depth reached (50 levels)');
  }

  // Calculate result
  const result = calculateResult(parent.result, operation, number);

  // Save to database
  const calculation = await addOperationModel(
    parentId,
    userId,
    operation,
    number,
    result,
    newDepth
  );

  return {
    id: calculation.id,
    parent_id: calculation.parent_id,
    user_id: calculation.user_id,
    operation: calculation.operation,
    number: calculation.number,
    result: calculation.result,
    depth: calculation.depth,
    created_at: calculation.created_at,
  };
};
