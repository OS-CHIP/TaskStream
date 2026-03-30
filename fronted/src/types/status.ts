export interface Status {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  isDefault?: boolean;
  applicableTypes: string[]; // 这个状态适用的类型（需求、任务、bug、测试验证）
}