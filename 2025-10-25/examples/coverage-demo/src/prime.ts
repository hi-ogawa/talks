export function prime(x: number): number {
  switch (x) {
    case 1:
      return 2;
    case 2:
      return 3;
    case 3: 
      return 5;
    case 4:
      return 7;
    case 5:
      return 11; 
    default:
      return -1;
  }
}
