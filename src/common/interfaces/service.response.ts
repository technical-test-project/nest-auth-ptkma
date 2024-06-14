export interface ServiceResponse {
  status: boolean;
  message: string;
  data: any;
  errors: any | { field: string; message: string }[];
}
