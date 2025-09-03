export interface Theme {
  id: string;
  name: string;
  color: string;
}

export const themeColors: Theme[] = [
  { id: 'light', name: 'Light', color: '#fdf8f4' },
  { id: 'warm', name: 'Warm', color: '#fcf5f0' },
  { id: 'cool', name: 'Cool', color: '#f0f4fc' },
  { id: 'red', name: 'Red', color: '#fde8e8' },
  { id: 'yellow', name: 'Yellow', color: '#ffeb3b' }

]