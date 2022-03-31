const DECIMALS = 18;

const validateTokenAmount = (value: string): boolean => {
  const float = parseFloat(value);
  if (!float) {
    return false;
  }
  if (float <= 0) {
    return false;
  }
  const integer = Math.round(float * 10 ** DECIMALS);
  if (integer == 0) {
    return false;
  }
  return true;
};

export default validateTokenAmount;
