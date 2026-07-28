export const classNames = (...args: any) => {
  return args
    .reduce((initialValue: string[], currentValue: any) => {
      if (currentValue !== null && currentValue !== undefined) {
        if (typeof currentValue === 'string') {
          initialValue.push(currentValue);
        } else {
          for (const key in currentValue) {
            if (currentValue[key]) {
              initialValue.push(key);
            }
          }
        }
      }
      return initialValue;
    }, [])
    .join(' ');
};
