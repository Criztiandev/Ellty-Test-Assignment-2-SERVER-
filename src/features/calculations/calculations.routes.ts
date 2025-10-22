import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { getCalculationsTree, createStartingNumber, createOperation } from './calculations.service';
import { createStartingNumberSchema, addOperationSchema } from './calculations.validation';

const router = Router();

/**
 * GET /api/calculations
 * Fetch all calculations as nested tree (public, no auth required)
 */
router.get('/', async (req, res: Response): Promise<void> => {
  try {
    const tree = await getCalculationsTree();
    res.json({
      payload: tree,
      message: 'Calculations fetched successfully',
    });
  } catch (error) {
    console.error('Error fetching calculations:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch calculations',
    });
  }
});

/**
 * POST /api/calculations
 * Create a starting number (auth required)
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = createStartingNumberSchema.parse(req.body);

    // Create starting number
    const calculation = await createStartingNumber(req.userId!, validatedData.number);

    res.status(201).json({
      payload: calculation,
      message: 'Starting number created successfully',
    });
  } catch (error: unknown) {
    console.error('Error creating starting number:', error);

    // Handle validation errors
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError' &&
      'errors' in error
    ) {
      res.status(400).json({
        error: error.errors,
        message: 'Validation failed',
      });
      return;
    }

    // Handle business logic errors
    if (error instanceof Error && error.message) {
      res.status(400).json({
        error: error.message,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create starting number',
    });
  }
});

/**
 * POST /api/calculations/:id/reply
 * Add an operation to a calculation (auth required)
 */
router.post('/:id/reply', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parentId = parseInt(req.params.id, 10);

    if (isNaN(parentId)) {
      res.status(400).json({
        error: 'Invalid parent ID',
        message: 'Parent ID must be a valid number',
      });
      return;
    }

    // Validate request body
    const validatedData = addOperationSchema.parse(req.body);

    // Create operation
    const calculation = await createOperation(
      parentId,
      req.userId!,
      validatedData.operation,
      validatedData.number
    );

    res.status(201).json({
      payload: calculation,
      message: 'Operation added successfully',
    });
  } catch (error: unknown) {
    console.error('Error adding operation:', error);

    // Handle validation errors
    if (
      error &&
      typeof error === 'object' &&
      'name' in error &&
      error.name === 'ZodError' &&
      'errors' in error
    ) {
      res.status(400).json({
        error: error.errors,
        message: 'Validation failed',
      });
      return;
    }

    // Handle "not found" errors
    if (error instanceof Error && error.message?.includes('not found')) {
      res.status(404).json({
        error: error.message,
        message: error.message,
      });
      return;
    }

    // Handle business logic errors (division by zero, depth limit, etc.)
    if (error instanceof Error && error.message) {
      res.status(400).json({
        error: error.message,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add operation',
    });
  }
});

export default router;
