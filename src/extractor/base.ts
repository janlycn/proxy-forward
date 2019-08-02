import { ExtractProxy } from '../common/entry';

// 提取接口定义

export interface Extractor {
  fetch(): Promise<ExtractProxy[]>;
}
