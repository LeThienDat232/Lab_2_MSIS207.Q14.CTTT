// src/data-service.ts
export interface DataPoint {
  x: number;                 
  y: number;                 
  label?: string;            
  category?: 'A' | 'B' | 'C'; 
  t?: number;                 
}

export class DataService {
  private cats: Array<'A'|'B'|'C'> = ['A', 'B', 'C'];

  
  generate(n = 12, category?: 'A'|'B'|'C'): DataPoint[] {
    const useCat = category && this.cats.includes(category) ? category : undefined;
    return Array.from({ length: n }, (_, i) => ({
      x: i,
      y: Math.round(10 + Math.random() * 90),
      label: `P${i + 1}`,
      category: useCat ?? this.cats[i % this.cats.length],
      t: Date.now()
    }));
  }
}
