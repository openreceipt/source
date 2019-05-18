const between = (x: number, min: number, max: number) => {
  return (x - min) * (x - max) <= 0;
};

export default between;
