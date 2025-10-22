export interface ICalculation {
  id: number;
  parent_id: number | null;
  user_id: number;
  operation: 'start' | '+' | '-' | '*' | '/';
  number: number;
  result: number;
  depth: number;
  created_at: string;
}

export interface ICalculationWithUser extends ICalculation {
  username: string;
}

export interface ICalculationNode extends ICalculationWithUser {
  children: ICalculationNode[];
}

export interface ICreateStartingNumberInput {
  number: number;
}

export interface IAddOperationInput {
  operation: '+' | '-' | '*' | '/';
  number: number;
}

export interface ICalculationRow {
  id: number;
  parent_id: number | null;
  user_id: number;
  username: string;
  operation: string;
  number: number;
  result: number;
  depth: number;
  created_at: string;
}
